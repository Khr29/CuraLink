// Names of integration settings that are unset, so startup can warn instead of
// the failure showing up later as a silent email, a failed upload or a refused
// payment. Names only — values are never read into a message.
const isSet = (v) => typeof v === "string" && v.trim() !== "";

export const getMissingIntegrationConfig = (env = process.env) => {
  const groups = {
    "image uploads (Cloudinary)": ["CLOUDINARY_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_SECRET_KEY"],
    "payments (Razorpay)": ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "CURRENCY"],
    "email (Gmail)": ["EMAIL_USER", "EMAIL_PASS"],
    "browser access (CORS)": ["CORS_ORIGIN"],
  };
  const missing = [];
  for (const [feature, names] of Object.entries(groups)) {
    const unset = names.filter((n) => !isSet(env[n]));
    if (unset.length) missing.push({ feature, names: unset });
  }
  return missing;
};

// Production-only advice about cookies: the patient site, admin site and API are
// on different onrender.com hosts (cross-site), so SameSite must be "none".
export const getCookieAdvice = (env = process.env) =>
  env.NODE_ENV === "production" && String(env.COOKIE_SAME_SITE || "lax").toLowerCase() !== "none"
    ? 'COOKIE_SAME_SITE is not "none": logins will not survive token refresh if the frontend, admin and API are on different sites.'
    : null;
