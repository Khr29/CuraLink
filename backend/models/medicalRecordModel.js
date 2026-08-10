import mongoose from "mongoose";
import { DRUG_FORMS, FREQUENCIES, ROUTES, TIMING_OPTIONS } from "../constants/prescription.js";

// One medical record per completed appointment. A doctor drafts it, then
// finalizes it — after that it's locked: any further edit must go through
// amendRecord (medicalRecordController.js), which archives the prior state
// into `versions` rather than overwriting it silently.
//
// `medicine`/`dosage` are the original free-text fields — kept (not
// removed) so pre-existing records stay valid and readable with zero
// migration. `sanitizePrescription` in medicalRecordController.js keeps
// them in sync with `medicineName`/`dose` on every write going forward;
// anything still reading the old fields keeps working unchanged.
const prescriptionItemSchema = new mongoose.Schema(
  {
    medicine: { type: String, required: true, trim: true }, // deprecated, mirrors medicineName
    dosage: { type: String, default: "", trim: true }, // deprecated, mirrors dose
    duration: { type: String, default: "", trim: true },
    instructions: { type: String, default: "", trim: true },

    medicineName: { type: String, default: "", trim: true },
    strength: { type: String, default: "", trim: true },
    form: { type: String, enum: DRUG_FORMS, default: "Tablet" },
    dose: { type: String, default: "", trim: true },
    frequency: { type: String, enum: [...FREQUENCIES, ""], default: "" },
    route: { type: String, enum: ROUTES, default: "Oral" },
    timing: { type: String, enum: TIMING_OPTIONS, default: "Anytime" },
    quantity: { type: String, default: "", trim: true },

    // Numeric dispensing counters — derived from `quantity` (free text, e.g.
    // "30 tablets") by medicalRecordController.js's parseLeadingQuantity,
    // never entered directly by the doctor, so the prescribing form/workflow
    // is unchanged. Defaults to 1 when `quantity` has no parseable leading
    // number, meaning that item is treated as a single dispense-once unit
    // rather than tracked in fractional amounts.
    quantityPrescribed: { type: Number, default: 1, min: 1 },
    dispensedQuantity: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    fileName: { type: String, default: "" },
    fileType: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const versionSchema = new mongoose.Schema(
  {
    editedAt: { type: Date, default: Date.now },
    editedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    editorLabel: { type: String, default: "" },
    editorRole: { type: String, enum: ["doctor", "admin"], required: true },
    reason: { type: String, default: "" },
    // Full snapshot of the editable fields *before* this edit was applied.
    snapshot: {
      diagnosis: String,
      notes: String,
      prescription: [prescriptionItemSchema],
      attachments: [attachmentSchema],
    },
  },
  { _id: false }
);

const medicalRecordSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      required: true,
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },
    // Nullable — independent doctors have no hospital to scope this to.
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
      default: null,
    },

    diagnosis: { type: String, default: "" },
    notes: { type: String, default: "" },
    prescription: { type: [prescriptionItemSchema], default: [] },
    attachments: { type: [attachmentSchema], default: [] },

    status: {
      type: String,
      enum: ["draft", "finalized"],
      default: "draft",
    },
    finalizedAt: { type: Date, default: null },

    versions: { type: [versionSchema], default: [] },

    // ==========================
    // Pharmacy / secure prescription — assigned by finalizeRecord only when
    // the record actually carries medications. Old finalized records (and
    // any record with no prescription items) simply have these at their
    // defaults — no migration, nothing reads them until they're set.
    // ==========================

    // Public-facing sequential ID (RX-2026-000142). Never used for
    // verification/authorization — see verificationToken. No `default` here
    // deliberately: a sparse unique index only skips documents where the
    // field is genuinely ABSENT — Mongoose's `default: null` would instead
    // write an explicit `null` into every record, and MongoDB's sparse
    // index treats that as a real (colliding) value, breaking as soon as a
    // second record without a prescription is created.
    prescriptionId: { type: String, unique: true, sparse: true },

    // High-entropy capability token the QR code / verify link actually
    // carries. select:false so it's never returned by a plain .find()/
    // .findOne() — every read path that legitimately needs it opts in with
    // .select("+verificationToken") explicitly. No `default` — same sparse-
    // index reasoning as prescriptionId above.
    verificationToken: { type: String, unique: true, sparse: true, select: false },

    prescriptionStatus: {
      type: String,
      enum: ["none", "active", "revoked"],
      default: "none",
    },
    revokedAt: { type: Date, default: null },
    revokedBy: { type: mongoose.Schema.Types.ObjectId, default: null },

    // Pharmacy-fulfillment status — separate from prescriptionStatus (which
    // tracks the prescription's own validity, not whether it's been filled
    // yet). Dispensing is performed by an authenticated Pharmacy account
    // (authPharmacy, backend/models/pharmacyModel.js) — dispensedBy is
    // whichever pharmacy verified/dispensed it, which is unrelated to the
    // prescribing hospital (a patient can fill a prescription at any
    // pharmacy).
    dispensing: {
      status: {
        type: String,
        enum: ["not_applicable", "pending", "partially_dispensed", "dispensed"],
        default: "not_applicable",
      },
      dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: "pharmacy", default: null },
      dispensedByName: { type: String, default: "" },
      dispensedAt: { type: Date, default: null },
      notes: { type: String, default: "" },
    },

    // Auditable, append-only dispensing ledger — one entry per dispense
    // action (never overwritten or removed), which is what actually backs
    // `dispensing` above (a convenience rollup recomputed after every
    // append). `prescription[].dispensedQuantity` is the running total per
    // medicine and the one over-dispense guard actually checks against
    // (medicalRecordController.js#pharmacyDispense) — this array exists so
    // "who dispensed what, how much, and when" can never be lost the way a
    // single overwritten object would lose it.
    dispensingRecords: {
      type: [
        {
          pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "pharmacy", required: true },
          pharmacyName: { type: String, default: "" },
          medicineIndex: { type: Number, required: true },
          medicineName: { type: String, default: "" },
          quantityDispensed: { type: Number, required: true, min: 1 },
          notes: { type: String, default: "" },
          dispensedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true, minimize: false }
);

medicalRecordSchema.index({ patientId: 1 });
medicalRecordSchema.index({ doctorId: 1 });
medicalRecordSchema.index({ hospitalId: 1 });

const medicalRecordModel =
  mongoose.models.medicalRecord ||
  mongoose.model("medicalRecord", medicalRecordSchema);

export default medicalRecordModel;
