import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";

// Regression tests for: (1) admin auth failing closed, (2) no credential
// hashes / personal fields on public or patient/admin responses, and
// (3) authenticated, short-lived-URL medical attachments.
//
// Drives the REAL routers/controllers over HTTP against a throwaway database
// on a LOCAL mongod. The URI is hardcoded on purpose: it must never be read
// from .env (which may point at production). Cloudinary is never contacted:
// uploads are stubbed and URL signing is a local computation with fake
// credentials. Skipped, not failed, if no local mongod is reachable.
process.env.JWT_SECRET = "test-secret-hardening";
process.env.ADMIN_EMAIL = "admin@hardening.test";
process.env.ADMIN_PASSWORD = "Adm1n!Hardening#Pw";
process.env.DISABLE_RATE_LIMITING = "true";
process.env.NODE_ENV = "test";
process.env.RAZORPAY_KEY_ID ??= "rzp_test_dummy";
process.env.RAZORPAY_KEY_SECRET ??= "dummy_secret";

const TEST_URI = "mongodb://127.0.0.1:27017/curalink_test_security_hardening";
const { default: jwt } = await import("jsonwebtoken");
const { default: bcrypt } = await import("bcrypt");
const { v2: cloudinary } = await import("cloudinary");
cloudinary.config({ cloud_name: "testcloud", api_key: "123456", api_secret: "test-api-secret" });

const ADMIN = { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD };
const HASH = "$2b$10$abcdefghijklmnopqrstuvABCDEFGHIJKLMNOPQRSTUVWXYZ0123456"; // fake bcrypt-shaped string
const OLD_HASHES = ["$2b$10$OLDHASH1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "$2b$10$OLDHASH2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"];

let skip = false, server, base;
let signAccessToken, models, authConfig;
const ids = {};
const tokens = {};

const api = async (path, { method = "GET", headers = {}, body } = {}) => {
  const r = await fetch(base + path, {
    method,
    headers: { ...(body !== undefined ? { "content-type": "application/json" } : {}), ...headers },
    body: body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
  });
  let json = null;
  try { json = await r.json(); } catch { /* non-JSON */ }
  return { status: r.status, body: json };
};
const text = (v) => JSON.stringify(v);
const guard = (t) => { if (skip) { t.skip(skip); return true; } return false; };
const withEnv = async (overrides, fn) => {
  const saved = {};
  for (const k of Object.keys(overrides)) {
    saved[k] = process.env[k];
    if (overrides[k] === undefined) delete process.env[k]; else process.env[k] = overrides[k];
  }
  try { return await fn(); } finally {
    for (const k of Object.keys(saved)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
};

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
  ({ signAccessToken } = await import("../utils/tokens.js"));
  authConfig = await import("../utils/authConfig.js");
  models = {
    user: (await import("../models/userModels.js")).default,
    doctor: (await import("../models/doctorModel.js")).default,
    hospital: (await import("../models/hospitalModel.js")).default,
    appointment: (await import("../models/appointmentModel.js")).default,
    record: (await import("../models/medicalRecordModel.js")).default,
    refresh: (await import("../models/refreshTokenModel.js")).default,
  };
  const names = ["admin", "doctor", "hospital", "user", "medical-records"];
  const files = ["adminRoute", "doctorRoute", "hospitalRoute", "userRoute", "medicalRecordRoute"];
  const routers = await Promise.all(files.map(async (f) => (await import(`../routes/${f}.js`)).default));
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  names.forEach((n, i) => app.use(`/api/${n}`, routers[i]));
  server = http.createServer(app);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;

  // Fixtures — every record carries a password plus hash history, so any
  // leak shows up as a hit on these markers.
  // Raw inserts (like the other suites) skip unrelated required-field
  // validation; select:false is a read-time concern so it is unaffected.
  const insert = async (model, doc) => {
    const _id = new mongoose.Types.ObjectId();
    await model.collection.insertOne({ _id, createdAt: new Date(), updatedAt: new Date(), ...doc });
    return { _id };
  };
  const hospital = await insert(models.hospital, {
    name: "Test Hospital", email: "hospital@hardening.test", password: HASH, previousPasswords: OLD_HASHES,
    passwordChangedAt: null, phone: "555-0100", website: "https://h.test", active: true, emailVerified: true,
    verificationStatus: "approved", address: { line1: "1 Main" }, image: "img", description: "d", hospitalType: "General",
    doctors: [], averageRating: 0, totalReviews: 0,
  });
  const doctorBase = {
    password: HASH, previousPasswords: OLD_HASHES, passwordChangedAt: null, image: "img", speciality: "General physician",
    degree: "MBBS", experience: "5 Years", about: "about", fees: 10, address: { line1: "x" }, available: true,
    verificationStatus: "verified", emailVerified: true, averageRating: 0, totalReviews: 0,
  };
  const doctor = await insert(models.doctor, {
    ...doctorBase, name: "Dr Test", email: "doctor@hardening.test", licenseNumber: "LIC-SECRET-1", phone: "555-0199",
    hospitalId: hospital._id, slots_booked: { "1_1_2030": ["10:00"] },
  });
  const otherDoctor = await insert(models.doctor, { ...doctorBase, name: "Dr Other", email: "other@hardening.test", hospitalId: null });
  const userBase = { password: HASH, previousPasswords: OLD_HASHES, passwordChangedAt: null, isActive: true, emailVerified: true };
  const patient = await insert(models.user, { ...userBase, name: "Patient One", email: "p1@hardening.test", password: await bcrypt.hash("Old!Passw0rd#1", 4) });
  const patient2 = await insert(models.user, { ...userBase, name: "Patient Two", email: "p2@hardening.test" });
  Object.assign(ids, { hospital: String(hospital._id), doctor: String(doctor._id), otherDoctor: String(otherDoctor._id), patient: String(patient._id), patient2: String(patient2._id) });
  tokens.admin = signAccessToken({ email: ADMIN.email, actorType: "admin" });
  tokens.patient = signAccessToken({ id: ids.patient });
  tokens.patient2 = signAccessToken({ id: ids.patient2 });
  tokens.doctor = signAccessToken({ id: ids.doctor });
  tokens.otherDoctor = signAccessToken({ id: ids.otherDoctor });
  tokens.hospital = signAccessToken({ id: ids.hospital });

  // Appointment whose stored snapshots predate the select:false change and
  // still contain credential hashes (legacy data).
  const appt = await models.appointment.collection.insertOne({
    userId: patient._id, docId: doctor._id, hospitalId: hospital._id, slotDate: "1_1_2030", slotTime: "10:00",
    userData: { name: "Patient One", password: HASH, previousPasswords: OLD_HASHES },
    docData: { name: "Dr Test", password: HASH, previousPasswords: OLD_HASHES },
    amount: 10, date: Date.now(), cancelled: false, payment: false, isCompleted: true,
  });
  ids.appointment = String(appt.insertedId);

  await models.record.collection.insertOne({
    appointmentId: appt.insertedId, patientId: patient._id, doctorId: doctor._id, hospitalId: hospital._id,
    diagnosis: "d", notes: "n", status: "finalized", finalizedAt: new Date(),
    attachments: [
      { url: "", publicId: "records/new-file", resourceType: "image", format: "pdf", fileName: "new.pdf", fileType: "application/pdf" },
      { url: "https://res.cloudinary.com/testcloud/image/upload/v1/legacy.pdf", fileName: "legacy.pdf", fileType: "application/pdf" },
    ],
    versions: [{
      editedAt: new Date(), editorRole: "doctor", reason: "old",
      snapshot: { diagnosis: "older", attachments: [{ url: "", publicId: "records/old-version-file", resourceType: "image", format: "pdf", fileName: "v.pdf", fileType: "application/pdf" }] },
    }],
    createdAt: new Date(), updatedAt: new Date(),
  });
});

after(async () => {
  if (skip) return;
  await new Promise((r) => server.close(r));
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

// ───────────────────────── Fix 1: admin auth fails closed ─────────────────────────

test("1a: adminCredentialsMatch fails closed on unset config, blank, non-string and wrong input", (t) => {
  if (guard(t)) return;
  const env = { ADMIN_EMAIL: "a@x.test", ADMIN_PASSWORD: "pw-1" };
  assert.equal(authConfig.adminCredentialsMatch("a@x.test", "pw-1", env), true);
  assert.equal(authConfig.adminCredentialsMatch("a@x.test", "wrong", env), false);
  assert.equal(authConfig.adminCredentialsMatch("b@x.test", "pw-1", env), false);
  for (const bad of [undefined, null, "", "   ", 0, {}, [], ["a@x.test"]]) {
    assert.equal(authConfig.adminCredentialsMatch(bad, bad, env), false, `submitted ${text(bad)}`);
  }
  // Server config missing/blank: even `undefined === undefined` must not authenticate.
  for (const cfg of [{}, { ADMIN_EMAIL: "", ADMIN_PASSWORD: "" }, { ADMIN_EMAIL: "a@x.test" }, { ADMIN_PASSWORD: "pw" }, { ADMIN_EMAIL: " ", ADMIN_PASSWORD: " " }]) {
    assert.equal(authConfig.adminCredentialsMatch(undefined, undefined, cfg), false);
    assert.equal(authConfig.adminCredentialsMatch("", "", cfg), false);
    assert.equal(authConfig.adminCredentialsMatch("a@x.test", "pw", cfg), false);
  }
  assert.deepEqual(authConfig.getMissingAuthConfig({}), ["JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD"]);
  assert.deepEqual(authConfig.getMissingAuthConfig({ JWT_SECRET: "s", ADMIN_EMAIL: "e", ADMIN_PASSWORD: "p" }), []);
});

test("1b: with ADMIN_EMAIL/ADMIN_PASSWORD unset, an empty login body cannot authenticate and creates no session", async (t) => {
  if (guard(t)) return;
  await withEnv({ ADMIN_EMAIL: undefined, ADMIN_PASSWORD: undefined }, async () => {
    const before = await models.refresh.countDocuments({ actorType: "admin" });
    for (const body of [{}, { email: "", password: "" }, { email: null, password: null }, { rememberMe: true }, "{}"]) {
      const r = await api("/api/admin/login", { method: "POST", body });
      assert.equal(r.body?.success, false, `body ${text(body)} -> ${text(r.body)}`);
      assert.ok(!r.body?.token, "no token may be issued");
      assert.ok(r.status === 503 || r.status === 200);
    }
    assert.equal(await models.refresh.countDocuments({ actorType: "admin" }), before, "no admin session row may be created");
  });
});

test("1c: with config present, empty/partial/wrong/non-string credentials are rejected and correct ones accepted", async (t) => {
  if (guard(t)) return;
  const before = await models.refresh.countDocuments({ actorType: "admin" });
  for (const body of [{}, { email: "", password: "" }, { email: ADMIN.email }, { password: ADMIN.password },
    { email: ADMIN.email, password: "nope" }, { email: ["x"], password: [ADMIN.password] }, { email: { $ne: "" }, password: { $ne: "" } }]) {
    const r = await api("/api/admin/login", { method: "POST", body });
    assert.equal(r.body?.success, false, `body ${text(body)}`);
    assert.ok(!r.body?.token);
  }
  assert.equal(await models.refresh.countDocuments({ actorType: "admin" }), before);
  const ok = await api("/api/admin/login", { method: "POST", body: ADMIN });
  assert.equal(ok.body.success, true, text(ok.body));
  assert.equal(typeof ok.body.token, "string");
});

test("1d: with JWT_SECRET unset, signAccessToken throws and admin login issues nothing", async (t) => {
  if (guard(t)) return;
  await withEnv({ JWT_SECRET: undefined }, async () => {
    assert.throws(() => signAccessToken({ id: "x" }), /not configured/);
    const r = await api("/api/admin/login", { method: "POST", body: ADMIN });
    assert.ok(!r.body?.token);
  });
});

test("1e: authAdmin rejects tokens without an email while ADMIN_EMAIL is unset (undefined === undefined)", async (t) => {
  if (guard(t)) return;
  const emailless = jwt.sign({ actorType: "admin" }, process.env.JWT_SECRET, { expiresIn: "5m" });
  await withEnv({ ADMIN_EMAIL: undefined }, async () => {
    const r = await api("/api/admin/sessions", { headers: { atoken: emailless } });
    assert.ok([401, 403].includes(r.status), `status ${r.status}`);
    assert.notEqual(r.body?.success, true);
  });
  // ...and also when configured: an email-less or wrong-email token is rejected.
  for (const tk of [emailless, jwt.sign({ email: "someone@else.test" }, process.env.JWT_SECRET, { expiresIn: "5m" })]) {
    const r = await api("/api/admin/sessions", { headers: { atoken: tk } });
    assert.ok([401, 403].includes(r.status), `status ${r.status}`);
  }
  assert.equal((await api("/api/admin/sessions", { headers: { atoken: tokens.admin } })).status, 200);
});

test("1f: admin refresh cookie for a label-less session cannot mint an admin token", async (t) => {
  if (guard(t)) return;
  const { issueSession } = await import("../utils/session.js");
  let cookie;
  await issueSession({
    req: { headers: {}, ip: "127.0.0.1" }, res: { cookie: (_n, v) => { cookie = v; } },
    actorType: "admin", actorId: null, actorLabel: "",
  });
  const r = await fetch(base + "/api/admin/refresh-token", { method: "POST", headers: { cookie: `curalink_admin_rt=${encodeURIComponent(cookie)}` } });
  assert.equal(r.status, 401);
});

// ───────────────────────── Fix 2: no hashes / sensitive fields ─────────────────────────

const SECRET_MARKERS = ["OLDHASH1", "OLDHASH2", "previousPasswords", "\"password\"", HASH];

const assertNoSecrets = (payload, label) => {
  const s = text(payload);
  for (const m of SECRET_MARKERS) assert.ok(!s.includes(m), `${label} leaked ${m}`);
};

test("2a: public doctor list exposes only whitelisted fields", async (t) => {
  if (guard(t)) return;
  const r = await api("/api/doctor/list");
  assert.equal(r.body.success, true);
  assert.ok(!text(r.body).includes("passwordChangedAt"));
  assert.equal(r.body.doctors.length, 2);
  assertNoSecrets(r.body, "doctor list");
  const d = r.body.doctors.find((x) => x.name === "Dr Test");
  for (const f of ["email", "licenseNumber", "phone", "slots_booked", "signature", "emailVerified", "verifiedBy", "verifiedAt"]) {
    assert.ok(!(f in d), `doctor list exposes ${f}`);
  }
  assert.ok(!text(r.body).includes("LIC-SECRET-1") && !text(r.body).includes("555-0199") && !text(r.body).includes("doctor@hardening.test"));
  // Everything the patient UI renders is still present.
  for (const f of ["_id", "name", "image", "speciality", "degree", "experience", "about", "fees", "available", "address", "averageRating", "totalReviews", "verificationStatus", "todaySlotCount"]) {
    assert.ok(f in d, `doctor list lost ${f}`);
  }
  assert.equal(d.hospitalId.name, "Test Hospital");
});

test("2b: public hospital list and hospital details expose only whitelisted fields", async (t) => {
  if (guard(t)) return;
  for (const path of ["/api/hospital/list", `/api/hospital/${ids.hospital}`]) {
    const r = await api(path);
    assert.equal(r.body.success, true, path);
    assertNoSecrets(r.body, path);
    assert.ok(!text(r.body).includes("passwordChangedAt"), path);
    const h = r.body.hospitals ? r.body.hospitals[0] : r.body.hospital;
    for (const f of ["email", "emailVerified", "verifiedBy", "verifiedAt", "doctors"]) assert.ok(!(f in h), `${path} exposes ${f}`);
    assert.ok(!text(r.body).includes("hospital@hardening.test"));
    for (const f of ["_id", "name", "phone", "website", "address", "active", "verificationStatus"]) assert.ok(f in h, `${path} lost ${f}`);
  }
  const detail = await api(`/api/hospital/${ids.hospital}`);
  assert.equal(detail.body.doctors.length, 1);
  assert.ok(!text(detail.body.doctors).includes("LIC-SECRET-1") && !text(detail.body.doctors).includes("doctor@hardening.test"));
  assert.ok(!("slots_booked" in detail.body.doctors[0]));
});

test("2c: patient profile and admin user/doctor/hospital lists never return hashes", async (t) => {
  if (guard(t)) return;
  const profile = await api("/api/user/get-profile", { headers: { token: tokens.patient } });
  assert.equal(profile.body.success, true);
  assertNoSecrets(profile.body, "get-profile");

  const users = await api("/api/admin/all-users", { method: "GET", headers: { atoken: tokens.admin } });
  assert.equal(users.status, 200, text(users.body));
  assertNoSecrets(users.body, "admin all-users");
  const docs = await api("/api/admin/all-doctors", { method: "POST", headers: { atoken: tokens.admin }, body: {} });
  assertNoSecrets(docs.body, "admin all-doctors");
  const hosp = await api("/api/admin/all-hospitals", { headers: { atoken: tokens.admin } });
  assertNoSecrets(hosp.body, "admin all-hospitals");
});

test("2d: legacy appointment snapshots with stored hashes are scrubbed on every read path", async (t) => {
  if (guard(t)) return;
  const mine = await api("/api/user/appointments", { headers: { token: tokens.patient } });
  assert.equal(mine.body.appointments.length, 1);
  assertNoSecrets(mine.body, "patient appointments");
  const adminList = await api("/api/admin/appointments", { headers: { atoken: tokens.admin } });
  assertNoSecrets(adminList.body, "admin appointments (lean)");
  const hosp = await api("/api/hospital/self/appointments", { headers: { htoken: tokens.hospital } });
  assertNoSecrets(hosp.body, "hospital appointments");
  // In-memory only — the stored document is untouched.
  const raw = await models.appointment.collection.findOne({ userId: new mongoose.Types.ObjectId(ids.patient) });
  assert.ok(raw.userData.previousPasswords?.length, "scrub must not write back to the database");
});

test("2e: previousPasswords is select:false but password-reuse protection still works", async (t) => {
  if (guard(t)) return;
  assert.equal((await models.user.findById(ids.patient)).previousPasswords, undefined);
  assert.equal((await models.user.findById(ids.patient).select("+previousPasswords")).previousPasswords.length, 2);
  for (const m of ["doctor", "hospital"]) {
    assert.equal((await models[m].findOne({})).previousPasswords, undefined, `${m} must not load hash history by default`);
  }
  // Change to a new password, then try to change straight back: must be refused as reuse.
  const change = (currentPassword, newPassword) =>
    api("/api/user/change-password", { method: "POST", headers: { token: tokens.patient }, body: { currentPassword, newPassword, confirmPassword: newPassword } });
  const first = await change("Old!Passw0rd#1", "Newer!Passw0rd#2");
  assert.equal(first.body.success, true, text(first.body));
  // Session invalidation after a password change means a fresh token is needed.
  await new Promise((r) => setTimeout(r, 1100));
  tokens.patient = signAccessToken({ id: ids.patient });
  const back = await change("Newer!Passw0rd#2", "Old!Passw0rd#1");
  assert.equal(back.body.success, false);
  assert.match(back.body.message, /haven't used recently/);
});

// ───────────────────────── Fix 3: authenticated attachments ─────────────────────────

const recordPath = () => `/api/medical-records/appointment/${ids.appointment}`;
const parseSigned = (u) => new URL(u);

test("3a: owner patient gets short-lived signed URLs; storage identifiers are never returned", async (t) => {
  if (guard(t)) return;
  const r = await api(recordPath(), { headers: { token: tokens.patient } });
  assert.equal(r.body.success, true, text(r.body));
  const [fresh, legacy] = r.body.record.attachments;
  const u = parseSigned(fresh.url);
  assert.equal(u.hostname, "api.cloudinary.com");
  assert.match(u.pathname, /\/v1_1\/testcloud\/image\/download$/);
  assert.equal(u.searchParams.get("public_id"), "records/new-file");
  assert.equal(u.searchParams.get("type"), "authenticated");
  assert.ok(u.searchParams.get("signature"), "URL must be signed");
  const ttl = Number(u.searchParams.get("expires_at")) - Math.floor(Date.now() / 1000);
  assert.ok(ttl > 0 && ttl <= 600, `expires in ${ttl}s`);
  assert.equal(fresh.expiresInSeconds, 600);
  assert.ok(!u.searchParams.has("api_secret") && !fresh.url.includes("test-api-secret"));
  // legacy attachment untouched (no publicId): existing records keep working
  assert.equal(legacy.url, "https://res.cloudinary.com/testcloud/image/upload/v1/legacy.pdf");
  const s = text(r.body);
  assert.ok(!s.includes("publicId") && !s.includes("resourceType") && !/"format"/.test(s), "storage identifiers leaked");
});

test("3b: historical version snapshots are signed too, and never expose publicId", async (t) => {
  if (guard(t)) return;
  const r = await api(recordPath(), { headers: { dtoken: tokens.doctor } });
  assert.equal(r.body.success, true, text(r.body));
  const old = r.body.record.versions[0].snapshot.attachments[0];
  const u = parseSigned(old.url);
  assert.equal(u.searchParams.get("public_id"), "records/old-version-file");
  assert.ok(u.searchParams.get("signature") && u.searchParams.get("expires_at"));
  assert.ok(!text(r.body).includes("publicId"));
});

test("3c: unauthorized callers cannot obtain any attachment URL", async (t) => {
  if (guard(t)) return;
  const cases = [
    ["no credentials", {}, 401],
    ["other patient", { token: tokens.patient2 }, 403],
    ["unrelated doctor", { dtoken: tokens.otherDoctor }, 403],
    ["forged token", { token: jwt.sign({ id: ids.patient }, "wrong-secret") }, 401],
    ["expired token", { token: jwt.sign({ id: ids.patient }, process.env.JWT_SECRET, { expiresIn: -60 }) }, 401],
  ];
  for (const [label, headers, status] of cases) {
    const r = await api(recordPath(), { headers });
    assert.equal(r.status, status, `${label}: ${r.status} ${text(r.body)}`);
    assert.ok(!text(r.body).includes("cloudinary.com") && !text(r.body).includes("records/"), `${label} leaked an attachment reference`);
  }
  // Authorized list endpoints are scoped as well.
  const other = await api("/api/medical-records/mine", { headers: { token: tokens.patient2 } });
  assert.ok(!text(other.body).includes("new-file") && !text(other.body).includes("legacy.pdf"));
});

test("3d: the owning hospital's lean patient-detail view also returns signed URLs only", async (t) => {
  if (guard(t)) return;
  const r = await api(`/api/hospital/self/patients/${ids.patient}`, { headers: { htoken: tokens.hospital } });
  assert.equal(r.body.success, true, text(r.body));
  const rec = r.body.records[0];
  assert.ok(parseSigned(rec.attachments[0].url).searchParams.get("signature"));
  assert.ok(parseSigned(rec.versions[0].snapshot.attachments[0].url).searchParams.get("signature"));
  assert.ok(!text(r.body).includes("publicId") && !text(r.body).includes("test-api-secret"));
  assertNoSecrets(r.body, "hospital patient detail");
});

test("3e: new uploads use authenticated delivery and store only the public_id", async (t) => {
  if (guard(t)) return;
  const ctl = await import("../controllers/medicalRecordController.js");
  let uploadOptions;
  const original = cloudinary.uploader.upload;
  cloudinary.uploader.upload = async (_path, options) => {
    uploadOptions = options;
    return { public_id: "records/uploaded-now", resource_type: "image", format: "pdf", secure_url: "https://res.cloudinary.com/testcloud/image/authenticated/s--x--/v1/records/uploaded-now.pdf" };
  };
  try {
    let body; let status = 200;
    const res = { status(c) { status = c; return res; }, json(b) { body = b; return res; } };
    await ctl.addAttachment(
      { docId: ids.doctor, headers: {}, body: { appointmentId: ids.appointment }, file: { path: "unused", originalname: "scan.pdf", mimetype: "application/pdf" } },
      res
    );
    assert.equal(body.success, true, text(body));
    body = JSON.parse(JSON.stringify(body)); // what the client receives (applies toJSON)
    assert.equal(uploadOptions.type, "authenticated");
    const stored = await models.record.collection.findOne({ appointmentId: new mongoose.Types.ObjectId(ids.appointment) });
    const added = stored.attachments.find((a) => a.publicId === "records/uploaded-now");
    assert.equal(added.url, "", "no deliverable URL may be persisted");
    assert.equal(added.resourceType, "image");
    assert.ok(!JSON.stringify(stored).includes("s--x--"), "the permanent signed delivery URL must not be stored");
    assert.ok(!text(body).includes("publicId"));
    const returned = body.record.attachments.find((a) => a.fileName === "scan.pdf");
    assert.ok(parseSigned(returned.url).searchParams.get("signature"));
    // Finalized-record versioning keeps the protected reference in history.
    const again = await api(recordPath(), { headers: { token: tokens.patient } });
    assert.equal(again.body.record.attachments.length, 3);
  } finally {
    cloudinary.uploader.upload = original;
  }
});
