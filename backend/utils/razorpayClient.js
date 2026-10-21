import razorpay from "razorpay";

// Inert stand-ins used only so the SDK can be constructed without real keys.
const PLACEHOLDER_KEY_ID = "rzp_not_configured";
const PLACEHOLDER_KEY_SECRET = "not_configured";

const isRealKey = (value, placeholder) =>
  typeof value === "string" && value.trim() !== "" && value.trim() !== placeholder;

// True only when BOTH Razorpay keys are set to something other than the
// placeholders. Payment handlers check this first and never call Razorpay
// without it, so a missing key can't produce an order or a verification.
export const isRazorpayConfigured = (env = process.env) =>
  isRealKey(env.RAZORPAY_KEY_ID, PLACEHOLDER_KEY_ID) &&
  isRealKey(env.RAZORPAY_KEY_SECRET, PLACEHOLDER_KEY_SECRET);

// Single Razorpay client, in its own module so tests can stub
// `razorpayInstance.orders.create/fetch` without any network access.
//
// The SDK throws at construction when a key is missing, and this module is
// imported at startup — so an unset RAZORPAY_KEY_ID/SECRET used to crash the
// whole API, including the public doctor/hospital lists. Fall back to the
// placeholders instead; isRazorpayConfigured() keeps them from ever being used
// for a real call. utils/integrationConfig.js warns about the missing
// variables at startup.
export const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || PLACEHOLDER_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET || PLACEHOLDER_KEY_SECRET,
});
