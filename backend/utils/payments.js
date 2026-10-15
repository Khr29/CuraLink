import mongoose from "mongoose";

// Pure helpers for the Razorpay flow (no I/O) so the money checks are unit-testable.

// Razorpay order ids look like "order_Abc123XYZ". Reject anything else before it
// reaches the Razorpay API (or ends up in a query string/URL there).
const ORDER_ID_RE = /^order_[A-Za-z0-9]{6,40}$/;
export const isValidRazorpayOrderId = (value) =>
  typeof value === "string" && ORDER_ID_RE.test(value);

export const isValidObjectIdString = (value) =>
  typeof value === "string" && mongoose.isValidObjectId(value) && /^[a-f\d]{24}$/i.test(value);

// Major units (e.g. rupees, possibly fractional) -> integer minor units (paise).
// Math.round avoids float noise such as 19.99 * 100 === 1998.9999999999998.
// Returns null for anything that is not a finite, positive amount.
export const toMinorUnits = (amount) => {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) return null;
  const minor = Math.round(amount * 100);
  return minor > 0 && Number.isSafeInteger(minor) ? minor : null;
};

// Configured ISO-4217 currency (e.g. "INR"), upper-cased; null if unset/invalid.
export const getConfiguredCurrency = (env = process.env) => {
  const c = typeof env.CURRENCY === "string" ? env.CURRENCY.trim().toUpperCase() : "";
  return /^[A-Z]{3}$/.test(c) ? c : null;
};

// Decides whether a Razorpay order, as fetched from Razorpay, is a complete
// payment for exactly this appointment. The order is trusted only because we
// fetched it server-side with our own key; the checks here make sure it is the
// RIGHT order (same amount/currency we would have charged), not merely a paid one.
export const checkOrderPaysAppointment = (order, appointment, env = process.env) => {
  if (!order || order.status !== "paid") return { ok: false, reason: "order_not_paid" };

  const expectedMinor = toMinorUnits(appointment?.amount);
  if (expectedMinor === null) return { ok: false, reason: "invalid_appointment_amount" };
  if (order.amount !== expectedMinor) return { ok: false, reason: "amount_mismatch" };
  if (order.amount_paid !== expectedMinor) return { ok: false, reason: "amount_paid_mismatch" };

  const currency = getConfiguredCurrency(env);
  if (!currency) return { ok: false, reason: "currency_not_configured" };
  if (typeof order.currency !== "string" || order.currency.toUpperCase() !== currency) {
    return { ok: false, reason: "currency_mismatch" };
  }
  return { ok: true };
};
