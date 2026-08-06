import bcrypt from "bcrypt";

// Shared strength rule for every password-setting flow (register, change,
// reset, admin-set hospital portal password). Backend is authoritative —
// frontend hints are just UX, never trusted on their own.
export const validatePasswordStrength = (password) => {
  if (typeof password !== "string" || password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (password.length > 128) {
    return { valid: false, message: "Password is too long" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must include a lowercase letter" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must include an uppercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must include a number" };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: "Password must include a special character" };
  }
  return { valid: true, message: "" };
};

// Keeps the last few password hashes so a "new" password can be checked for
// reuse. Called after strength validation, before saving.
const PREVIOUS_PASSWORDS_KEPT = 5;

export const applyNewPassword = async (actor, newPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPassword, salt);
  const history = actor.password
    ? [actor.password, ...(actor.previousPasswords || [])]
    : actor.previousPasswords || [];
  actor.previousPasswords = history.slice(0, PREVIOUS_PASSWORDS_KEPT);
  actor.password = hashed;
  actor.passwordChangedAt = new Date();
  await actor.save();
};

export const isPasswordReused = async (actor, newPassword) => {
  const candidates = [actor.password, ...(actor.previousPasswords || [])].filter(
    Boolean
  );
  for (const hash of candidates) {
    if (await bcrypt.compare(newPassword, hash)) return true;
  }
  return false;
};
