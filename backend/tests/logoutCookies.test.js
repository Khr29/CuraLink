import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import mongoose from "mongoose";
import { refreshCookieOptions, clearCookieOptions } from "../utils/cookies.js";

// --- pure cookie-policy tests (no database) -------------------------------

test("clear options always match the set options (so browsers honour the clear)", () => {
  for (const env of [
    {},
    { NODE_ENV: "production" },
    { NODE_ENV: "production", COOKIE_SAME_SITE: "none", COOKIE_SECURE: "true" },
    { COOKIE_SAME_SITE: "strict", COOKIE_SECURE: "false" },
  ]) {
    const { maxAge, ...set } = refreshCookieOptions(true, env);
    assert.ok(maxAge > 0);
    assert.deepEqual(clearCookieOptions(env), set, JSON.stringify(env));
  }
});

test("production defaults: Secure on, httpOnly, path /", () => {
  const o = clearCookieOptions({ NODE_ENV: "production" });
  assert.equal(o.secure, true);
  assert.equal(o.httpOnly, true);
  assert.equal(o.path, "/");
  assert.equal(o.sameSite, "lax");
});

test("COOKIE_SECURE overrides the NODE_ENV default; local dev stays non-Secure", () => {
  assert.equal(clearCookieOptions({}).secure, false);
  assert.equal(clearCookieOptions({ NODE_ENV: "production", COOKIE_SECURE: "false" }).secure, false);
  assert.equal(clearCookieOptions({ COOKIE_SECURE: "true" }).secure, true);
});

// --- HTTP tests against the real routers ----------------------------------

process.env.JWT_SECRET = "test-secret-logoutcookies";
process.env.ADMIN_EMAIL = "admin@logoutcookies.test";
process.env.DISABLE_RATE_LIMITING = "true";
process.env.RAZORPAY_KEY_ID ??= "rzp_test_dummy";
process.env.RAZORPAY_KEY_SECRET ??= "dummy_secret";

const TEST_URI = `mongodb://127.0.0.1:27017/curalink_test_logoutcookies_${process.pid}`;

let skip = false, server, base;
let issueSession, signAccessToken, refreshTokenModel;
const actors = {};
const saved = {};

const ROLES = {
  user:     { header: "token",  prefix: "/api/user",     cookie: "curalink_user_rt" },
  doctor:   { header: "dtoken", prefix: "/api/doctor",   cookie: "curalink_doctor_rt" },
  hospital: { header: "htoken", prefix: "/api/hospital", cookie: "curalink_hospital_rt" },
  pharmacy: { header: "ptoken", prefix: "/api/pharmacy", cookie: "curalink_pharmacy_rt" },
  admin:    { header: "atoken", prefix: "/api/admin",    cookie: "curalink_admin_rt" },
};
const COLLECTION = { user: "users", doctor: "doctors", hospital: "hospitals", pharmacy: "pharmacies" };

const post = async (path, headers) => {
  const r = await fetch(base + path, { method: "POST", headers });
  let body;
  try { body = await r.json(); } catch { body = null; }
  return { status: r.status, body, setCookie: r.headers.getSetCookie?.() || [] };
};
const mintSession = async (role, actorId, label) => {
  let cookie;
  await issueSession({
    req: { headers: {}, ip: "127.0.0.1" },
    res: { cookie: (_n, value) => { cookie = value; } },
    actorType: role, actorId, actorLabel: label,
  });
  return cookie;
};
const clearedCookie = (setCookie, role) =>
  setCookie.find((c) => c.startsWith(`${ROLES[role].cookie}=;`));
const asHeaders = (role, cookie) => ({
  [ROLES[role].header]: actors[role].access,
  cookie: `${ROLES[role].cookie}=${encodeURIComponent(cookie)}`,
});

before(async () => {
  try {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 2000 });
  } catch {
    skip = "local mongod not reachable";
    return;
  }
  // Production-like cross-site cookie policy; read lazily so setting it here works.
  for (const k of ["COOKIE_SECURE", "COOKIE_SAME_SITE"]) saved[k] = process.env[k];
  process.env.COOKIE_SECURE = "true";
  process.env.COOKIE_SAME_SITE = "none";

  const express = (await import("express")).default;
  const cookieParser = (await import("cookie-parser")).default;
  ({ issueSession } = await import("../utils/session.js"));
  ({ signAccessToken } = await import("../utils/tokens.js"));
  refreshTokenModel = (await import("../models/refreshTokenModel.js")).default;
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  for (const [role, cfg] of Object.entries(ROLES)) {
    app.use(cfg.prefix, (await import(`../routes/${role}Route.js`)).default);
  }
  server = http.createServer(app);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${server.address().port}`;

  const db = mongoose.connection.db;
  for (const role of Object.keys(COLLECTION)) {
    const _id = new mongoose.Types.ObjectId();
    await db.collection(COLLECTION[role]).insertOne({
      _id, name: role, email: `${role}@logoutcookies.test`, isActive: true, active: true, verificationStatus: "approved",
    });
    actors[role] = { id: String(_id) };
  }
  actors.admin = { id: process.env.ADMIN_EMAIL };
  for (const role of Object.keys(ROLES)) {
    actors[role].access = role === "admin"
      ? signAccessToken({ email: process.env.ADMIN_EMAIL, actorType: "admin" })
      : signAccessToken({ id: actors[role].id, actorType: role });
  }
});

after(async () => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  if (skip) return;
  await new Promise((r) => server.close(r));
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

const guard = (t) => {
  if (skip) { t.skip(skip); return true; }
  return false;
};

const assertClearedWithMatchingAttributes = (setCookie, role, label) => {
  const c = clearedCookie(setCookie, role);
  assert.ok(c, `${label}: no clearing Set-Cookie for ${ROLES[role].cookie} in ${JSON.stringify(setCookie)}`);
  assert.match(c, /Path=\//i, label);
  assert.match(c, /HttpOnly/i, label);
  assert.match(c, /Secure/i, `${label}: clear must carry Secure (SameSite=None is rejected without it)`);
  assert.match(c, /SameSite=None/i, label);
  assert.match(c, /Expires=Thu, 01 Jan 1970/i, label);
};

for (const kind of ["logout", "logout-all"]) {
  test(`${kind}: clears the cookie with the same Secure/SameSite/HttpOnly/Path as it was set, for every role`, async (t) => {
    if (guard(t)) return;
    for (const role of Object.keys(ROLES)) {
      const cookie = await mintSession(role, role === "admin" ? null : actors[role].id, role === "admin" ? process.env.ADMIN_EMAIL : role);
      const r = await post(`${ROLES[role].prefix}/${kind}`, asHeaders(role, cookie));
      assert.equal(r.status, 200, `${role} ${kind}: ${JSON.stringify(r.body)}`);
      assert.equal(r.body?.success, true, `${role} ${kind}: ${JSON.stringify(r.body)}`);
      assertClearedWithMatchingAttributes(r.setCookie, role, `${role} ${kind}`);
    }
  });

  test(`${kind}: the old refresh cookie can no longer be used`, async (t) => {
    if (guard(t)) return;
    for (const role of Object.keys(ROLES)) {
      const cookie = await mintSession(role, role === "admin" ? null : actors[role].id, role === "admin" ? process.env.ADMIN_EMAIL : role);
      await post(`${ROLES[role].prefix}/${kind}`, asHeaders(role, cookie));
      const r = await post(`${ROLES[role].prefix}/refresh-token`, {
        cookie: `${ROLES[role].cookie}=${encodeURIComponent(cookie)}`,
      });
      assert.equal(r.status, 401, `${role} ${kind}: revoked cookie still refreshed`);
    }
  });
}

test("logout-all revokes every active session of the actor, not just the current one", async (t) => {
  if (guard(t)) return;
  const role = "doctor";
  const id = actors[role].id;
  const a = await mintSession(role, id, role);
  const b = await mintSession(role, id, role);
  await post(`${ROLES[role].prefix}/logout-all`, asHeaders(role, a));
  assert.equal(await refreshTokenModel.countDocuments({ actorType: role, actorId: id, revokedAt: null }), 0);
  const r = await post(`${ROLES[role].prefix}/refresh-token`, { cookie: `${ROLES[role].cookie}=${encodeURIComponent(b)}` });
  assert.equal(r.status, 401);
});

test("logout does not touch another actor's sessions", async (t) => {
  if (guard(t)) return;
  const other = await mintSession("hospital", actors.hospital.id, "hospital");
  const mine = await mintSession("doctor", actors.doctor.id, "doctor");
  await post(`${ROLES.doctor.prefix}/logout`, asHeaders("doctor", mine));
  const r = await post(`${ROLES.hospital.prefix}/refresh-token`, { cookie: `${ROLES.hospital.cookie}=${encodeURIComponent(other)}` });
  assert.equal(r.status, 200);
});
