import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";

// Regression tests: doctor / hospital / pharmacy login must only accept plain
// string credentials. Before the fix these handlers did findOne({ email }) with
// the raw JSON value, so {"email":{"$ne":""},"password":"<any account's
// password>"} matched an arbitrary account (operator injection).
//
// Drives the REAL routers over HTTP against a throwaway database on a LOCAL
// mongod (hardcoded URI on purpose — never read from .env). Skipped, not
// failed, if no local mongod is reachable.
process.env.JWT_SECRET = "test-secret-login-input";
process.env.ADMIN_EMAIL = "admin@logininput.test";
process.env.ADMIN_PASSWORD = "Adm1n!LoginInput#Pw";
process.env.DISABLE_RATE_LIMITING = "true";
process.env.NODE_ENV = "test";
process.env.RAZORPAY_KEY_ID ??= "rzp_test_dummy";
process.env.RAZORPAY_KEY_SECRET ??= "dummy_secret";

const TEST_URI = "mongodb://127.0.0.1:27017/curalink_test_login_input";
const { default: bcrypt } = await import("bcrypt");
const { readLoginCredentials } = await import("../utils/loginInput.js");

const PASSWORD = "Correct!Passw0rd#1";
const ROLES = [
  { role: "doctor", path: "/api/doctor/login", email: "doctor@logininput.test" },
  { role: "hospital", path: "/api/hospital/login", email: "hospital@logininput.test" },
  { role: "pharmacy", path: "/api/pharmacy/login", email: "pharmacy@logininput.test" },
];

let skip = false, server, base, refreshModel;

const login = async (path, body) => {
  const r = await fetch(base + path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  let json = null;
  try { json = await r.json(); } catch { /* non-JSON */ }
  return { status: r.status, body: json };
};
const text = (v) => JSON.stringify(v);
const sessionCount = () => refreshModel.countDocuments({});

before(async () => {
  try {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 2000 });
  } catch {
    skip = "local mongod not reachable";
    return;
  }
  await mongoose.connection.dropDatabase();
  const express = (await import("express")).default;
  const cookieParser = (await import("cookie-parser")).default;
  refreshModel = (await import("../models/refreshTokenModel.js")).default;
  const doctor = (await import("../models/doctorModel.js")).default;
  const hospital = (await import("../models/hospitalModel.js")).default;
  const pharmacy = (await import("../models/pharmacyModel.js")).default;

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/doctor", (await import("../routes/doctorRoute.js")).default);
  app.use("/api/hospital", (await import("../routes/hospitalRoute.js")).default);
  app.use("/api/pharmacy", (await import("../routes/pharmacyRoute.js")).default);
  server = http.createServer(app);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;

  // Raw inserts skip unrelated required-field validation. Each role has exactly
  // ONE account, so an operator query like {"$ne":""} can only ever resolve to
  // that account — and the supplied password is its CORRECT one, which is the
  // case that authenticated before the fix.
  const hash = await bcrypt.hash(PASSWORD, 4);
  const common = { password: hash, previousPasswords: [], passwordChangedAt: null, emailVerified: true, createdAt: new Date(), updatedAt: new Date() };
  await doctor.collection.insertOne({ ...common, name: "Dr Login", email: ROLES[0].email, speciality: "General physician", verificationStatus: "verified", available: true });
  await hospital.collection.insertOne({ ...common, name: "Hospital Login", email: ROLES[1].email, active: true, verificationStatus: "approved", doctors: [] });
  await pharmacy.collection.insertOne({ ...common, name: "Pharmacy Login", email: ROLES[2].email, active: true });
});

after(async () => {
  if (skip) return;
  await new Promise((r) => server.close(r));
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test("readLoginCredentials accepts only non-empty strings and normalizes email", () => {
  assert.deepEqual(readLoginCredentials({ email: "  Mixed@Case.TEST ", password: "pw" }), { email: "mixed@case.test", password: "pw" });
  // password is passed through untouched (no trim/lowercase)
  assert.equal(readLoginCredentials({ email: "a@b.test", password: "  Pw  " }).password, "  Pw  ");
  for (const bad of [
    undefined, null, "str", 5, [], {},
    { email: "a@b.test" }, { password: "pw" }, { email: "", password: "pw" }, { email: "   ", password: "pw" }, { email: "a@b.test", password: "" },
    { email: { $ne: "" }, password: "pw" }, { email: ["a@b.test"], password: "pw" }, { email: 5, password: "pw" },
    { email: "a@b.test", password: { $ne: "" } }, { email: "a@b.test", password: ["pw"] }, { email: "a@b.test", password: 5 }, { email: "a@b.test", password: null },
  ]) {
    assert.equal(readLoginCredentials(bad), null, `accepted ${text(bad)}`);
  }
});

for (const { role, path, email } of ROLES) {
  test(`${role} login: valid credentials still authenticate (exact, mixed-case and padded email)`, async (t) => {
    if (skip) return t.skip(skip);
    for (const submitted of [email, email.toUpperCase(), `  ${email.toUpperCase()}  `]) {
      const r = await login(path, { email: submitted, password: PASSWORD });
      assert.equal(r.body?.success, true, `${text(submitted)} -> ${text(r.body)}`);
      assert.equal(typeof r.body.token, "string");
    }
  });

  test(`${role} login: wrong password is rejected`, async (t) => {
    if (skip) return t.skip(skip);
    const before = await sessionCount();
    const r = await login(path, { email, password: PASSWORD + "x" });
    assert.equal(r.body?.success, false);
    assert.equal(r.body.message, "Invalid Credentials");
    assert.ok(!r.body.token);
    assert.equal(await sessionCount(), before);
  });

  test(`${role} login: MongoDB operator objects as email cannot authenticate (even with the correct password)`, async (t) => {
    if (skip) return t.skip(skip);
    const before = await sessionCount();
    const operators = [{ $ne: "" }, { $ne: null }, { $gt: "" }, { $regex: ".*" }, { $exists: true }, { $in: [email] }, { $not: { $eq: "nobody" } }];
    for (const op of operators) {
      const r = await login(path, { email: op, password: PASSWORD });
      assert.equal(r.body?.success, false, `email ${text(op)} -> ${text(r.body)}`);
      assert.ok(!r.body?.token, `token issued for email ${text(op)}`);
    }
    // array, number and boolean emails too
    for (const weird of [[email], 123, true]) {
      const r = await login(path, { email: weird, password: PASSWORD });
      assert.equal(r.body?.success, false, `email ${text(weird)}`);
      assert.ok(!r.body?.token);
    }
    assert.equal(await sessionCount(), before, "no session row may be created by a rejected login");
  });

  test(`${role} login: non-string passwords are rejected`, async (t) => {
    if (skip) return t.skip(skip);
    const before = await sessionCount();
    for (const pw of [{ $ne: "" }, { $gt: "" }, [PASSWORD], 12345, true, null]) {
      const r = await login(path, { email, password: pw });
      assert.equal(r.body?.success, false, `password ${text(pw)} -> ${text(r.body)}`);
      assert.ok(!r.body?.token);
    }
    assert.equal(await sessionCount(), before);
  });

  test(`${role} login: missing, blank and malformed bodies are rejected before any query`, async (t) => {
    if (skip) return t.skip(skip);
    const before = await sessionCount();
    const bodies = [{}, { email }, { password: PASSWORD }, { email: "", password: PASSWORD }, { email: "   ", password: PASSWORD },
      { email, password: "" }, { email: null, password: null }, "{}", "[]"];
    for (const body of bodies) {
      const r = await login(path, body);
      assert.equal(r.body?.success, false, `body ${text(body)} -> ${text(r.body)}`);
      assert.ok(!r.body?.token);
    }
    // malformed input gets the clean "Missing Details" message, not a raw exception
    assert.equal((await login(path, {})).body.message, "Missing Details");
    assert.equal((await login(path, { email: { $ne: "" }, password: PASSWORD })).body.message, "Missing Details");
    assert.equal(await sessionCount(), before);
  });
}
