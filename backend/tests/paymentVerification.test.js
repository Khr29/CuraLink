import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import {
  toMinorUnits,
  getConfiguredCurrency,
  checkOrderPaysAppointment,
  isValidRazorpayOrderId,
  isValidObjectIdString,
} from "../utils/payments.js";

// --- pure helpers ---------------------------------------------------------

test("toMinorUnits rounds safely and rejects non-money values", () => {
  assert.equal(toMinorUnits(500), 50000);
  assert.equal(toMinorUnits(19.99), 1999); // 19.99 * 100 === 1998.9999999999998
  assert.equal(toMinorUnits(0.1 + 0.2), 30);
  for (const bad of [0, -5, NaN, Infinity, "500", null, undefined, {}, 1e300]) {
    assert.equal(toMinorUnits(bad), null, String(bad));
  }
});

test("getConfiguredCurrency normalizes and fails closed", () => {
  assert.equal(getConfiguredCurrency({ CURRENCY: " inr " }), "INR");
  for (const bad of [undefined, "", "RS", "INRR", "1NR"]) {
    assert.equal(getConfiguredCurrency({ CURRENCY: bad }), null, String(bad));
  }
});

test("order id / object id format validators", () => {
  assert.equal(isValidRazorpayOrderId("order_Abc123XYZ789"), true);
  for (const bad of ["", "order_", "pay_Abc123XYZ789", "order_../../x", "order_abc 123456", undefined, {}, ["order_Abc123XYZ789"]]) {
    assert.equal(isValidRazorpayOrderId(bad), false, JSON.stringify(bad));
  }
  assert.equal(isValidObjectIdString("64b7f0c2a1b2c3d4e5f60718"), true);
  for (const bad of ["abc", "", undefined, { $ne: null }, "64b7f0c2a1b2c3d4e5f6071"]) {
    assert.equal(isValidObjectIdString(bad), false, JSON.stringify(bad));
  }
});

test("checkOrderPaysAppointment: exact amount, amount_paid, currency, paid status", () => {
  const env = { CURRENCY: "INR" };
  const appt = { amount: 500 };
  const order = { status: "paid", amount: 50000, amount_paid: 50000, currency: "INR" };
  assert.deepEqual(checkOrderPaysAppointment(order, appt, env), { ok: true });
  const reason = (o, a = appt, e = env) => checkOrderPaysAppointment(o, a, e).reason;
  assert.equal(reason({ ...order, status: "created" }), "order_not_paid");
  assert.equal(reason({ ...order, amount: 100, amount_paid: 100 }), "amount_mismatch");
  assert.equal(reason({ ...order, amount_paid: 100 }), "amount_paid_mismatch");
  assert.equal(reason({ ...order, currency: "USD" }), "currency_mismatch");
  assert.equal(reason(order, appt, {}), "currency_not_configured");
  assert.equal(reason(order, { amount: 0 }), "invalid_appointment_amount");
  assert.equal(reason(null), "order_not_paid");
});

// --- controller behaviour against a local database, Razorpay stubbed ------

process.env.JWT_SECRET = "test-secret-payments";
process.env.ADMIN_EMAIL = "admin@payments.test";
process.env.RAZORPAY_KEY_ID ??= "rzp_test_dummy";
process.env.RAZORPAY_KEY_SECRET ??= "dummy_secret";

const TEST_URI = `mongodb://127.0.0.1:27017/curalink_test_payments_${process.pid}`;
const sentMail = [];
const savedCurrency = process.env.CURRENCY;
process.env.CURRENCY = "INR";

let skip = false;
let ctl, razorpayInstance, appointmentModel;
let realOrders;
const patientId = String(new mongoose.Types.ObjectId());
const otherPatientId = String(new mongoose.Types.ObjectId());

before(async () => {
  try {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 2000 });
  } catch {
    skip = "local mongod not reachable";
    return;
  }
  // Never send real mail: email.js builds its transport at import time.
  nodemailer.createTransport = () => ({ sendMail: async (m) => { sentMail.push(m); } });
  ctl = await import("../controllers/userController.js");
  ({ razorpayInstance } = await import("../utils/razorpayClient.js"));
  appointmentModel = (await import("../models/appointmentModel.js")).default;
  realOrders = { create: razorpayInstance.orders.create, fetch: razorpayInstance.orders.fetch };
});

after(async () => {
  if (savedCurrency === undefined) delete process.env.CURRENCY;
  else process.env.CURRENCY = savedCurrency;
  if (skip) return;
  razorpayInstance.orders.create = realOrders.create;
  razorpayInstance.orders.fetch = realOrders.fetch;
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

const guard = (t) => {
  if (skip) { t.skip(skip); return true; }
  return false;
};

const makeAppointment = (over = {}) =>
  appointmentModel.create({
    userId: patientId,
    docId: new mongoose.Types.ObjectId(),
    slotDate: "1_1_2030",
    slotTime: "10:00",
    userData: { name: "Pat", email: "pat@payments.test" },
    docData: { name: "Dr X" },
    amount: 500,
    date: Date.now(),
    ...over,
  });

const call = async (handler, body, userId = patientId) => {
  let out;
  await handler({ body, userId }, { json: (b) => { out = b; return out; } });
  return out;
};
const paidOrder = (appt, over = {}) => ({
  id: "order_TestOrder12345",
  status: "paid",
  amount: Math.round(appt.amount * 100),
  amount_paid: Math.round(appt.amount * 100),
  currency: "INR",
  receipt: String(appt._id),
  ...over,
});
const stubFetch = (order) => { razorpayInstance.orders.fetch = async () => order; };
const verify = (orderId = "order_TestOrder12345", userId) =>
  call(ctl.verifyRazorpay, { razorpay_order_id: orderId }, userId);
const flush = () => new Promise((r) => setTimeout(r, 50));

test("verify: matching paid order marks the appointment paid and sends one receipt", async (t) => {
  if (guard(t)) return;
  sentMail.length = 0;
  const appt = await makeAppointment();
  stubFetch(paidOrder(appt));
  const r = await verify();
  assert.deepEqual(r, { success: true, message: "Payment Successful" });
  assert.equal((await appointmentModel.findById(appt._id)).payment, true);
  await flush();
  assert.equal(sentMail.length, 1);
});

test("verify: amount mismatch is rejected and nothing is marked paid", async (t) => {
  if (guard(t)) return;
  const appt = await makeAppointment({ amount: 500 });
  stubFetch(paidOrder(appt, { amount: 100, amount_paid: 100 })); // paid Rs 1 for a Rs 500 visit
  const r = await verify();
  assert.equal(r.success, false);
  assert.equal(r.message, "Payment verification failed");
  assert.equal((await appointmentModel.findById(appt._id)).payment, false);
});

test("verify: currency mismatch is rejected", async (t) => {
  if (guard(t)) return;
  const appt = await makeAppointment();
  stubFetch(paidOrder(appt, { currency: "USD" }));
  assert.equal((await verify()).success, false);
  assert.equal((await appointmentModel.findById(appt._id)).payment, false);
});

test("verify: unpaid order is not marked paid", async (t) => {
  if (guard(t)) return;
  const appt = await makeAppointment();
  stubFetch(paidOrder(appt, { status: "attempted", amount_paid: 0 }));
  const r = await verify();
  assert.equal(r.success, false);
  assert.equal((await appointmentModel.findById(appt._id)).payment, false);
});

test("verify: another patient's appointment cannot be flipped", async (t) => {
  if (guard(t)) return;
  const appt = await makeAppointment();
  stubFetch(paidOrder(appt));
  const r = await verify("order_TestOrder12345", otherPatientId);
  assert.equal(r.success, false);
  assert.equal((await appointmentModel.findById(appt._id)).payment, false);
});

test("verify: a cancelled appointment is never marked paid (refund message instead)", async (t) => {
  if (guard(t)) return;
  const appt = await makeAppointment({ cancelled: true });
  stubFetch(paidOrder(appt));
  const r = await verify();
  assert.equal(r.success, false);
  assert.match(r.message, /refund/i);
  assert.equal((await appointmentModel.findById(appt._id)).payment, false);
});

test("verify: repeated and concurrent verification is idempotent — one state change, one email", async (t) => {
  if (guard(t)) return;
  sentMail.length = 0;
  const appt = await makeAppointment();
  stubFetch(paidOrder(appt));
  const results = await Promise.all(Array.from({ length: 6 }, () => verify()));
  assert.ok(results.every((r) => r.success === true), JSON.stringify(results));
  assert.equal((await verify()).success, true);
  await flush();
  assert.equal(sentMail.length, 1, "receipt must be sent exactly once");
  assert.equal((await appointmentModel.findById(appt._id)).payment, true);
});

test("verify: malformed order id / receipt are rejected without calling Razorpay", async (t) => {
  if (guard(t)) return;
  let calls = 0;
  razorpayInstance.orders.fetch = async () => { calls++; return {}; };
  for (const bad of [undefined, "", "pay_abc123456", { $ne: 1 }, "order_../x"]) {
    assert.equal((await call(ctl.verifyRazorpay, { razorpay_order_id: bad })).success, false);
  }
  assert.equal(calls, 0);
  const appt = await makeAppointment();
  stubFetch(paidOrder(appt, { receipt: { $ne: null } }));
  assert.equal((await verify()).success, false);
});

test("verify: Razorpay/internal errors are not leaked to the client", async (t) => {
  if (guard(t)) return;
  razorpayInstance.orders.fetch = async () => {
    const e = new Error("Authentication failed for key rzp_live_SECRETKEYID at https://api.razorpay.com");
    e.error = { description: "internal detail" };
    throw e;
  };
  const r = await verify();
  assert.equal(r.success, false);
  assert.ok(!JSON.stringify(r).includes("rzp_live") && !JSON.stringify(r).includes("razorpay.com"));
});

test("create order: sends integer minor units + configured currency, ignores client-supplied amount", async (t) => {
  if (guard(t)) return;
  const appt = await makeAppointment({ amount: 19.99 });
  let captured;
  razorpayInstance.orders.create = async (opts) => { captured = opts; return { id: "order_TestOrder12345", ...opts }; };
  const r = await call(ctl.paymentRazorpay, { appointmentId: String(appt._id), amount: 1, currency: "USD" });
  assert.equal(r.success, true);
  assert.deepEqual(captured, { amount: 1999, currency: "INR", receipt: String(appt._id) });
});

test("create order: refuses paid, completed, cancelled, foreign, malformed, and unconfigured-currency cases", async (t) => {
  if (guard(t)) return;
  let calls = 0;
  razorpayInstance.orders.create = async (o) => { calls++; return o; };
  const cases = [
    await makeAppointment({ payment: true }),
    await makeAppointment({ isCompleted: true }),
    await makeAppointment({ cancelled: true }),
  ];
  for (const a of cases) {
    assert.equal((await call(ctl.paymentRazorpay, { appointmentId: String(a._id) })).success, false);
  }
  const mine = await makeAppointment();
  assert.equal((await call(ctl.paymentRazorpay, { appointmentId: String(mine._id) }, otherPatientId)).success, false);
  for (const bad of [undefined, "nope", { $ne: null }]) {
    assert.equal((await call(ctl.paymentRazorpay, { appointmentId: bad })).success, false);
  }
  const cur = process.env.CURRENCY;
  delete process.env.CURRENCY;
  try {
    assert.equal((await call(ctl.paymentRazorpay, { appointmentId: String(mine._id) })).success, false);
  } finally {
    process.env.CURRENCY = cur;
  }
  assert.equal(calls, 0, "Razorpay must not be called for any refused case");
});

test("create order: Razorpay errors are not leaked to the client", async (t) => {
  if (guard(t)) return;
  const appt = await makeAppointment();
  razorpayInstance.orders.create = async () => { throw new Error("key rzp_live_SECRETKEYID rejected"); };
  const r = await call(ctl.paymentRazorpay, { appointmentId: String(appt._id) });
  assert.equal(r.success, false);
  assert.ok(!JSON.stringify(r).includes("rzp_live"));
});
