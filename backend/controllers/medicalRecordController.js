import QRCode from "qrcode";
import medicalRecordModel from "../models/medicalRecordModel.js";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import pharmacyModel from "../models/pharmacyModel.js";
import auditLogModel from "../models/auditLogModel.js";
import { v2 as cloudinary } from "cloudinary";
import { sanitizeText } from "../utils/sanitize.js";
import { logAction, AUDIT_ACTIONS } from "../utils/auditLog.js";
import { DRUG_FORMS, FREQUENCIES, ROUTES, TIMING_OPTIONS } from "../constants/prescription.js";
import { generatePrescriptionId, generateVerificationToken } from "../utils/prescriptionId.js";

const MAX_DIAGNOSIS_LEN = 3000;
const MAX_NOTES_LEN = 5000;
const MAX_PRESCRIPTION_ITEMS = 30;
const MAX_DISPENSE_NOTES_LEN = 500;
const MAX_REVOKE_REASON_LEN = 500;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

// Extracts a leading whole number from the doctor's free-text quantity field
// ("30 tablets" -> 30, "30" -> 30, "" or non-numeric -> null). Never surfaced
// to or entered by the doctor directly — this only drives the pharmacy
// dispensing guard (pharmacyDispense below), so the prescribing form and
// workflow are completely unchanged.
const parseLeadingQuantity = (str) => {
  const match = String(str || "").match(/\d+/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

// Writes both the legacy (medicine/dosage) and structured (medicineName/dose)
// fields in sync on every save, so the item is recognized as non-empty
// regardless of which name a reader still checks, and so nothing that only
// reads the old fields ever sees a blank row for a prescription written
// through the new structured form.
//
// `previousPrescription` (only passed by amendRecord) lets an amendment
// carry forward a medicine's dispensing progress instead of resetting it —
// but only when the medicine at that position is unchanged, so a doctor
// swapping in a genuinely different drug at the same row never inherits
// another drug's dispensed count. Clamped so a shrunk quantity can never
// leave dispensedQuantity > quantityPrescribed.
const sanitizePrescription = (prescription, previousPrescription = []) => {
  if (!Array.isArray(prescription)) return [];
  return prescription.slice(0, MAX_PRESCRIPTION_ITEMS).map((item, index) => {
    const medicineName = sanitizeText(item?.medicineName || item?.medicine || "", { maxLength: 200 });
    const dose = sanitizeText(item?.dose || item?.dosage || "", { maxLength: 100 });
    const quantity = sanitizeText(item?.quantity || "", { maxLength: 40 });
    const quantityPrescribed = parseLeadingQuantity(quantity) || 1;

    const prev = previousPrescription[index];
    const carryForward = prev && prev.medicineName === medicineName;
    const dispensedQuantity = carryForward ? Math.min(prev.dispensedQuantity || 0, quantityPrescribed) : 0;

    return {
      medicine: medicineName,
      dosage: dose,
      duration: sanitizeText(item?.duration || "", { maxLength: 100 }),
      instructions: sanitizeText(item?.instructions || "", { maxLength: 500 }),

      medicineName,
      strength: sanitizeText(item?.strength || "", { maxLength: 40 }),
      form: oneOf(item?.form, DRUG_FORMS, "Tablet"),
      dose,
      frequency: oneOf(item?.frequency, FREQUENCIES, ""),
      route: oneOf(item?.route, ROUTES, "Oral"),
      timing: oneOf(item?.timing, TIMING_OPTIONS, "Anytime"),
      quantity,
      quantityPrescribed,
      dispensedQuantity,
    };
  }).filter((item) => item.medicineName);
};

// Self-healing backfill for quantityPrescribed. Records finalized before
// this field's computation existed (or whose prescription array was last
// written by an older server process) have it sitting at the schema
// default (1) even though the doctor's real prescribed quantity is right
// there in the free-text `quantity` field — sanitizePrescription only ever
// computes this on a fresh draft save/amend, so a record that hasn't been
// touched since never got the correct value. This recomputes it from the
// same authoritative source (`quantity`) the first time such a mismatch is
// found and persists the correction, mirroring ensurePrescriptionIdentity's
// lazy-migration pattern. Only ever widens: an item with dispensing
// progress that would exceed the freshly-derived total is left untouched
// rather than risk dispensedQuantity > quantityPrescribed.
const backfillQuantityPrescribed = async (record) => {
  let changed = false;
  record.prescription.forEach((item) => {
    const derived = parseLeadingQuantity(item.quantity);
    if (derived && derived !== item.quantityPrescribed && (item.dispensedQuantity || 0) <= derived) {
      item.quantityPrescribed = derived;
      changed = true;
    }
  });
  if (changed) await record.save();
  return record;
};

// Public — lets both admin apps and the patient frontend fetch the same
// canonical dropdown options instead of hardcoding a second copy.
export const getPrescriptionOptions = (req, res) => {
  res.json({ success: true, options: { forms: DRUG_FORMS, frequencies: FREQUENCIES, routes: ROUTES, timings: TIMING_OPTIONS } });
};

// A doctor may only touch a record for an appointment they actually
// handled, and only once it's completed — this is the core ownership gate
// every write endpoint below funnels through.
const getOwnedCompletedAppointment = async (appointmentId, docId) => {
  const appointment = await appointmentModel.findById(appointmentId);
  if (!appointment) return { error: "Appointment not found" };
  if (appointment.docId.toString() !== docId) return { error: "Not authorized for this appointment" };
  if (!appointment.isCompleted) return { error: "Medical records can only be created for completed appointments" };
  return { appointment };
};

// Assigns the public prescription ID + verification token the first time a
// finalized record actually needs one (on finalize, and defensively for
// pre-existing finalized records that predate this feature — no bulk
// migration required, they simply get one lazily on first read). A record
// keeps the same identity for its lifetime once assigned.
const ensurePrescriptionIdentity = async (record) => {
  if (record.prescriptionId && record.verificationToken) return record;
  record.prescriptionId = await generatePrescriptionId();
  record.verificationToken = generateVerificationToken();
  if (record.prescriptionStatus === "none") record.prescriptionStatus = "active";
  if (record.dispensing.status === "not_applicable") record.dispensing.status = "pending";
  await record.save();
  return record;
};

// =============================
// Doctor: create/update a DRAFT record (freely editable pre-finalization)
// =============================
export const saveDraftRecord = async (req, res) => {
  try {
    const docId = req.docId;
    const { appointmentId, diagnosis, notes, prescription } = req.body;

    const { appointment, error } = await getOwnedCompletedAppointment(appointmentId, docId);
    if (error) return res.json({ success: false, message: error });

    let record = await medicalRecordModel.findOne({ appointmentId });
    if (record && record.status === "finalized") {
      return res.json({
        success: false,
        message: "This record is finalized — use the amend endpoint to make changes",
      });
    }

    const doctor = await doctorModel.findById(docId).select("hospitalId");

    const fields = {
      diagnosis: sanitizeText(diagnosis || "", { maxLength: MAX_DIAGNOSIS_LEN }),
      notes: sanitizeText(notes || "", { maxLength: MAX_NOTES_LEN }),
      prescription: sanitizePrescription(prescription),
    };

    if (record) {
      Object.assign(record, fields);
      await record.save();
    } else {
      record = await medicalRecordModel.create({
        appointmentId,
        patientId: appointment.userId,
        doctorId: docId,
        hospitalId: doctor?.hospitalId || null,
        ...fields,
      });

      await logAction({
        req,
        actorType: "doctor",
        actorId: docId,
        action: AUDIT_ACTIONS.MEDICAL_RECORD_CREATED,
        target: { type: "medicalRecord", id: record._id, label: appointmentId },
        status: "success",
      });
    }

    res.json({ success: true, message: "Draft saved", record });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Doctor: finalize — locks the record against silent overwrite
// =============================
export const finalizeRecord = async (req, res) => {
  try {
    const docId = req.docId;
    const { appointmentId } = req.body;

    const { error } = await getOwnedCompletedAppointment(appointmentId, docId);
    if (error) return res.json({ success: false, message: error });

    const record = await medicalRecordModel.findOne({ appointmentId }).select("+verificationToken");
    if (!record) {
      return res.json({ success: false, message: "Save a draft before finalizing" });
    }
    if (record.status === "finalized") {
      return res.json({ success: false, message: "Record is already finalized" });
    }
    if (!record.diagnosis.trim()) {
      return res.json({ success: false, message: "Diagnosis is required before finalizing" });
    }

    record.status = "finalized";
    record.finalizedAt = new Date();

    // Every medication in this record must itself be minimally complete —
    // backend-authoritative, not just a frontend nicety (a doctor could
    // otherwise finalize a prescription missing dose/frequency).
    const incomplete = record.prescription.find(
      (item) => !item.medicineName?.trim() || !item.dose?.trim() || !item.frequency
    );
    if (incomplete) {
      return res.json({
        success: false,
        message: `"${incomplete.medicineName || "A medication"}" is missing required fields (dose/frequency) — complete it before finalizing`,
      });
    }

    if (record.prescription.length > 0) {
      record.prescriptionId = await generatePrescriptionId();
      record.verificationToken = generateVerificationToken();
      record.prescriptionStatus = "active";
      record.dispensing.status = "pending";
    }

    await record.save();

    await logAction({
      req,
      actorType: "doctor",
      actorId: docId,
      action: AUDIT_ACTIONS.MEDICAL_RECORD_FINALIZED,
      target: { type: "medicalRecord", id: record._id, label: appointmentId },
      status: "success",
    });

    if (record.prescription.length > 0) {
      await logAction({
        req,
        actorType: "doctor",
        actorId: docId,
        action: AUDIT_ACTIONS.PRESCRIPTION_CREATED,
        target: { type: "medicalRecord", id: record._id, label: appointmentId },
        status: "success",
      });
    }

    res.json({ success: true, message: "Record finalized and locked", record });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Doctor: amend an already-finalized record — archives the previous state
// into `versions` rather than overwriting it, and records who/when/why.
// =============================
export const amendRecord = async (req, res) => {
  try {
    const docId = req.docId;
    const { appointmentId, diagnosis, notes, prescription, reason } = req.body;

    const doctor = await doctorModel.findById(docId).select("name");
    const { error } = await getOwnedCompletedAppointment(appointmentId, docId);
    if (error) return res.json({ success: false, message: error });

    const record = await medicalRecordModel.findOne({ appointmentId });
    if (!record) return res.json({ success: false, message: "Record not found" });
    if (record.status !== "finalized") {
      return res.json({
        success: false,
        message: "This record isn't finalized yet — use the draft endpoint instead",
      });
    }

    record.versions.push({
      editedAt: new Date(),
      editedBy: docId,
      editorLabel: doctor?.name || "",
      editorRole: "doctor",
      reason: sanitizeText(reason || "", { maxLength: 500 }),
      snapshot: {
        diagnosis: record.diagnosis,
        notes: record.notes,
        prescription: record.prescription,
        attachments: record.attachments,
      },
    });

    if (diagnosis !== undefined) record.diagnosis = sanitizeText(diagnosis, { maxLength: MAX_DIAGNOSIS_LEN });
    if (notes !== undefined) record.notes = sanitizeText(notes, { maxLength: MAX_NOTES_LEN });
    if (prescription !== undefined) record.prescription = sanitizePrescription(prescription, record.prescription);

    await record.save();

    await logAction({
      req,
      actorType: "doctor",
      actorId: docId,
      action: AUDIT_ACTIONS.MEDICAL_RECORD_AMENDED,
      target: { type: "medicalRecord", id: record._id, label: appointmentId },
      reason: reason || "",
      status: "success",
    });

    res.json({ success: true, message: "Record amended — previous version preserved", record });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Doctor: attach a file (report/PDF/image) to a record they own
// =============================
export const addAttachment = async (req, res) => {
  try {
    const docId = req.docId;
    const { appointmentId } = req.body;
    if (!req.file) return res.json({ success: false, message: "No file uploaded" });

    const { error } = await getOwnedCompletedAppointment(appointmentId, docId);
    if (error) return res.json({ success: false, message: error });

    const record = await medicalRecordModel.findOne({ appointmentId });
    if (!record) return res.json({ success: false, message: "Save a draft before attaching files" });

    const upload = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
    });

    const attachment = {
      url: upload.secure_url,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    if (record.status === "finalized") {
      record.versions.push({
        editedAt: new Date(),
        editedBy: docId,
        editorRole: "doctor",
        reason: "Attachment added",
        snapshot: {
          diagnosis: record.diagnosis,
          notes: record.notes,
          prescription: record.prescription,
          attachments: record.attachments,
        },
      });
    }
    record.attachments.push(attachment);
    await record.save();

    res.json({ success: true, message: "Attachment added", record });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Shared read — enforces least-privilege access per actor type.
// =============================
// record is populated (doctorId/patientId/hospitalId become sub-documents),
// so plain `.toString()` on the field no longer yields the id — it has to
// go through `._id` first.
const idOf = (value) => {
  if (!value) return null;
  return value._id ? value._id.toString() : value.toString();
};

const canView = (record, req) => {
  if (req.userId) return idOf(record.patientId) === req.userId;
  if (req.docId) return idOf(record.doctorId) === req.docId;
  if (req.hospitalId) return idOf(record.hospitalId) === req.hospitalId;
  if (req.adminEmail) return true;
  return false;
};

export const getRecordByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const record = await medicalRecordModel
      .findOne({ appointmentId })
      .populate("doctorId", "name speciality image degree licenseNumber")
      .populate("patientId", "name image")
      .populate("hospitalId", "name phone email website address");

    if (!record) return res.json({ success: false, message: "Record not found" });
    if (!canView(record, req)) {
      return res.status(403).json({ success: false, message: "Not authorized to view this record" });
    }

    res.json({ success: true, record });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Secure QR — same access as getRecordByAppointment (owner patient /
// creating doctor / owning hospital / admin). Returns a QR image encoding a
// link to the PUBLIC verification page, never the record itself — the raw
// verificationToken never reaches the browser as visible text, only baked
// into the QR image and the (necessarily shareable) verify link.
// =============================
export const getPrescriptionQr = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const record = await medicalRecordModel.findOne({ appointmentId }).select("+verificationToken");

    if (!record) return res.json({ success: false, message: "Record not found" });
    if (!canView(record, req)) {
      return res.status(403).json({ success: false, message: "Not authorized to view this record" });
    }
    if (record.status !== "finalized" || record.prescription.length === 0) {
      return res.json({ success: false, message: "No finalized prescription for this record" });
    }
    if (record.prescriptionStatus === "revoked") {
      return res.json({ success: false, message: "This prescription has been revoked" });
    }

    await ensurePrescriptionIdentity(record);

    const verifyUrl = `${FRONTEND_URL}/verify/${record.verificationToken}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 240 });

    res.json({
      success: true,
      qrDataUrl,
      verifyUrl,
      prescriptionId: record.prescriptionId,
      status: record.prescriptionStatus,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Public verification — no auth. Deliberately returns the minimum needed
// to confirm authenticity: never medical history, diagnosis, notes,
// medications, or any patient-identifying field beyond what's already on
// the printed prescription. Rate-limited (see routes) against token
// guessing even though the token itself is high-entropy.
// =============================
export const verifyPrescription = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ success: false, message: "Missing verification reference" });

    const record = await medicalRecordModel
      .findOne({ verificationToken: token })
      .select("+verificationToken")
      .populate("doctorId", "name speciality")
      .populate("hospitalId", "name");

    if (!record || record.status !== "finalized" || record.prescriptionStatus === "none") {
      await logAction({
        req,
        actorType: "system",
        action: AUDIT_ACTIONS.PRESCRIPTION_VERIFIED,
        status: "failure",
        reason: "Prescription not found",
      });
      return res.status(404).json({ success: false, message: "Prescription not found or invalid" });
    }

    await logAction({
      req,
      actorType: "system",
      action: AUDIT_ACTIONS.PRESCRIPTION_VERIFIED,
      target: { type: "medicalRecord", id: record._id, label: record.prescriptionId },
      status: "success",
    });

    res.json({
      success: true,
      verification: {
        prescriptionId: record.prescriptionId,
        status: record.prescriptionStatus, // "active" | "revoked"
        issuedAt: record.finalizedAt,
        doctor: { name: record.doctorId?.name || "", speciality: record.doctorId?.speciality || "" },
        hospital: record.hospitalId?.name || null,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// Revoke — owning doctor or admin only. One-way (revoked prescriptions
// aren't reactivated here); a fresh amendment/record covers a correction.
// =============================
export const revokePrescription = async (req, res) => {
  try {
    const { appointmentId, reason } = req.body;
    const record = await medicalRecordModel.findOne({ appointmentId });
    if (!record) return res.json({ success: false, message: "Record not found" });

    const isOwningDoctor = !!req.docId && record.doctorId.toString() === req.docId;
    const isAdmin = !!req.adminEmail;
    if (!isOwningDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to revoke this prescription" });
    }
    if (record.prescriptionStatus !== "active") {
      return res.json({ success: false, message: "Only an active prescription can be revoked" });
    }

    record.prescriptionStatus = "revoked";
    record.revokedAt = new Date();
    record.revokedBy = req.docId || null;
    await record.save();

    await logAction({
      req,
      actorType: isAdmin ? "admin" : "doctor",
      actorId: req.docId || null,
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.PRESCRIPTION_REVOKED,
      target: { type: "medicalRecord", id: record._id, label: record.prescriptionId },
      reason: sanitizeText(reason || "", { maxLength: MAX_REVOKE_REASON_LEN }),
      status: "success",
    });

    res.json({ success: true, message: "Prescription revoked", record });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Pharmacy — AUTHORIZED access, performed by an authenticated Pharmacy
// account (authPharmacy). Same verificationToken as the public QR, but
// returns the fuller set a pharmacy needs to safely dispense: medications,
// dispensing state, patient name — never diagnosis, notes, attachments, or
// any other record on this patient. Any authenticated, active pharmacy may
// verify a prescription regardless of which hospital originally prescribed
// it — a patient can fill a prescription at any pharmacy, and the
// verification token is what proves authorization, not affiliation.
// =============================
export const pharmacyVerifyPrescription = async (req, res) => {
  try {
    const { token } = req.params;
    const record = await medicalRecordModel
      .findOne({ verificationToken: token })
      .select("+verificationToken")
      .populate("doctorId", "name speciality licenseNumber")
      .populate("hospitalId", "name")
      .populate("patientId", "name");

    if (!record || record.status !== "finalized" || record.prescriptionStatus === "none") {
      await logAction({
        req,
        actorType: "pharmacy",
        actorId: req.pharmacyId,
        action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS_ATTEMPT,
        target: { type: "medicalRecord", label: "unknown token" },
        status: "failure",
        reason: "Prescription not found",
      });
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    await backfillQuantityPrescribed(record);

    const pharmacy = await pharmacyModel.findById(req.pharmacyId).select("name");
    await logAction({
      req,
      actorType: "pharmacy",
      actorId: req.pharmacyId,
      actorLabel: pharmacy?.name || "",
      action: AUDIT_ACTIONS.PRESCRIPTION_ACCESSED_BY_PHARMACY,
      target: { type: "medicalRecord", id: record._id, label: record.prescriptionId },
      status: "success",
    });

    res.json({
      success: true,
      prescription: {
        prescriptionId: record.prescriptionId,
        status: record.prescriptionStatus,
        issuedAt: record.finalizedAt,
        patient: { name: record.patientId?.name || "" },
        doctor: {
          name: record.doctorId?.name || "",
          speciality: record.doctorId?.speciality || "",
          licenseNumber: record.doctorId?.licenseNumber || "",
        },
        hospital: record.hospitalId?.name || null,
        // Least-privilege projection — only dispensing-relevant medicine
        // fields, plus the per-medicine quantity math a pharmacist needs to
        // safely partial-dispense. Never diagnosis/notes/attachments.
        medications: record.prescription.map((item, index) => {
          const quantityPrescribed = item.quantityPrescribed ?? 1;
          const dispensedQuantity = item.dispensedQuantity ?? 0;
          return {
            medicineIndex: index,
            medicineName: item.medicineName || item.medicine || "",
            strength: item.strength,
            form: item.form,
            dose: item.dose || item.dosage || "",
            frequency: item.frequency,
            route: item.route,
            timing: item.timing,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions,
            quantityPrescribed,
            dispensedQuantity,
            remaining: Math.max(quantityPrescribed - dispensedQuantity, 0),
          };
        }),
        dispensing: record.dispensing,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// Pharmacy — record dispensing for ONE medicine on the prescription
// (authPharmacy). Refuses anything but an active prescription (draft/
// revoked/not-yet-finalized can never be dispensed). Supports partial
// dispensing: `quantity` is how many units to dispense in THIS action, not
// the new total.
//
// Over-dispensing / double-click / concurrent-request races are prevented
// the same way appointment booking prevents double-booking (userController.js)
// — a single atomic findOneAndUpdate whose filter re-checks
// "dispensedQuantity + quantity <= quantityPrescribed" against whatever the
// document's state actually is at write time, not a stale earlier read. Only
// one of two simultaneous requests for the same remaining stock can match.
// =============================
export const pharmacyDispense = async (req, res) => {
  try {
    const { token } = req.params;
    const medicineIndex = Number(req.body.medicineIndex);
    const quantity = Number(req.body.quantity);
    const notes = sanitizeText(req.body.notes || "", { maxLength: MAX_DISPENSE_NOTES_LEN });

    if (!Number.isInteger(medicineIndex) || medicineIndex < 0) {
      return res.json({ success: false, message: "Invalid medicine selected" });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.json({ success: false, message: "Quantity to dispense must be a positive whole number" });
    }

    const preRecord = await medicalRecordModel
      .findOne({ verificationToken: token })
      .select("+verificationToken prescription prescriptionStatus");
    if (!preRecord || preRecord.prescriptionStatus !== "active") {
      return res.json({ success: false, message: "This prescription is not available for dispensing" });
    }
    const targetItem = preRecord.prescription[medicineIndex];
    if (!targetItem) {
      return res.json({ success: false, message: "Medicine not found on this prescription" });
    }

    // Correct any stale quantityPrescribed (see backfillQuantityPrescribed)
    // BEFORE the atomic guard below reads it — otherwise a record that's
    // never been through pharmacyVerifyPrescription could still be guarded
    // against the wrong total.
    await backfillQuantityPrescribed(preRecord);

    const pharmacy = await pharmacyModel.findById(req.pharmacyId).select("name");

    const updated = await medicalRecordModel.findOneAndUpdate(
      {
        verificationToken: token,
        prescriptionStatus: "active",
        $expr: {
          $lte: [
            { $add: [{ $arrayElemAt: ["$prescription.dispensedQuantity", medicineIndex] }, quantity] },
            { $arrayElemAt: ["$prescription.quantityPrescribed", medicineIndex] },
          ],
        },
      },
      {
        $inc: { [`prescription.${medicineIndex}.dispensedQuantity`]: quantity },
        $push: {
          dispensingRecords: {
            pharmacyId: req.pharmacyId,
            pharmacyName: pharmacy?.name || "",
            medicineIndex,
            medicineName: targetItem.medicineName || targetItem.medicine || "",
            quantityDispensed: quantity,
            notes,
            dispensedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      // The atomic guard didn't match — re-fetch to report the real reason
      // (prescription no longer active, or not enough remaining).
      const current = await medicalRecordModel.findOne({ verificationToken: token }).select("prescription prescriptionStatus");
      if (!current || current.prescriptionStatus !== "active") {
        return res.json({ success: false, message: "This prescription is not available for dispensing" });
      }
      const currentItem = current.prescription[medicineIndex];
      const remaining = Math.max((currentItem?.quantityPrescribed ?? 0) - (currentItem?.dispensedQuantity ?? 0), 0);
      return res.json({
        success: false,
        message: `Cannot dispense ${quantity} — only ${remaining} remaining for this medicine`,
      });
    }

    // Record-level rollup, recomputed from the now-consistent per-item
    // quantities — a convenience summary for existing consumers (dashboard
    // stats, "already dispensed" checks), never the source of truth for the
    // over-dispense guard above (that's prescription[].dispensedQuantity).
    const allFull = updated.prescription.every((p) => (p.dispensedQuantity || 0) >= (p.quantityPrescribed || 1));
    const anyDispensed = updated.prescription.some((p) => (p.dispensedQuantity || 0) > 0);
    const dispensingSummary = {
      status: allFull ? "dispensed" : anyDispensed ? "partially_dispensed" : "pending",
      dispensedBy: req.pharmacyId,
      dispensedByName: pharmacy?.name || "",
      dispensedAt: new Date(),
      notes,
    };
    await medicalRecordModel.updateOne({ _id: updated._id }, { $set: { dispensing: dispensingSummary } });

    await logAction({
      req,
      actorType: "pharmacy",
      actorId: req.pharmacyId,
      actorLabel: pharmacy?.name || "",
      action: AUDIT_ACTIONS.PRESCRIPTION_DISPENSED,
      target: { type: "medicalRecord", id: updated._id, label: updated.prescriptionId },
      newValue: { medicineIndex, quantity, resultingStatus: dispensingSummary.status },
      status: "success",
    });

    res.json({ success: true, message: "Dispensing recorded", dispensing: dispensingSummary });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Pharmacy — dashboard stats for the logged-in Pharmacy account. Built from
// this pharmacy's own dispensing activity (medical records it has dispensed
// against, plus its own audit-log entries) — not a global queue, since any
// pharmacy may verify/dispense any patient's prescription and there's no
// per-pharmacy "incoming" queue to track.
// =============================
export const getPharmacyStats = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [verifiedToday, dispensedToday, dispensedTotal, partiallyDispensed, revokedTouched] = await Promise.all([
      auditLogModel.countDocuments({
        actorType: "pharmacy",
        actorId: pharmacyId,
        action: AUDIT_ACTIONS.PRESCRIPTION_ACCESSED_BY_PHARMACY,
        createdAt: { $gte: startOfToday },
      }),
      auditLogModel.countDocuments({
        actorType: "pharmacy",
        actorId: pharmacyId,
        action: AUDIT_ACTIONS.PRESCRIPTION_DISPENSED,
        createdAt: { $gte: startOfToday },
      }),
      medicalRecordModel.countDocuments({ "dispensing.dispensedBy": pharmacyId, "dispensing.status": "dispensed" }),
      medicalRecordModel.countDocuments({ "dispensing.dispensedBy": pharmacyId, "dispensing.status": "partially_dispensed" }),
      medicalRecordModel.countDocuments({ "dispensing.dispensedBy": pharmacyId, prescriptionStatus: "revoked" }),
    ]);

    res.json({
      success: true,
      stats: {
        verifiedToday,
        dispensedToday,
        dispensedTotal,
        partiallyDispensed,
        revokedTouched,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Pharmacy — dispensing history for the logged-in Pharmacy account. One row
// per dispense ACTION (from the append-only dispensingRecords ledger), not
// one row per prescription — a prescription dispensed in two partial visits
// shows both transactions, never collapsed/overwritten into a single latest
// state. Scoped strictly to entries this pharmacy actually performed.
// =============================
export const getPharmacyHistory = async (req, res) => {
  try {
    const records = await medicalRecordModel
      .find({ "dispensingRecords.pharmacyId": req.pharmacyId })
      .select("prescriptionId prescriptionStatus dispensingRecords finalizedAt doctorId patientId hospitalId")
      .populate("doctorId", "name speciality")
      .populate("patientId", "name")
      .populate("hospitalId", "name")
      .lean();

    const transactions = [];
    for (const r of records) {
      for (const entry of r.dispensingRecords || []) {
        if (String(entry.pharmacyId) !== String(req.pharmacyId)) continue;
        transactions.push({
          prescriptionId: r.prescriptionId,
          status: r.prescriptionStatus,
          issuedAt: r.finalizedAt,
          patient: { name: r.patientId?.name || "" },
          doctor: { name: r.doctorId?.name || "", speciality: r.doctorId?.speciality || "" },
          prescribingHospital: r.hospitalId?.name || null,
          medicineName: entry.medicineName,
          quantityDispensed: entry.quantityDispensed,
          notes: entry.notes,
          dispensedAt: entry.dispensedAt,
        });
      }
    }
    transactions.sort((a, b) => new Date(b.dispensedAt) - new Date(a.dispensedAt));

    res.json({ success: true, history: transactions.slice(0, 100) });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Patient: every record belonging to them. Optional ?status= and
// ?hasPrescription=true narrow the query — omitting both keeps the original
// unfiltered behavior, so existing callers (Medical Records page) are
// unaffected. Used by the Prescriptions page to fetch only finalized
// records that actually have medicines on them.
export const getMyRecords = async (req, res) => {
  try {
    const { status, hasPrescription } = req.query;
    const filter = { patientId: req.userId };
    if (status) filter.status = status;
    if (hasPrescription === "true") filter["prescription.0"] = { $exists: true };

    const records = await medicalRecordModel
      .find(filter)
      .populate("doctorId", "name speciality image degree licenseNumber")
      .populate("hospitalId", "name phone email website address")
      .sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Doctor: every record they authored
export const getDoctorRecords = async (req, res) => {
  try {
    const records = await medicalRecordModel
      .find({ doctorId: req.docId })
      .populate("patientId", "name image")
      .sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Hospital: every record created by one of their own doctors
export const getHospitalRecords = async (req, res) => {
  try {
    const records = await medicalRecordModel
      .find({ hospitalId: req.hospitalId })
      .populate("doctorId", "name speciality")
      .populate("patientId", "name image")
      .sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
