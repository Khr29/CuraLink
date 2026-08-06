import mongoose from "mongoose";

// Short-lived one-time codes for password reset and email verification.
// Only the hash is ever stored. TTL-indexed so expired codes are dropped
// automatically instead of accumulating forever.
const otpSchema = new mongoose.Schema(
  {
    actorType: {
      type: String,
      enum: ["doctor", "hospital", "user"],
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ["password_reset", "email_verification"],
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

otpSchema.index({ actorType: 1, actorId: 1, purpose: 1, createdAt: -1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const otpModel = mongoose.models.otp || mongoose.model("otp", otpSchema);

export default otpModel;
