// Refresh tokens travel as httpOnly cookies (never reachable from JS, so an
// XSS bug can't exfiltrate them) — one distinct cookie name per actor type
// so the four panels never collide on the same browser/domain.
export const REFRESH_COOKIE_NAMES = {
  user: "curalink_user_rt",
  doctor: "curalink_doctor_rt",
  hospital: "curalink_hospital_rt",
  admin: "curalink_admin_rt",
  pharmacy: "curalink_pharmacy_rt",
};

const isProd = process.env.NODE_ENV === "production";

// `site` (for SameSite purposes) ignores port, so this works unmodified for
// local dev where frontend/admin/backend all run on localhost at different
// ports. In production, set COOKIE_SAME_SITE=none + COOKIE_SECURE=true if
// the frontend and API end up on genuinely different domains.
const secure = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === "true"
  : isProd;
const sameSite = process.env.COOKIE_SAME_SITE || "lax";

export const refreshCookieOptions = (rememberMe) => ({
  httpOnly: true,
  secure,
  sameSite,
  path: "/",
  maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
});

export const clearCookieOptions = () => ({
  httpOnly: true,
  secure,
  sameSite,
  path: "/",
});
