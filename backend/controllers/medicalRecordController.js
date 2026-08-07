import medicalRecordModel from "../models/medicalRecordModel.js";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import { v2 as cloudinary } from "cloudinary";
import { sanitizeText } from "../utils/sanitize.js";
import { logAction, AUDIT_ACTIONS } from "../utils/auditLog.js";
import { DRUG_FORMS, FREQUENCIES, ROUTES, TIMING_OPTIONS } from "../constants/prescription.js";

const MAX_DIAGNOSIS_LEN = 3000;
const MAX_NOTES_LEN = 5000;
const MAX_PRESCRIPTION_ITEMS = 30;

const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

// Writes both the legacy (medicine/dosage) and structured (medicineName/dose)
// fields in sync on every save, so the item is recognized as non-empty
// regardless of which name a reader still checks, and so nothing that only
// reads the old fields ever sees a blank row for a prescription written
// through the new structured form.
const sanitizePrescription = (prescription) => {
  if (!Array.isArray(prescription)) return [];
  return prescription.slice(0, MAX_PRESCRIPTION_ITEMS).map((item) => {
    const medicineName = sanitizeText(item?.medicineName || item?.medicine || "", { maxLength: 200 });
    const dose = sanitizeText(item?.dose || item?.dosage || "", { maxLength: 100 });
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
      quantity: sanitizeText(item?.quantity || "", { maxLength: 40 }),
    };
  }).filter((item) => item.medicineName);
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

    const record = await medicalRecordModel.findOne({ appointmentId });
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
    if (prescription !== undefined) record.prescription = sanitizePrescription(prescription);

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
      .populate("doctorId", "name speciality image")
      .populate("patientId", "name image")
      .populate("hospitalId", "name");

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

// Patient: every record belonging to them
export const getMyRecords = async (req, res) => {
  try {
    const records = await medicalRecordModel
      .find({ patientId: req.userId })
      .populate("doctorId", "name speciality image")
      .populate("hospitalId", "name")
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
