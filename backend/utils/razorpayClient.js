import razorpay from "razorpay";

// Single Razorpay client, in its own module so tests can stub
// `razorpayInstance.orders.create/fetch` without any network access.
//
// The SDK throws at construction when a key is missing, and this module is
// imported at startup — so an unset RAZORPAY_KEY_ID/SECRET used to crash the
// whole API, including the public doctor/hospital lists. Fall back to inert
// placeholders instead: Razorpay then rejects order creation (caught and
// reported by the payment handlers) and only payments are affected.
// utils/integrationConfig.js warns about the missing variables at startup.
export const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_not_configured",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "not_configured",
});
