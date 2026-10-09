import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";

// Drives the REAL routers, middlewares and refresh/rotation code over HTTP
// against a throwaway database on a LOCAL mongod (URI hardcoded on purpose:
// never read from .env, which may point at production). Skipped, not failed,
// if no local mongod is reachable.
process.env.JWT_SECRET = "test-secret-authrefresh";
process.env.ADMIN_EMAIL = "admin@authrefresh.test";
process.env.DISABLE_RATE_LIMITING = "true";
process.env.NODE_ENV = "test";
// userController constructs a Razorpay client at import time.
process.env.RAZORPAY_KEY_ID ??= "rzp_test_dummy";
process.env.RAZORPAY_KEY_SECRET ??= "dummy_secret";

const TEST_URI = `mongodb://127.0.0.1:27017/curalink_test_authrefresh_${process.pid}`;
const { default: jwt } = await import("jsonwebtoken");

let skip = false, server, base;
let issueSession, signAccessToken, hashToken, refreshTokenModel;
const actors = {}; // role -> { id, cookie, access }

// Per-role: request header, refresh endpoint, a cheap protected GET, cookie name.
const ROLES = {
  user:     { header: "token",  refresh: "/api/user/refresh-token",     probe: "/api/medical-records/mine",           cookie: "curalink_user_rt" },
  doctor:   { header: "dtoken", refresh: "/api/doctor/refresh-token",   probe: "/api/medical-records/doctor/mine",    cookie: "curalink_doctor_rt" },
  hospital: { header: "htoken", refresh: "/api/hospital/refresh-token", probe: "/api/medical-records/hospital/mine",  cookie: "curalink_hospital_rt" },
  pharmacy: { header: "ptoken", refresh: "/api/pharmacy/refresh-token", probe: "/api/medical-records/pharmacy/stats", cookie: "curalink_pharmacy_rt" },
  admin:    { header: "atoken", refresh: "/api/admin/refresh-token",    probe: "/api/admin/sessions",                 cookie: "curalink_admin_rt" },
};
const COLLECTION = { user: "users", doctor: "doctors", hospital: "hospitals", pharmacy: "pharmacies" };

const api = async (path, { method = "GET", headers = {} } = {}) => {
  const r = await fetch(base + path, { method, headers });
  let body;
  try { body = await r.json(); } catch { body = null; }
  return { status: r.status, body, setCookie: r.headers.getSetCookie?.() || [] };
};
const refresh = (role, cookieValue) =>
  api(ROLES[role].refresh, { method: "POST", headers: { cookie: `${ROLES[role].cookie}=${encodeURIComponent(cookieValue)}` } });
const cookieValueOf = (setCookie, role) => {
  const c = setCookie.find((x) => x.startsWith(ROLES[role].cookie + "="));
  return c ? decodeURIComponent(c.split(";")[0].slice(ROLES[role].cookie.length + 1)) : null;
};
const expiredToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: -60 });

// Fake res that just captures the cookie value issueSession sets.
const mintSession = async (role, actorId, label) => {
  let cookie;
  await issueSession({
    req: { headers: {}, ip: "127.0.0.1" },
    res: { cookie: (_name, value) => { cookie = value; } },
    actorType: role, actorId, actorLabel: label,
  });
  return cookie;
};

before(async () => {
  try {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 2000 });
  } catch {
    skip = "local mongod not reachable";
    return;
  }
  const express = (await import("express")).default;
  const cookieParser = (await import("cookie-parser")).default;
  ({ issueSession } = await import("../utils/session.js"));
  ({ signAccessToken, hashToken } = await import("../utils/tokens.js"));
  refreshTokenModel = (await import("../models/refreshTokenModel.js")).default;
  const names = ["admin", "doctor", "hospital", "pharmacy", "user", "medical-records"];
  const files = ["adminRoute", "doctorRoute", "hospitalRoute", "pharmacyRoute", "userRoute", "medicalRecordRoute"];
  const routers = await Promise.all(files.map(async (f) => (await import(`../routes/${f}.js`)).default));
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  names.forEach((n, i) => app.use(`/api/${n}`, routers[i]));
  server = http.createServer(app);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;

  const db = mongoose.connection.db;
  for (const role of Object.keys(COLLECTION)) {
    const _id = new mongoose.Types.ObjectId();
    await db.collection(COLLECTION[role]).insertOne({
      _id, name: role, email: `${role}@authrefresh.test`, isActive: true, active: true, verificationStatus: "approved",
    });
    actors[role] = { id: String(_id) };
  }
  actors.admin = { id: process.env.ADMIN_EMAIL };
  for (const role of Object.keys(ROLES)) {
    const a = actors[role];
    a.cookie = await mintSession(role, role === "admin" ? null : a.id, role === "admin" ? process.env.ADMIN_EMAIL : role);
    a.access = role === "admin"
      ? signAccessToken({ email: process.env.ADMIN_EMAIL, actorType: "admin" })
      : signAccessToken({ id: a.id, actorType: role });
  }
});

after(async () => {
  if (skip) return;
  await new Promise((r) => server.close(r));
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

const guard = (t) => {
  if (skip) { t.skip(skip); return true; }
  return false;
};

test("1: valid access token succeeds for every role", async (t) => {
  if (guard(t)) return;
  for (const [role, cfg] of Object.entries(ROLES)) {
    const r = await api(cfg.probe, { headers: { [cfg.header]: actors[role].access } });
    assert.equal(r.status, 200, `${role}: ${JSON.stringify(r.body)}`);
  }
});

test("2,5-8: expired access token -> 401; valid refresh cookie -> rotated cookie + new token that works (every role, incl. doctor)", async (t) => {
  if (guard(t)) return;
  for (const [role, cfg] of Object.entries(ROLES)) {
    const a = actors[role];
    const stale = expiredToken(role === "admin" ? { email: process.env.ADMIN_EMAIL } : { id: a.id });
    assert.equal((await api(cfg.probe, { headers: { [cfg.header]: stale } })).status, 401, `${role} expired should 401`);

    const r = await refresh(role, a.cookie);
    assert.equal(r.status, 200, `${role} refresh: ${JSON.stringify(r.body)}`);
    assert.ok(r.body.token);
    const rotated = cookieValueOf(r.setCookie, role);
    assert.ok(rotated && rotated !== a.cookie, `${role} cookie must rotate`);
    a.oldCookie = a.cookie;
    a.cookie = rotated;

    // the retry of the original request, carrying the new token
    assert.equal((await api(cfg.probe, { headers: { [cfg.header]: r.body.token } })).status, 200, `${role} retry`);
  }
});

test("3: invalid / missing / cross-role refresh cookie is rejected", async (t) => {
  if (guard(t)) return;
  for (const role of Object.keys(ROLES)) {
    assert.equal((await refresh(role, `${role}:deadbeef`)).status, 401);
    assert.equal((await refresh(role, "garbage")).status, 401);
    assert.equal((await api(ROLES[role].refresh, { method: "POST" })).status, 401, `${role} no cookie`);
  }
  // a valid doctor refresh value presented under the hospital cookie name, and vice versa
  assert.equal((await refresh("hospital", actors.doctor.cookie)).status, 401);
  assert.equal((await refresh("doctor", actors.hospital.cookie)).status, 401);
});

test("4: a token from one role never authorizes another role's routes", async (t) => {
  if (guard(t)) return;
  const roles = Object.keys(ROLES);
  for (const holder of roles) {
    for (const target of roles) {
      if (holder === target) continue;
      const r = await api(ROLES[target].probe, { headers: { [ROLES[target].header]: actors[holder].access } });
      assert.ok([401, 403].includes(r.status), `${holder} token accepted by ${target} route (${r.status})`);
    }
  }
});

test("9: replay of an already-rotated refresh token is rejected", async (t) => {
  if (guard(t)) return;
  for (const role of Object.keys(ROLES)) {
    assert.equal((await refresh(role, actors[role].oldCookie)).status, 401, `${role} replay`);
  }
});

test("10: simultaneous refreshes with one cookie -> exactly one succeeds (no bypass)", async (t) => {
  if (guard(t)) return;
  for (const role of ["doctor", "hospital"]) {
    const cookie = await mintSession(role, actors[role].id, role);
    const results = await Promise.all(Array.from({ length: 8 }, () => refresh(role, cookie)));
    assert.equal(results.filter((r) => r.status === 200).length, 1, `${role}: ${results.map((r) => r.status)}`);
    assert.equal(results.filter((r) => r.status === 401).length, 7);
  }
});

test("revoked and expired sessions cannot refresh", async (t) => {
  if (guard(t)) return;
  const revoked = await mintSession("doctor", actors.doctor.id, "doctor");
  await refreshTokenModel.updateOne({ tokenHash: hashToken(revoked.slice("doctor:".length)) }, { revokedAt: new Date() });
  assert.equal((await refresh("doctor", revoked)).status, 401);

  const expired = await mintSession("doctor", actors.doctor.id, "doctor");
  await refreshTokenModel.updateOne({ tokenHash: hashToken(expired.slice("doctor:".length)) }, { expiresAt: new Date(Date.now() - 1000) });
  assert.equal((await refresh("doctor", expired)).status, 401);
});
