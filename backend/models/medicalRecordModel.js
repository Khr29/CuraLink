import mongoose from "mongoose";

// One medical record per completed appointment. A doctor drafts it, then
// finalizes it — after that it's locked: any further edit must go through
// amendRecord (medicalRecordController.js), which archives the prior state
// into `versions` rather than overwriting it silently.
const prescriptionItemSchema = new mongoose.Schema(
  {
    medicine: { type: String, required: true, trim: true },
    dosage: { type: String, default: "", trim: true },
    duration: { type: String, default: "", trim: true },
    instructions: { type: String, default: "", trim: true },
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
