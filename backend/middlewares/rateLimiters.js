import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { logAction, AUDIT_ACTIONS } from "../utils/auditLog.js";

// ============================================================
// Identity / role resolution
// ============================================================
// Rate limiters run before the real authX middleware has parsed the token
// (they're mounted globally or ahead of the route handler), so this does a
// best-effort, UNVERIFIED decode of whichever token header is present —
// purely to pick a rate-limit tier. It never grants access: real
// authorization still happens downstream in authUser/authDoctor/
// authHospital/authAdmin, which do verify the signature. Worst case a
// forged token earns a more generous *rate limit* tier, nothing more.
const resolveIdentity = (req) => {
  const headers = req.headers || {};
  try {
    if (headers.atoken) {
      const decoded = jwt.decode(headers.atoken);
      if (decoded?.email) return { role: "admin", key: `admin:${decoded.email}` };
    }
    if (headers.dtoken) {
      const decoded = jwt.decode(headers.dtoken);
      if (decoded?.id) return { role: "doctor", key: `doctor:${decoded.id}` };
    }
    if (headers.htoken) {
      const decoded = jwt.decode(headers.htoken);
      if (decoded?.id) return { role: "hospital", key: `hospital:${decoded.id}` };
    }
    if (headers.token) {
      const decoded = jwt.decode(headers.token);
      if (decoded?.id) return { role: "user", key: `user:${decoded.id}` };
    }
  } catch (e) {
    // Malformed token — fall through to anonymous/IP-keyed.
  }
  const ip =
    headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || req.socket?.remoteAddress || "unknown";
  return { role: "anonymous", key: `ip:${ip}` };
};

// ============================================================
// Dev vs. production
// ============================================================
// DISABLE_RATE_LIMITING=true fully bypasses every limiter below (local
// testing only — never set this in production). Otherwise, outside
// NODE_ENV=production every limit is multiplied up so iterating locally
// never gets interrupted, while the real thresholds still apply in prod.
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const RATE_LIMITING_DISABLED = process.env.DISABLE_RATE_LIMITING === "true";
const DEV_MULTIPLIER = IS_PRODUCTION ? 1 : 10;

// ============================================================
// Shared "exceeded" handler — logs the event for admin-only monitoring
// (GET /api/admin/audit-logs, action RATE_LIMIT_EXCEEDED) and returns a
// friendly, non-technical message plus a Retry-After the frontend can
// read instead of a raw "Request failed with status code 429".
// ============================================================
const makeHandler = (label, friendlyMessage) => (req, res) => {
  const { role, key } = resolveIdentity(req);
  const resetTime = req.rateLimit?.resetTime ? new Date(req.rateLimit.resetTime).getTime() : Date.now() + 60000;
  const retryAfterSeconds = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));

  logAction({
    req,
    actorType: role === "anonymous" ? "system" : role,
    actorLabel: key,
    action: AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
    target: { type: "endpoint", label: `${req.method} ${req.originalUrl}` },
    status: "failure",
    reason: label,
  }).catch(() => {});

  res.setHeader("Retry-After", String(retryAfterSeconds));
  res.status(429).json({
    success: false,
    message: friendlyMessage,
    retryAfter: retryAfterSeconds,
  });
};

// Builds a fixed-window limiter for a single sensitive, mostly-anonymous
// endpoint (login/register/forgot-password/OTP/review/booking) — these are
// the *only* things this app rate-limits; see server.js for why the old
// blanket "every /api request" limiter was removed.
const make = (label, windowMs, max, friendlyMessage) =>
  rateLimit({
    windowMs,
    max: RATE_LIMITING_DISABLED ? 0 : Math.round(max * DEV_MULTIPLIER),
    skip: () => RATE_LIMITING_DISABLED,
    standardHeaders: true,
    legacyHeaders: false,
    handler: makeHandler(label, friendlyMessage),
  });

export const loginLimiter = make(
  "login",
  10 * 60 * 1000,
  10,
  "Too many login attempts. Please wait a few minutes and try again."
);

export const registerLimiter = make(
  "register",
  60 * 60 * 1000,
  8,
  "Too many registration attempts. Please try again later."
);

export const forgotPasswordLimiter = make(
  "forgot-password",
  60 * 60 * 1000,
  5,
  "Too many password reset requests. Please try again later."
);

export const otpVerifyLimiter = make(
  "otp-verify",
  10 * 60 * 1000,
  8,
  "Too many verification attempts. Please wait a few minutes and try again."
);

export const reviewLimiter = make(
  "review-submit",
  60 * 60 * 1000,
  8,
  "You're submitting reviews too quickly. Please try again later."
);

export const bookingLimiter = make(
  "appointment-booking",
  10 * 60 * 1000,
  15,
  "Too many booking attempts. Please wait a moment and try again."
);

// ============================================================
// General API safety net — NOT a per-endpoint security control (those are
// the limiters above). This exists purely to bound genuine abuse/flooding
// on the rest of the API, tiered by role so it never interferes with real
// usage: doctors/hospitals get a high ceiling for normal management work,
// patients get a generous one for normal browsing, admins are exempt
// entirely (Task 4 — "administrators should be exempt from non-security
// rate limiting"). A short 5-minute window means even brushing the ceiling
// recovers fast (burst-friendly) instead of a rigid 15-minute lockout.
// ============================================================
const ROLE_LIMITS = {
  admin: Infinity, // exempt — see skip() below, never actually counted
  doctor: 1200,
  hospital: 1200,
  user: 600,
  anonymous: 300,
};

export const generalApiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (RATE_LIMITING_DISABLED) return true;
    return resolveIdentity(req).role === "admin";
  },
  keyGenerator: (req) => resolveIdentity(req).key,
  max: (req) => Math.round((ROLE_LIMITS[resolveIdentity(req).role] || ROLE_LIMITS.anonymous) * DEV_MULTIPLIER),
  handler: makeHandler(
    "general-api",
    "You're making requests very quickly. Please wait a few seconds and try again."
  ),
});
