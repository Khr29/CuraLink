import mongoose from "mongoose";

// Tracks the doctor <-> hospital affiliation lifecycle: a doctor requesting
// to join or transfer to a hospital, or a hospital inviting a doctor.
// "Leave" has no row here — it's an immediate, unapproved doctor action
// (direct field mutation + audit log entry only). Admin "force transfer"
// also skips the pending state but still writes an already-approved row
// here so admin's "view transfer history" has one unified source.
const hospitalRequestSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
      required: true,
    },

    // Only set for transfer requests, to show where the doctor is coming from.
    fromHospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
      default: null,
    },

    type: {
      type: String,
      enum: ["join", "transfer", "invite"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    // Who initiated it — join/transfer are doctor-initiated, invite is
    // hospital-initiated, force actions are admin-initiated.
    requestedBy: {
      type: String,
      enum: ["doctor", "hospital", "admin"],
      required: true,
    },

    reason: {
      type: String,
      default: "",
    },

    respondedAt: {
      type: Date,
      default: null,
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

hospitalRequestSchema.index({ doctorId: 1 });
hospitalRequestSchema.index({ hospitalId: 1 });
hospitalRequestSchema.index({ status: 1 });

const hospitalRequestModel =
  mongoose.models.hospitalRequest ||
  mongoose.model("hospitalRequest", hospitalRequestSchema);

export default hospitalRequestModel;
