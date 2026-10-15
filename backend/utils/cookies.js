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

// `site` (for SameSite purposes) ignores port, so this works unmodified for
// local dev where frontend/admin/backend all run on localhost at different
// ports. In production, set COOKIE_SAME_SITE=none + COOKIE_SECURE=true if
// the frontend and API end up on genuinely different domains.
//
// Read lazily (per call, not at import) so set and clear can never disagree
// and the policy is testable. A browser only honours a clearing Set-Cookie
// whose Secure/SameSite/Path match the original (and rejects SameSite=None
// without Secure), so EVERY cookie write/clear must go through these.
const cookieFlags = (env = process.env) => {
  const sameSite = env.COOKIE_SAME_SITE || "lax";
  return {
    httpOnly: true,
    // Browsers silently DROP a SameSite=None cookie that is not Secure, which
    // would make every login fail to persist — so None always implies Secure,
    // whatever COOKIE_SECURE says.
    secure:
      String(sameSite).toLowerCase() === "none"
        ? true
        : env.COOKIE_SECURE
          ? env.COOKIE_SECURE === "true"
          : env.NODE_ENV === "production",
    sameSite,
    path: "/",
  };
};

export const refreshCookieOptions = (rememberMe, env = process.env) => ({
  ...cookieFlags(env),
  maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
});

export const clearCookieOptions = (env = process.env) => cookieFlags(env);
