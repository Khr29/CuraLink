import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    // Who performed the action. Admin has no DB row (env-var credentials),
    // so actorId is nullable and actorLabel is always stored as a readable
    // snapshot (email/name) that survives the actor later being deleted.
    actorType: {
      type: String,
      enum: ["admin", "doctor", "hospital", "pharmacy", "user", "system"],
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    actorLabel: {
      type: String,
      default: "",
    },

    // Fixed action name, e.g. "DOCTOR_DELETED" — see backend/utils/auditLog.js
    // for the canonical list of action constants.
    action: {
      type: String,
      required: true,
    },

    // What the action was performed on.
    target: {
      type: {
        type: String,
        default: "",
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
      label: {
        type: String,
        default: "",
      },
    },

    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },

    ip: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },
    reason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

auditLogSchema.index({ actorType: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ "target.type": 1 });

const auditLogModel =
  mongoose.models.auditLog || mongoose.model("auditLog", auditLogSchema);

export default auditLogModel;
