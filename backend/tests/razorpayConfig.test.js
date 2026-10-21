import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { isRazorpayConfigured } from "../utils/razorpayClient.js";

// Payment handlers must never reach Razorpay without real keys, and a missing
// key must never crash the process. Each scenario runs in a child process
// because the Razorpay client reads its keys once, at import. No database or
// network is used: the handlers return before any query when unconfigured, and
// the "configured" scenario only sends inputs that are rejected right after the
// guard (the full paid/unpaid flows are covered in paymentVerification.test.js).

test("isRazorpayConfigured: needs both keys and rejects blanks and the placeholders", () => {
  assert.equal(isRazorpayConfigured({ RAZORPAY_KEY_ID: "rzp_test_abc", RAZORPAY_KEY_SECRET: "s3cret" }), true);
  for (const env of [
    {},
    { RAZORPAY_KEY_ID: "rzp_test_abc" },
    { RAZORPAY_KEY_SECRET: "s3cret" },
    { RAZORPAY_KEY_ID: "   ", RAZORPAY_KEY_SECRET: "s3cret" },
    { RAZORPAY_KEY_ID: "rzp_test_abc", RAZORPAY_KEY_SECRET: "" },
    { RAZORPAY_KEY_ID: "rzp_not_configured", RAZORPAY_KEY_SECRET: "s3cret" },
    { RAZORPAY_KEY_ID: "rzp_test_abc", RAZORPAY_KEY_SECRET: "not_configured" },
    { RAZORPAY_KEY_ID: 123, RAZORPAY_KEY_SECRET: "s3cret" },
  ]) {
    assert.equal(isRazorpayConfigured(env), false, JSON.stringify(env));
  }
});

const SCRIPT = `
  const { razorpayInstance } = await import("./utils/razorpayClient.js");
  const ctl = await import("./controllers/userController.js");
  const calls = [];
  razorpayInstance.orders.create = async () => { calls.push("create"); throw new Error("must not be called"); };
  razorpayInstance.orders.fetch = async () => { calls.push("fetch"); throw new Error("must not be called"); };
  const run = async (handler, body) => {
    let out;
    await handler({ body, userId: "64b7f0c2a1b2c3d4e5f60718" }, { json: (b) => (out = b) });
    return out;
  };
  const order = await run(ctl.paymentRazorpay, { appointmentId: "not-an-id" });
  const verify = await run(ctl.verifyRazorpay, { razorpay_order_id: "order_TestOrder12345" });
  console.log(JSON.stringify({ order, verify, calls }));
`;

const runScenario = (keys) => {
  const env = { ...process.env, JWT_SECRET: "t", NODE_ENV: "test" };
  delete env.RAZORPAY_KEY_ID;
  delete env.RAZORPAY_KEY_SECRET;
  Object.assign(env, keys);
  const out = execFileSync(process.execPath, ["--input-type=module", "-e", SCRIPT], {
    env,
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"], // the handlers log the refusal to stderr
  });
  return JSON.parse(out.trim().split("\n").pop());
};

const UNAVAILABLE = { success: false, message: "Online payments are not available right now" };

for (const [label, keys] of [
  ["both keys missing", {}],
  ["secret missing", { RAZORPAY_KEY_ID: "rzp_test_abc" }],
  ["key id missing", { RAZORPAY_KEY_SECRET: "s3cret" }],
  ["blank keys", { RAZORPAY_KEY_ID: " ", RAZORPAY_KEY_SECRET: " " }],
  ["placeholder keys", { RAZORPAY_KEY_ID: "rzp_not_configured", RAZORPAY_KEY_SECRET: "not_configured" }],
]) {
  test(`unconfigured (${label}): order and verify are refused, Razorpay is never called, no crash`, () => {
    const r = runScenario(keys);
    assert.deepEqual(r.order, UNAVAILABLE);
    assert.deepEqual(r.verify, UNAVAILABLE);
    assert.deepEqual(r.calls, []);
  });
}

test("configured: the guard passes and the normal validation runs instead", () => {
  const r = runScenario({ RAZORPAY_KEY_ID: "rzp_test_abc", RAZORPAY_KEY_SECRET: "s3cret" });
  // Not the "unavailable" refusal. verify gets past the guard and fetches the
  // order; the stubbed fetch throws, which the handler reports as a failure.
  assert.deepEqual(r.order, { success: false, message: "Appointment Cancelled or not found" });
  assert.notDeepEqual(r.verify, UNAVAILABLE);
  assert.equal(r.verify.success, false);
  assert.deepEqual(r.calls, ["fetch"]);
});
