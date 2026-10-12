import crypto from "crypto";

// Auth-critical configuration. Each of these being unset/blank must make
// authentication fail CLOSED: with ADMIN_EMAIL/ADMIN_PASSWORD undefined, an
// empty login body used to satisfy `undefined === undefined`.
export const REQUIRED_AUTH_ENV = ["JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD"];

export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

// Names only — never values.
export const getMissingAuthConfig = (env = process.env) =>
  REQUIRED_AUTH_ENV.filter((name) => !isNonEmptyString(env[name]));

export const isAdminConfigured = (env = process.env) =>
  isNonEmptyString(env.ADMIN_EMAIL) && isNonEmptyString(env.ADMIN_PASSWORD);

// Constant-time string comparison (hash first so lengths always match).
export const safeEqual = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
};

// True only when `email` is non-blank and equals the configured ADMIN_EMAIL.
export const isConfiguredAdminEmail = (email, env = process.env) =>
  isNonEmptyString(env.ADMIN_EMAIL) &&
  isNonEmptyString(email) &&
  safeEqual(email, env.ADMIN_EMAIL);

// Admin credential check. Fails closed on missing server config AND on
// missing/blank/non-string submitted credentials.
export const adminCredentialsMatch = (email, password, env = process.env) => {
  if (!isAdminConfigured(env)) return false;
  if (!isNonEmptyString(email) || !isNonEmptyString(password)) return false;
  return safeEqual(email, env.ADMIN_EMAIL) && safeEqual(password, env.ADMIN_PASSWORD);
};
