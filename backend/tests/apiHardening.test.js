import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

// Regression tests for API input handling:
//   - malformed ObjectIds in route params -> 400 "Invalid id" (not a 200 that
//     echoes the Mongoose CastError text, model and path names included)
//   - unknown /api paths -> JSON 404
//   - 5xx errors never echo err.message; 4xx errors keep theirs
//   - the patient login rejects object-valued credentials up front
//
// Needs no database: every case is answered before a query would run, so
// nothing here connects to MongoDB.
process.env.JWT_SECRET = "test-secret-api-hardening";
process.env.DISABLE_RATE_LIMITING = "true";
process.env.NODE_ENV = "test";
process.env.RAZORPAY_KEY_ID ??= "rzp_test_dummy";
process.env.RAZORPAY_KEY_SECRET ??= "dummy_secret";

const { default: express } = await import("express");
const { objectIdParam, isObjectIdString } = await import("../middlewares/validateObjectId.js");
const { apiNotFound, errorHandler } = await import("../middlewares/errorHandlers.js");

let server, base;

const api = async (path, { method = "GET", body, headers = {} } = {}) => {
  const r = await fetch(base + path, {
    method,
    headers: { ...(body !== undefined ? { "content-type": "application/json" } : {}), ...headers },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  let json = null;
  try { json = await r.json(); } catch { /* non-JSON */ }
  return { status: r.status, body: json };
};

before(async () => {
  const names = ["hospital", "review", "schedule", "medical-records", "user"];
  const files = ["hospitalRoute", "reviewRoute", "scheduleRoute", "medicalRecordRoute", "userRoute"];
  const routers = await Promise.all(files.map(async (f) => (await import(`../routes/${f}.js`)).default));
  const app = express();
  app.use(express.json({ limit: "10kb" }));
  names.forEach((n, i) => app.use(`/api/${n}`, routers[i]));
  app.get("/api/boom", () => { throw new Error('E11000 duplicate key collection: "secretCollection"'); });
  app.get("/api/teapot", () => { const e = new Error("custom client error"); e.status = 418; throw e; });
  app.use("/api", apiNotFound);
  app.use(errorHandler);
  server = http.createServer(app);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => { await new Promise((r) => server?.close(r)); });

test("isObjectIdString: only 24-char hex strings", () => {
  assert.equal(isObjectIdString("6ac682ac933f2f962f4158ec"), true);
  assert.equal(isObjectIdString("6AC682AC933F2F962F4158EC"), true);
  for (const bad of ["abc", "", "6ac682ac933f2f962f4158e", "6ac682ac933f2f962f4158ecc", "zzc682ac933f2f962f4158ec", "123456789012", undefined, null, 5, {}, ["6ac682ac933f2f962f4158ec"]]) {
    assert.equal(isObjectIdString(bad), false, `rejects ${JSON.stringify(bad)}`);
  }
});

test("objectIdParam: calls next() for a valid id and 400s otherwise", () => {
  let nextCalled = false;
  objectIdParam({}, {}, () => { nextCalled = true; }, "6ac682ac933f2f962f4158ec");
  assert.equal(nextCalled, true);

  let status, payload;
  const res = { status(s) { status = s; return this; }, json(p) { payload = p; } };
  objectIdParam({}, res, () => assert.fail("next must not run"), "abc");
  assert.equal(status, 400);
  assert.deepEqual(payload, { success: false, message: "Invalid id" });
});

test("malformed ids on public routes are a 400 with no Mongoose internals", async () => {
  for (const path of [
    "/api/hospital/abc",
    "/api/review/doctor/abc",
    "/api/review/hospital/abc",
    "/api/schedule/doctor/abc/slots",
    "/api/medical-records/appointment/abc",
  ]) {
    const r = await api(path);
    assert.equal(r.status, 400, path);
    assert.deepEqual(r.body, { success: false, message: "Invalid id" }, path);
  }
});

test("malformed ids are rejected on authenticated routes too, before auth runs", async () => {
  // The id check runs first, so these reveal nothing about auth state either way.
  for (const [method, path] of [
    ["PATCH", "/api/review/abc"],
    ["DELETE", "/api/hospital/self/doctors/abc"],
    ["PATCH", "/api/hospital/self/doctor-requests/abc/approve"],
    ["GET", "/api/hospital/self/patients/abc"],
  ]) {
    const r = await api(path, { method });
    assert.equal(r.status, 400, `${method} ${path}`);
    assert.equal(r.body.message, "Invalid id");
  }
});

test("unknown /api paths answer with a JSON 404", async () => {
  const r = await api("/api/does-not-exist");
  assert.equal(r.status, 404);
  assert.deepEqual(r.body, { success: false, message: "Not found" });
});

test("error handler: 5xx hides the message, 4xx keeps it", async (t) => {
  // The handler logs each error's stack; keep the deliberate ones out of the report.
  t.mock.method(console, "error", () => {});
  const boom = await api("/api/boom");
  assert.equal(boom.status, 500);
  assert.deepEqual(boom.body, { success: false, message: "Internal Server Error" });
  assert.ok(!JSON.stringify(boom.body).includes("secretCollection"));

  const teapot = await api("/api/teapot");
  assert.equal(teapot.status, 418);
  assert.equal(teapot.body.message, "custom client error");

  // body-parser's own 400 (bad JSON) and 413 (too large) keep their text.
  const badJson = await api("/api/user/login", { method: "POST", body: "{bad" });
  assert.equal(badJson.status, 400);
  assert.equal(badJson.body.success, false);
  const tooBig = await api("/api/user/login", { method: "POST", body: { email: "a".repeat(20000) } });
  assert.equal(tooBig.status, 413);
});

test("patient login: object/array/non-string credentials are rejected up front", async () => {
  for (const body of [
    { email: { $ne: null }, password: { $ne: null } },
    { email: { $gt: "" }, password: "x" },
    { email: ["a@b.co"], password: "x" },
    { email: "a@b.co", password: { $ne: null } },
    { email: "a@b.co", password: 12345 },
    { email: "   ", password: "x" },
    {},
  ]) {
    const r = await api("/api/user/login", { method: "POST", body });
    assert.equal(r.status, 200, JSON.stringify(body));
    assert.deepEqual(r.body, { success: false, message: "Missing Details" }, JSON.stringify(body));
  }
});
