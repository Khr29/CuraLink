import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

// Drives the real controllers against a throwaway database on a LOCAL
// mongod (URI hardcoded on purpose — never read from .env). Skipped when no
// local mongod is reachable.
const TEST_URI = `mongodb://127.0.0.1:27017/curalink_test_pharmacy_${process.pid}`;

let pharmacyCtl, medCtl, medicalRecordModel, pharmacyModel, authAdmin;
let skip = false;

const call = async (handler, req) => {
  let status = 200;
  let body;
  const res = {
    status(c) { status = c; return res; },
    json(b) { body = b; return res; },
  };
  await handler({ headers: {}, ip: "127.0.0.1", params: {}, query: {}, body: {}, adminEmail: "admin@test.local", ...req }, res);
  return { status, body };
};

const PASSWORD = "Str0ng!Passw0rd#1";
const mk = (n, extra = {}) => ({
  name: `Pharmacy ${n}`,
  email: `p${n}@test.local`,
  password: PASSWORD,
  licenseNumber: `LIC-${n}`,
  phone: "+91 98765 43210",
  address: { city: "Pune" },
  ...extra,
});

before(async () => {
  try {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 2000 });
  } catch {
    skip = "local mongod not reachable";
    return;
  }
  pharmacyCtl = await import("../controllers/pharmacyController.js");
  medCtl = await import("../controllers/medicalRecordController.js");
  medicalRecordModel = (await import("../models/medicalRecordModel.js")).default;
  pharmacyModel = (await import("../models/pharmacyModel.js")).default;
  authAdmin = (await import("../middlewares/authAdmin.js")).default;
});

after(async () => {
  if (skip) return;
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test("create: succeeds, hashes the password, never returns it", async (t) => {
  if (skip) return t.skip(skip);
  const r = await call(pharmacyCtl.addPharmacy, { body: mk(1) });
  assert.equal(r.body.success, true, r.body.message);
  const stored = await pharmacyModel.findById(r.body.pharmacyId);
  assert.notEqual(stored.password, PASSWORD);
  const list = await call(pharmacyCtl.getAllPharmacies, {});
  assert.equal(JSON.stringify(list.body).includes('"password"'), false);
});

test("create: rejects duplicate email and duplicate license (case-insensitive)", async (t) => {
  if (skip) return t.skip(skip);
  const dupEmail = await call(pharmacyCtl.addPharmacy, { body: mk(2, { email: "P1@test.local" }) });
  assert.equal(dupEmail.body.success, false);
  assert.match(dupEmail.body.message, /email/);
  const dupLic = await call(pharmacyCtl.addPharmacy, { body: mk(3, { licenseNumber: "lic-1" }) });
  assert.equal(dupLic.body.success, false);
  assert.match(dupLic.body.message, /license/);
  assert.equal(await pharmacyModel.countDocuments({}), 1);
});

test("create: invalid input is rejected (missing name, bad email/phone, weak password, non-string)", async (t) => {
  if (skip) return t.skip(skip);
  for (const body of [
    mk(4, { name: "  " }),
    mk(4, { email: "not-an-email" }),
    mk(4, { phone: "abc" }),
    mk(4, { password: "weak" }),
    mk(4, { name: { $gt: "" } }),
    mk(4, { address: "{bad json" }),
  ]) {
    const r = await call(pharmacyCtl.addPharmacy, { body });
    assert.equal(r.body.success, false, JSON.stringify(body));
  }
  assert.equal(await pharmacyModel.countDocuments({}), 1);
});

test("two pharmacies may both leave the license blank", async (t) => {
  if (skip) return t.skip(skip);
  assert.equal((await call(pharmacyCtl.addPharmacy, { body: mk(5, { licenseNumber: "" }) })).body.success, true);
  assert.equal((await call(pharmacyCtl.addPharmacy, { body: mk(6, { licenseNumber: "" }) })).body.success, true);
});

test("list: search, status filter, pagination, unfiltered counts", async (t) => {
  if (skip) return t.skip(skip);
  const all = await call(pharmacyCtl.getAllPharmacies, { query: { limit: "2", page: "1" } });
  assert.equal(all.body.pharmacies.length, 2);
  assert.equal(all.body.pagination.total, 3);
  assert.equal(all.body.pagination.pages, 2);
  assert.deepEqual(all.body.counts, { total: 3, active: 3, inactive: 0 });

  const page2 = await call(pharmacyCtl.getAllPharmacies, { query: { limit: "2", page: "2" } });
  assert.equal(page2.body.pharmacies.length, 1);

  const search = await call(pharmacyCtl.getAllPharmacies, { query: { search: "lic-1" } });
  assert.equal(search.body.pharmacies.length, 1);
  // Regex metacharacters are treated literally, not as a pattern.
  const meta = await call(pharmacyCtl.getAllPharmacies, { query: { search: ".*" } });
  assert.equal(meta.body.pharmacies.length, 0);

  const inactive = await call(pharmacyCtl.getAllPharmacies, { query: { status: "inactive" } });
  assert.equal(inactive.body.pharmacies.length, 0);
  assert.equal(inactive.body.counts.total, 3);
});

test("update: only whitelisted fields change; active/password-hash cannot be injected", async (t) => {
  if (skip) return t.skip(skip);
  const p = await pharmacyModel.findOne({ email: "p1@test.local" });
  const before = p.password;
  const r = await call(pharmacyCtl.updatePharmacy, {
    params: { id: p._id.toString() },
    body: { name: "Renamed", active: false, emailVerified: false, previousPasswords: ["x"], _id: new mongoose.Types.ObjectId() },
  });
  assert.equal(r.body.success, true, r.body.message);
  const after = await pharmacyModel.findById(p._id).select("+previousPasswords");
  assert.equal(after.name, "Renamed");
  assert.equal(after.active, true);
  assert.equal(after.emailVerified, true);
  assert.deepEqual(after.previousPasswords, []);
  assert.equal(after.password, before);
});

test("update: duplicate email/license of another pharmacy is rejected; own values are fine", async (t) => {
  if (skip) return t.skip(skip);
  const p = await pharmacyModel.findOne({ email: "p1@test.local" });
  const other = await call(pharmacyCtl.updatePharmacy, { params: { id: p._id.toString() }, body: { licenseNumber: "LIC-1" } });
  assert.equal(other.body.success, true, "re-saving own license must not count as a duplicate");
  const dup = await call(pharmacyCtl.updatePharmacy, { params: { id: p._id.toString() }, body: { email: "p5@test.local" } });
  assert.equal(dup.body.success, false);
  const missing = await call(pharmacyCtl.updatePharmacy, { params: { id: new mongoose.Types.ObjectId().toString() }, body: { name: "x" } });
  assert.equal(missing.body.success, false);
});

test("status toggle: deactivates, reactivates, filters, and 404s cleanly", async (t) => {
  if (skip) return t.skip(skip);
  const p = await pharmacyModel.findOne({ email: "p1@test.local" });
  assert.equal((await call(pharmacyCtl.changePharmacyStatus, { params: { id: p._id.toString() } })).body.success, true);
  assert.equal((await pharmacyModel.findById(p._id)).active, false);
  const inactive = await call(pharmacyCtl.getAllPharmacies, { query: { status: "inactive" } });
  assert.equal(inactive.body.pharmacies.length, 1);
  assert.deepEqual(inactive.body.counts, { total: 3, active: 2, inactive: 1 });
  await call(pharmacyCtl.changePharmacyStatus, { params: { id: p._id.toString() } });
  assert.equal((await pharmacyModel.findById(p._id)).active, true);
  const missing = await call(pharmacyCtl.changePharmacyStatus, { params: { id: new mongoose.Types.ObjectId().toString() } });
  assert.equal(missing.body.success, false);
});

test("detail: returns the pharmacy without its password", async (t) => {
  if (skip) return t.skip(skip);
  const p = await pharmacyModel.findOne({ email: "p1@test.local" });
  const r = await call(pharmacyCtl.getPharmacyById, { params: { id: p._id.toString() } });
  assert.equal(r.body.success, true);
  assert.equal(r.body.pharmacy.password, undefined);
});

test("authAdmin: rejects missing and non-admin tokens", async (t) => {
  if (skip) return t.skip(skip);
  const noToken = await call(authAdmin, {});
  assert.equal(noToken.status, 401);
  const bad = await call(authAdmin, { headers: { atoken: "garbage" } });
  assert.equal(bad.status, 401);
});

test("route params: malformed ids are rejected before any controller runs", async (t) => {
  if (skip) return t.skip(skip);
  const { default: router } = await import("../routes/pharmacyRoute.js");
  const paramFns = router.params?.id || [];
  assert.ok(paramFns.length > 0, "router.param('id') must be registered");
  const bad = await call((req, res) => paramFns[0](req, res, () => res.json({ passed: true }), "abc"), {});
  assert.equal(bad.status, 400);
  const adminRoutes = router.stack.filter((l) => l.route && /^\/(detail|history|stats|list|add|update|status)/.test(l.route.path));
  for (const layer of adminRoutes) {
    assert.ok(layer.route.stack.some((s) => s.handle === authAdmin), `${layer.route.path} must use authAdmin`);
  }
});

// ---- dispensing history, stats, and the existing dispensing guard ----

let ph1, ph2, token;
const seedRecord = async () => {
  ph1 = await pharmacyModel.findOne({ email: "p1@test.local" });
  ph2 = await pharmacyModel.findOne({ email: "p5@test.local" });
  token = "tok-" + "a".repeat(30);
  // Inserted raw: the model's required fields (patient, doctor, appointment)
  // are irrelevant to the dispensing guard under test.
  await mongoose.connection.db.collection("medicalrecords").insertOne({
    prescriptionId: "RX-TEST-1",
    appointmentId: new mongoose.Types.ObjectId(),
    verificationToken: token,
    status: "final",
    prescriptionStatus: "active",
    finalizedAt: new Date(),
    prescription: [{ medicineName: "Paracetamol", quantity: "10", quantityPrescribed: 10, dispensedQuantity: 0 }],
    dispensingRecords: [],
    dispensing: { status: "pending" },
  });
};

const dispense = (pharmacy, quantity, medicineIndex = 0) =>
  call(medCtl.pharmacyDispense, { pharmacyId: pharmacy._id.toString(), params: { token }, body: { medicineIndex, quantity } });

test("dispensing: partial then full works; over-dispensing is refused", async (t) => {
  if (skip) return t.skip(skip);
  await seedRecord();
  assert.equal((await dispense(ph1, 4)).body.dispensing.status, "partially_dispensed");
  const over = await dispense(ph1, 7);
  assert.equal(over.body.success, false);
  assert.match(over.body.message, /only 6 remaining/);
  assert.equal((await dispense(ph2, 6)).body.dispensing.status, "dispensed");
  assert.equal((await dispense(ph1, 1)).body.success, false);
  for (const bad of [0, -1, 1.5, "abc", null]) {
    assert.equal((await dispense(ph1, bad)).body.success, false, `quantity ${bad}`);
  }
  const rec = await medicalRecordModel.collection.findOne({ prescriptionId: "RX-TEST-1" });
  assert.equal(rec.prescription[0].dispensedQuantity, 10);
  assert.equal(rec.dispensingRecords.length, 2);
});

test("dispensing: concurrent requests cannot exceed the prescribed quantity", async (t) => {
  if (skip) return t.skip(skip);
  token = "tok-" + "b".repeat(30);
  await mongoose.connection.db.collection("medicalrecords").insertOne({
    prescriptionId: "RX-TEST-2",
    appointmentId: new mongoose.Types.ObjectId(),
    verificationToken: token,
    status: "final",
    prescriptionStatus: "active",
    finalizedAt: new Date(),
    prescription: [{ medicineName: "Ibuprofen", quantity: "10", quantityPrescribed: 10, dispensedQuantity: 0 }],
    dispensingRecords: [],
    dispensing: { status: "pending" },
  });
  const results = await Promise.all(Array.from({ length: 6 }, () => dispense(ph1, 4)));
  const ok = results.filter((r) => r.body.success).length;
  assert.equal(ok, 2, "only 2 x 4 fits inside 10");
  const rec = await medicalRecordModel.collection.findOne({ prescriptionId: "RX-TEST-2" });
  assert.equal(rec.prescription[0].dispensedQuantity, 8);
  assert.equal(rec.dispensingRecords.length, 2);
});

test("history: only this pharmacy's confirmed dispenses, newest first, no patient data", async (t) => {
  if (skip) return t.skip(skip);
  const r = await call(pharmacyCtl.getPharmacyDispensingHistory, { params: { id: ph1._id.toString() }, query: { limit: "2" } });
  assert.equal(r.body.success, true);
  assert.equal(r.body.pagination.total, 3); // 4 on RX-1, plus 2 x 4 on RX-2
  assert.equal(r.body.history.length, 2);
  assert.ok(new Date(r.body.history[0].dispensedAt) >= new Date(r.body.history[1].dispensedAt));
  assert.deepEqual(Object.keys(r.body.history[0]).sort(), ["dispensedAt", "medicineName", "notes", "prescriptionId", "quantityDispensed"]);

  const other = await call(pharmacyCtl.getPharmacyDispensingHistory, { params: { id: ph2._id.toString() } });
  assert.equal(other.body.pagination.total, 1);
  assert.equal(other.body.history[0].quantityDispensed, 6);

  const none = await call(pharmacyCtl.getPharmacyDispensingHistory, { params: { id: new mongoose.Types.ObjectId().toString() } });
  assert.equal(none.body.history.length, 0);
});

test("stats: overall and per-pharmacy aggregates; bad id rejected", async (t) => {
  if (skip) return t.skip(skip);
  const overall = await call(pharmacyCtl.getPharmacyAdminStats, {});
  assert.deepEqual(overall.body.stats, {
    total: 3, active: 3, inactive: 0, dispensingEvents: 4, unitsDispensed: 18, prescriptionsServed: 2,
  });
  const one = await call(pharmacyCtl.getPharmacyAdminStats, { query: { pharmacyId: ph1._id.toString() } });
  assert.equal(one.body.stats.dispensingEvents, 3);
  assert.equal(one.body.stats.unitsDispensed, 12);
  assert.equal((await call(pharmacyCtl.getPharmacyAdminStats, { query: { pharmacyId: "nope" } })).body.success, false);
});
