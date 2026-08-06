import validator from "validator";

// Strips markup from free-text fields (reviews, notes, medical records,
// about/description text) before it's stored — belt-and-braces alongside
// React's default output-escaping on the way back out.
export const sanitizeText = (value, { maxLength = 5000 } = {}) => {
  if (typeof value !== "string") return value;
  const withoutTags = value.replace(/<[^>]*>/g, "");
  return withoutTags.trim().slice(0, maxLength);
};

export const isSafeEmail = (email) =>
  typeof email === "string" && email.length <= 254 && validator.isEmail(email);

// Names: letters (incl. accented), spaces, and a few common punctuation
// marks used in real names (O'Brien, Anne-Marie).
export const isSafeName = (name) =>
  typeof name === "string" && /^[\p{L}\p{M}\s.'-]{2,80}$/u.test(name.trim());
