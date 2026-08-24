import mongoose from "mongoose";

// One row per issued refresh token (session). Rotated on every use — the
// old row is marked revoked and a new one created — so "active sessions"
// is always just the current non-revoked, non-expired rows for an actor.
// Admin has no DB row (env-var credentials), so actorId is nullable like
// in auditLogModel.
const refreshTokenSchema = new mongoose.Schema(
  {
    actorType: {
      type: String,
      enum: ["admin", "doctor", "hospital", "user", "pharmacy"],
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
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
    userAgent: {
      type: String,
      default: "",
    },
    ip: {
      type: String,
      default: "",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ actorType: 1, actorId: 1 });
// TTL cleanup — Mongo drops the document once expiresAt has passed.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const refreshTokenModel =
  mongoose.models.refreshToken ||
  mongoose.model("refreshToken", refreshTokenSchema);

export default refreshTokenModel;
