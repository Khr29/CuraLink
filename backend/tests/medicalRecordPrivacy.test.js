import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

// These tests drive the real controllers against a throwaway database on a
// LOCAL mongod. The URI is hardcoded on purpose: it must never be read from
// .env (which may point at production). If no local mongod is reachable the
// suite is skipped rather than failing or touching anything else.
const TEST_URI = `mongodb://127.0.0.1:27017/curalink_test_medrec_${process.pid}`;

let ctl, medicalRecordModel, appointmentModel;
let skip = false;
let A, B, doctorId, otherDoctorId, apptA, apptB;

const call = async (handler, req) => {
  let status = 200;
  let body;
  const res = {
    status(c) { status = c; return res; },
    json(b) { body = b; return res; },
  };
  await handler({ headers: {}, ip: "127.0.0.1", params: {}, query: {}, body: {}, ...req }, res);
  return { status, body };
};
const oid = () => new mongoose.Types.ObjectId();

before(async () => {
  try {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 2000 });
  } catch {
    skip = "local mongod not reachable";
    return;
  }
  // populate() needs every referenced model registered (the server does this via its routes).
  await Promise.all(["hospitalModel", "doctorModel", "userModels"].map((m) => import(`../models/${m}.js`)));
  ctl = await import("../controllers/medicalRecordController.js");
  medicalRecordModel = (await import("../models/medicalRecordModel.js")).default;
  appointmentModel = (await import("../models/appointmentModel.js")).default;

  A = oid(); B = oid(); doctorId = oid(); otherDoctorId = oid();
  // getRecordByAppointment populates patient/doctor, so they must exist.
  const db = mongoose.connection.db;
  await db.collection("users").insertMany([{ _id: A, name: "Patient A", email: "a@test.local" }, { _id: B, name: "Patient B", email: "b@test.local" }]);
  await db.collection("doctors").insertMany([{ _id: doctorId, name: "Dr One", email: "d1@test.local" }, { _id: otherDoctorId, name: "Dr Two", email: "d2@test.local" }]);
  const mk = (userId, docId) =>
    appointmentModel.create({
      userId, docId, slotDate: "1_1_2030", slotTime: "10:00", userData: {}, docData: {},
      amount: 1, date: Date.now(), isCompleted: true,
    });
  apptA = await mk(A, doctorId);
  apptB = await mk(B, doctorId);
});

after(async () => {
  if (skip) return;
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

const draft = (appt, extra = {}) =>
  call(ctl.saveDraftRecord, {
    docId: doctorId.toString(),
    body: {
      appointmentId: appt._id.toString(),
      diagnosis: "Flu",
      notes: "rest",
      prescription: [{ medicineName: "Paracetamol", dose: "500mg", frequency: "Once daily", quantity: "10 tablets" }],
      ...extra,
    },
  });

test("TEST 1: a draft is NOT returned to its own patient (list, filters, by-appointment)", async (t) => {
  if (skip) return t.skip(skip);
  const d = await draft(apptA);
  assert.equal(d.body.success, true, d.body.message);
  assert.equal((await medicalRecordModel.findOne({ appointmentId: apptA._id })).status, "draft");

  for (const query of [{}, { status: "draft" }, { hasPrescription: "true" }, { status: "draft", hasPrescription: "true" }]) {
    const r = await call(ctl.getMyRecords, { userId: A.toString(), query });
    assert.equal(r.body.success, true);
    assert.equal(r.body.records.length, 0, `draft leaked with query ${JSON.stringify(query)}`);
  }

  const byAppt = await call(ctl.getRecordByAppointment, { userId: A.toString(), params: { appointmentId: apptA._id.toString() } });
  assert.equal(byAppt.body.success, false);
  assert.equal(byAppt.body.record, undefined);
  assert.equal(byAppt.body.message, "Record not found");

  const qr = await call(ctl.getPrescriptionQr, { userId: A.toString(), params: { appointmentId: apptA._id.toString() } });
  assert.equal(qr.body.success, false);
  assert.equal(qr.body.qrDataUrl, undefined);
});

test("TEST 4a: doctor still sees own draft (by appointment and in their list)", async (t) => {
  if (skip) return t.skip(skip);
  const r = await call(ctl.getRecordByAppointment, { docId: doctorId.toString(), params: { appointmentId: apptA._id.toString() } });
  assert.equal(r.body.success, true);
  assert.equal(r.body.record.status, "draft");
  const list = await call(ctl.getDoctorRecords, { docId: doctorId.toString() });
  assert.ok(list.body.records.some((x) => x.status === "draft"));
});

test("TEST 3: patient cannot reach another patient's draft or record by ID manipulation", async (t) => {
  if (skip) return t.skip(skip);
  // B's draft, requested by A
  await draft(apptB);
  const d = await call(ctl.getRecordByAppointment, { userId: A.toString(), params: { appointmentId: apptB._id.toString() } });
  assert.equal(d.status, 403);
  assert.equal(d.body.record, undefined);
  assert.equal((await call(ctl.getPrescriptionQr, { userId: A.toString(), params: { appointmentId: apptB._id.toString() } })).status, 403);
  // A's list never contains B's records
  const mine = await call(ctl.getMyRecords, { userId: A.toString() });
  assert.ok(mine.body.records.every((x) => x.patientId.toString() === A.toString()));
  // another doctor is also denied
  const od = await call(ctl.getRecordByAppointment, { docId: otherDoctorId.toString(), params: { appointmentId: apptA._id.toString() } });
  assert.equal(od.status, 403);
});

test("TEST 2 + 4b + 5: finalize -> patient sees it; doctor access intact; QR/verify work", async (t) => {
  if (skip) return t.skip(skip);
  const f = await call(ctl.finalizeRecord, { docId: doctorId.toString(), body: { appointmentId: apptA._id.toString() } });
  assert.equal(f.body.success, true, f.body.message);

  const list = await call(ctl.getMyRecords, { userId: A.toString() });
  assert.equal(list.body.records.length, 1);
  assert.equal(list.body.records[0].status, "finalized");
  const rx = await call(ctl.getMyRecords, { userId: A.toString(), query: { status: "finalized", hasPrescription: "true" } });
  assert.equal(rx.body.records.length, 1);

  const one = await call(ctl.getRecordByAppointment, { userId: A.toString(), params: { appointmentId: apptA._id.toString() } });
  assert.equal(one.body.success, true);

  // Patient B's own draft is still hidden and A's finalization didn't expose it
  const b = await call(ctl.getMyRecords, { userId: B.toString() });
  assert.equal(b.body.records.length, 0);

  // doctor + admin + (re-finalize locked)
  assert.equal((await call(ctl.getRecordByAppointment, { docId: doctorId.toString(), params: { appointmentId: apptA._id.toString() } })).body.success, true);
  assert.equal((await call(ctl.getRecordByAppointment, { adminEmail: "a@b.c", params: { appointmentId: apptB._id.toString() } })).body.record.status, "draft");
  assert.equal((await call(ctl.finalizeRecord, { docId: doctorId.toString(), body: { appointmentId: apptA._id.toString() } })).body.success, false);

  // QR works for the patient on the finalized prescription, and the public verify link resolves
  const qr = await call(ctl.getPrescriptionQr, { userId: A.toString(), params: { appointmentId: apptA._id.toString() } });
  assert.equal(qr.body.success, true, qr.body.message);
  assert.match(qr.body.qrDataUrl, /^data:image\/png/);
  const token = qr.body.verifyUrl.split("/verify/")[1];
  const v = await call(ctl.verifyPrescription, { params: { token } });
  assert.equal(v.body.success, true);
  assert.equal(JSON.stringify(v.body).includes("Flu"), false, "public verify must not leak diagnosis");
});
