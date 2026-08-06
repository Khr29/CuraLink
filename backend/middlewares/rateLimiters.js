import rateLimit from "express-rate-limit";

// Route-specific limits layered on top of the global /api limiter in
// server.js — these guard the endpoints that are actually attractive to
// automate against (credential stuffing, OTP brute force, review/booking
// spam), each with a window sized to the abuse pattern it stops.
const make = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
  });

export const loginLimiter = make(
  15 * 60 * 1000,
  10,
  "Too many login attempts. Please try again in 15 minutes."
);

export const registerLimiter = make(
  60 * 60 * 1000,
  10,
  "Too many registration attempts. Please try again later."
);

export const forgotPasswordLimiter = make(
  60 * 60 * 1000,
  5,
  "Too many password reset requests. Please try again later."
);

export const otpVerifyLimiter = make(
  15 * 60 * 1000,
  10,
  "Too many verification attempts. Please try again later."
);

export const reviewLimiter = make(
  60 * 60 * 1000,
  10,
  "You're submitting reviews too quickly. Please try again later."
);

export const bookingLimiter = make(
  15 * 60 * 1000,
  20,
  "Too many booking attempts. Please try again shortly."
);
