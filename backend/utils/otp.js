import crypto from "crypto";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;

export const generateOtp = () =>
  String(crypto.randomInt(100000, 1000000)); // 6-digit code

export const hashOtp = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");
