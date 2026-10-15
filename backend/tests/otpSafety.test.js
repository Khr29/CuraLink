import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// OTP verification: attempt limits, concurrency safety, single use, per-account
// issuance caps. Runs the real handlers against a throwaway database on a LOCAL
// mongod (URI hardcoded, never read from .env); skipped if none is reachable.
// Mail is stubbed — nothing is ever sent.
process.env.JWT_SECRET = "test-secret-otp";
process.env.ADMIN_EMAIL = "admin@otp.test";

const TEST_URI = `mongodb://127.0.0.1:27017/curalink_test_otp_${process.pid}`;
const sentMail = [];

let skip = false;
let auth, otpModel, otpLib, otpVerification, userModel, pharmacyModel, refreshTokenModel;
const OLD_PASSWORD = "Old!Passw0rd#1";
const NEW_PASSWORD = "New!Passw0rd#2";

before(async () => {
  try {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 2000 });
  } catch {
    skip = "local mongod not reachable";
    return;
  }
  nodemailer.createTransport = () => ({ sendMail: async (m) => { sentMail.push(m); } });
  auth = await import("../controllers/authSharedController.js");
  otpModel = (await import("../models/otpModel.js")).default;
  otpLib = await import("../utils/otp.js");
  otpVerification = await import("../utils/otpVerification.js");
  userModel = (await import("../models/userModels.js")).default;
  pharmacyModel = (await import("../models/pharmacyModel.js")).default;
  refreshTokenModel = (await import("../models/refreshTokenModel.js")).default;
});

after(async () => {
  if (skip) return;
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

const guard = (t) => {
  if (skip) { t.skip(skip); return true; }
  return false;
};

let n = 0;
const makeUser = async (Model = userModel) => {
  n += 1;
  return Model.create({
    name: "Otp Tester",
    email: `otp${n}-${Model.modelName}@otp.test`,
    password: await bcrypt.hash(OLD_PASSWORD, 4),
    emailVerified: false, // the user schema defaults this to true
  });
};
const seedOtp = (actorType, actor, purpose, code, over = {}) =>
  otpModel.create({
    actorType,
    actorId: actor._id,
    email: actor.email,
    purpose,
    codeHash: otpLib.hashOtp(code),
    expiresAt: new Date(Date.now() + otpLib.OTP_TTL_MS),
    ...over,
  });
const run = async (handler, { body = {}, actorId } = {}) => {
  let out;
  await handler({ body, userId: actorId, headers: {}, ip: "127.0.0.1", socket: {} }, { json: (b) => { out = b; return out; } });
  return out;
};
const reset = (actor, otp, newPassword = NEW_PASSWORD) =>
  run(auth.makeResetPasswordHandler("user"), {
    body: { email: actor.email, otp, newPassword, confirmPassword: newPassword },
  });
const verifyEmail = (actor, otp) =>
  run(auth.makeVerifyEmailHandler("user", (req) => req.userId), { body: { otp }, actorId: actor._id });

test("verifyOtp: correct code works exactly once", async (t) => {
  if (guard(t)) return;
  const user = await makeUser();
  await seedOtp("user", user, "password_reset", "123456");
  const filter = { actorType: "user", email: user.email, purpose: "password_reset" };
  assert.equal((await otpVerification.verifyOtp({ filter, code: "123456" })).ok, true);
  const again = await otpVerification.verifyOtp({ filter, code: "123456" });
  assert.equal(again.ok, false);
  assert.equal(again.reason, "missing_or_expired");
});

test("verifyOtp: wrong guesses are capped at OTP_MAX_ATTEMPTS, then even the right code is refused", async (t) => {
  if (guard(t)) return;
  const user = await makeUser();
  await seedOtp("user", user, "password_reset", "654321");
  const filter = { actorType: "user", email: user.email, purpose: "password_reset" };
  for (let i = 0; i < otpLib.OTP_MAX_ATTEMPTS; i++) {
    assert.equal((await otpVerification.verifyOtp({ filter, code: "000000" })).reason, "invalid");
  }
  assert.equal((await otpVerification.verifyOtp({ filter, code: "000000" })).reason, "locked");
  assert.equal((await otpVerification.verifyOtp({ filter, code: "654321" })).reason, "locked");
});

test("REGRESSION: concurrent wrong guesses cannot exceed the attempt limit", async (t) => {
  if (guard(t)) return;
  const user = await makeUser();
  const rec = await seedOtp("user", user, "password_reset", "111111");
  const filter = { actorType: "user", email: user.email, purpose: "password_reset" };
  const results = await Promise.all(
    Array.from({ length: 60 }, () => otpVerification.verifyOtp({ filter, code: "222222" }))
  );
  const evaluated = results.filter((r) => r.reason === "invalid").length;
  assert.equal(evaluated, otpLib.OTP_MAX_ATTEMPTS, `exactly ${otpLib.OTP_MAX_ATTEMPTS} guesses may be evaluated, got ${evaluated}`);
  assert.equal((await otpModel.findById(rec._id)).attempts, otpLib.OTP_MAX_ATTEMPTS);
  // ...and the correct code is now locked out.
  assert.equal((await otpVerification.verifyOtp({ filter, code: "111111" })).ok, false);
});

test("REGRESSION: a burst of guesses including the right code cannot slip past the limit", async (t) => {
  if (guard(t)) return;
  const user = await makeUser();
  await seedOtp("user", user, "password_reset", "333333");
  const filter = { actorType: "user", email: user.email, purpose: "password_reset" };
  const wrong = Array.from({ length: 30 }, () => otpVerification.verifyOtp({ filter, code: "999999" }));
  const results = await Promise.all([...wrong, otpVerification.verifyOtp({ filter, code: "333333" })]);
  assert.ok(results.filter((r) => r.reason === "invalid").length <= otpLib.OTP_MAX_ATTEMPTS);
  assert.ok(results.filter((r) => r.ok).length <= 1);
});

test("REGRESSION: one correct code cannot be redeemed twice concurrently (password reset)", async (t) => {
  if (guard(t)) return;
  const user = await makeUser();
  await seedOtp("user", user, "password_reset", "424242");
  const results = await Promise.all(Array.from({ length: 6 }, () => reset(user, "424242")));
  assert.equal(results.filter((r) => r.success).length, 1, JSON.stringify(results));
  const fresh = await userModel.findById(user._id);
  assert.equal(await bcrypt.compare(NEW_PASSWORD, fresh.password), true);
});

test("password reset: sessions are revoked and the code stays single-use", async (t) => {
  if (guard(t)) return;
  const user = await makeUser();
  await refreshTokenModel.create({
    actorType: "user", actorId: user._id, actorLabel: "u", tokenHash: `h-${user._id}`, expiresAt: new Date(Date.now() + 1e7),
  });
  await seedOtp("user", user, "password_reset", "135790");
  assert.equal((await reset(user, "135790")).success, true);
  assert.equal(await refreshTokenModel.countDocuments({ actorType: "user", actorId: user._id, revokedAt: null }), 0);
  const second = await reset(user, "135790", "Another!Passw0rd3");
  assert.equal(second.success, false);
});

test("password reset: wrong code / expired code / non-string code are rejected with the usual messages", async (t) => {
  if (guard(t)) return;
  const user = await makeUser();
  await seedOtp("user", user, "password_reset", "246810");
  assert.equal((await reset(user, "000000")).message, "Invalid code");
  assert.equal((await reset(user, { $ne: null })).success, false);
  assert.equal((await reset(user, ["246810"])).success, false);

  const old = await makeUser();
  await seedOtp("user", old, "password_reset", "246810", { expiresAt: new Date(Date.now() - 1000) });
  assert.equal((await reset(old, "246810")).message, "Code expired or invalid, please request a new one");
});

test("password reset: rejected password (reuse) hands the code back so the holder can retry", async (t) => {
  if (guard(t)) return;
  const user = await makeUser();
  await seedOtp("user", user, "password_reset", "314159");
  const reused = await reset(user, "314159", OLD_PASSWORD);
  assert.equal(reused.success, false);
  assert.match(reused.message, /used recently/i);
  assert.equal((await reset(user, "314159")).success, true, "same code must still work with an acceptable password");
});

test("email verification: attempt cap holds under concurrency, correct code verifies once", async (t) => {
  if (guard(t)) return;
  const user = await makeUser();
  await seedOtp("user", user, "email_verification", "775533");
  const burst = await Promise.all(Array.from({ length: 40 }, () => verifyEmail(user, "000001")));
  assert.equal(burst.filter((r) => r.message === "Invalid code").length, otpLib.OTP_MAX_ATTEMPTS);
  assert.equal((await verifyEmail(user, "775533")).message, "Too many attempts, please request a new code");
  assert.notEqual((await userModel.findById(user._id)).emailVerified, true);

  const ok = await makeUser();
  await seedOtp("user", ok, "email_verification", "775533");
  const both = await Promise.all([verifyEmail(ok, "775533"), verifyEmail(ok, "775533")]);
  assert.equal(both.filter((r) => r.success).length, 1);
  assert.equal((await userModel.findById(ok._id)).emailVerified, true);
});

test("a code for one account/purpose cannot be redeemed for another", async (t) => {
  if (guard(t)) return;
  const a = await makeUser();
  const b = await makeUser();
  await seedOtp("user", a, "password_reset", "111222");
  assert.equal((await reset(b, "111222")).success, false);
  await seedOtp("user", a, "email_verification", "333444");
  assert.equal((await reset(a, "333444")).success, false, "an email-verification code must not reset a password");
});

test("per-account issuance cap: forgot-password stops minting codes (still generic) after the cap", async (t) => {
  if (guard(t)) return;
  const user = await makeUser();
  const forgot = (email) => run(auth.makeForgotPasswordHandler("user"), { body: { email } });
  const replies = [];
  for (let i = 0; i < otpVerification.OTP_MAX_ISSUED_PER_WINDOW + 3; i++) replies.push(await forgot(user.email));
  assert.equal(
    await otpModel.countDocuments({ actorId: user._id, purpose: "password_reset" }),
    otpVerification.OTP_MAX_ISSUED_PER_WINDOW
  );
  assert.equal(new Set(replies.map((r) => JSON.stringify(r))).size, 1, "reply must not reveal the cap");
  assert.deepEqual(await forgot("nobody@otp.test"), replies[0], "unknown account gets the identical reply");
});

test("email-verification issuance is capped per account too", async (t) => {
  if (guard(t)) return;
  const user = await makeUser();
  for (let i = 0; i < otpVerification.OTP_MAX_ISSUED_PER_WINDOW; i++) {
    await auth.issueEmailVerificationOtp("user", user);
  }
  await assert.rejects(() => auth.issueEmailVerificationOtp("user", user), /too many/i);
});

test("REGRESSION: pharmacy accounts can get a password-reset code (otp enum covers every actor type)", async (t) => {
  if (guard(t)) return;
  const pharmacy = await makeUser(pharmacyModel);
  const r = await run(auth.makeForgotPasswordHandler("pharmacy"), { body: { email: pharmacy.email } });
  assert.equal(r.success, true);
  assert.equal(await otpModel.countDocuments({ actorType: "pharmacy", actorId: pharmacy._id }), 1);
});

test("forgot-password never leaks internal errors (no account enumeration via error text)", async (t) => {
  if (guard(t)) return;
  const user = await makeUser();
  const original = otpModel.create;
  otpModel.create = async () => { throw new Error("E11000 duplicate key secret detail"); };
  try {
    const existing = await run(auth.makeForgotPasswordHandler("user"), { body: { email: user.email } });
    const unknown = await run(auth.makeForgotPasswordHandler("user"), { body: { email: "ghost@otp.test" } });
    assert.deepEqual(existing, unknown);
    assert.ok(!JSON.stringify(existing).includes("E11000"));
  } finally {
    otpModel.create = original;
  }
});

test("forgot-password / reset ignore non-string emails instead of throwing", async (t) => {
  if (guard(t)) return;
  const forgot = await run(auth.makeForgotPasswordHandler("user"), { body: { email: { $ne: null } } });
  assert.equal(forgot.success, false);
  assert.equal(forgot.message, "Email is required");
  const r = await run(auth.makeResetPasswordHandler("user"), {
    body: { email: { $ne: null }, otp: "123456", newPassword: NEW_PASSWORD, confirmPassword: NEW_PASSWORD },
  });
  assert.equal(r.success, false);
});
