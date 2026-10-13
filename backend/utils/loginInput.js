// Validates the credentials of a login request body BEFORE any database query.
//
// A JSON body can carry objects, e.g. {"email":{"$ne":""}}. Passed straight to
// findOne({ email }) that is a MongoDB operator query matching an arbitrary
// account, which lets an attacker spray one password across accounts without
// knowing any email. Requiring plain strings closes that off.
//
// Email is normalized the same way the patient login and every account schema
// store it (trim + lowercase). Returns null for anything that is not a usable
// pair of non-empty strings.
export const readLoginCredentials = (body) => {
  const { email, password } = body || {};
  if (typeof email !== "string" || typeof password !== "string") return null;
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) return null;
  return { email: normalizedEmail, password };
};
