import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { clearCookieOptions, refreshCookieOptions } from "../utils/cookies.js";
import { parseAllowedOrigins, isOriginAllowed, corsMiddleware } from "../utils/corsConfig.js";
import { applyAssetToRecords } from "../utils/legacyAttachmentsDb.js";
import { presentAttachment, isProtectedAttachment } from "../utils/attachmentAccess.js";

// --- cookies: SameSite=None must always be Secure ---------------------------

test("SameSite=None is always Secure, even if COOKIE_SECURE says otherwise (browsers drop insecure None cookies)", () => {
  for (const env of [
    { COOKIE_SAME_SITE: "none" },
    { COOKIE_SAME_SITE: "None", COOKIE_SECURE: "false" },
    { COOKIE_SAME_SITE: "NONE", NODE_ENV: "development" },
  ]) {
    assert.equal(clearCookieOptions(env).secure, true, JSON.stringify(env));
    assert.equal(refreshCookieOptions(false, env).secure, true, JSON.stringify(env));
  }
});

test("non-None SameSite keeps the existing Secure rules", () => {
  assert.equal(clearCookieOptions({ COOKIE_SAME_SITE: "lax" }).secure, false);
  assert.equal(clearCookieOptions({ COOKIE_SAME_SITE: "strict", NODE_ENV: "production" }).secure, true);
  assert.equal(clearCookieOptions({ COOKIE_SAME_SITE: "lax", COOKIE_SECURE: "false", NODE_ENV: "production" }).secure, false);
  assert.equal(clearCookieOptions({}).sameSite, "lax");
});

// --- CORS: config case-insensitivity + Vary: Origin -------------------------

test("CORS_ORIGIN entries are matched case-insensitively against browser-sent (lower-case) origins", () => {
  const env = { NODE_ENV: "production", CORS_ORIGIN: "HTTPS://App.Example.com/, https://Admin.Example.com" };
  assert.deepEqual(parseAllowedOrigins(env.CORS_ORIGIN), ["https://app.example.com", "https://admin.example.com"]);
  assert.equal(isOriginAllowed("https://app.example.com", env), true);
  assert.equal(isOriginAllowed("https://admin.example.com", env), true);
  assert.equal(isOriginAllowed("https://app.example.com.evil.io", env), false);
});

test("e2e: dynamic CORS responses carry Vary: Origin (so shared caches cannot serve one origin's headers to another)", async () => {
  const saved = { NODE_ENV: process.env.NODE_ENV, CORS_ORIGIN: process.env.CORS_ORIGIN };
  process.env.NODE_ENV = "production";
  process.env.CORS_ORIGIN = "https://app.example.com";
  const app = express();
  app.use(corsMiddleware());
  app.get("/p", (req, res) => res.json({}));
  const server = await new Promise((r) => { const s = app.listen(0, "127.0.0.1", () => r(s)); });
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const origin of ["https://app.example.com", "https://evil.example.com"]) {
      const res = await fetch(`${base}/p`, { headers: { Origin: origin } });
      assert.match(res.headers.get("vary") || "", /origin/i, origin);
    }
  } finally {
    await new Promise((r) => server.close(r));
    for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
  }
});

// --- migration database step (no Cloudinary involved) -----------------------

test("applyAssetToRecords: converts only the matching legacy attachments (live + version snapshots), idempotently", async (t) => {
  const uri = `mongodb://127.0.0.1:27017/curalink_test_migrate_${process.pid}`;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
  } catch {
    return t.skip("local mongod not reachable");
  }
  try {
    cloudinary.config({ cloud_name: "testcloud", api_key: "123456", api_secret: "test-api-secret" });
    const col = mongoose.connection.db.collection("medicalrecords");
    const target = "https://res.cloudinary.com/testcloud/image/upload/v1/records/legacy-1.pdf";
    const other = "https://res.cloudinary.com/testcloud/image/upload/v1/records/legacy-2.pdf";
    const asset = { url: target, publicId: "records/legacy-1", resourceType: "image", format: "pdf" };
    const a = await col.insertOne({
      attachments: [{ url: target, fileName: "one.pdf" }, { url: other, fileName: "two.pdf" }, { url: "", publicId: "records/already", resourceType: "image", format: "png" }],
      versions: [{ snapshot: { attachments: [{ url: target, fileName: "one.pdf" }, { url: other }] } }, { snapshot: { attachments: [] } }],
    });
    const b = await col.insertOne({ attachments: [{ url: target }], versions: [] });
    const c = await col.insertOne({ attachments: [{ url: other }] }); // must be untouched

    assert.equal(await applyAssetToRecords(col, asset), 3, "record a (live+version) and record b");
    const ra = await col.findOne({ _id: a.insertedId });
    assert.deepEqual(ra.attachments[0], { url: "", fileName: "one.pdf", publicId: "records/legacy-1", resourceType: "image", format: "pdf" });
    assert.equal(ra.attachments[1].url, other, "a different legacy asset is left alone");
    assert.equal(ra.attachments[1].publicId, undefined);
    assert.equal(ra.attachments[2].publicId, "records/already");
    assert.equal(ra.versions[0].snapshot.attachments[0].publicId, "records/legacy-1");
    assert.equal(ra.versions[0].snapshot.attachments[0].url, "");
    assert.equal(ra.versions[0].snapshot.attachments[1].url, other);
    assert.equal((await col.findOne({ _id: b.insertedId })).attachments[0].publicId, "records/legacy-1");
    assert.deepEqual(await col.findOne({ _id: c.insertedId }), { _id: c.insertedId, attachments: [{ url: other }] });

    // Idempotent: nothing matches the old URL any more.
    assert.equal(await applyAssetToRecords(col, asset), 0);

    // After migration, reads mint a short-lived signed link and hide the storage id.
    const migrated = ra.attachments[0];
    assert.equal(isProtectedAttachment(migrated), true);
    const shown = presentAttachment(migrated);
    assert.ok(new URL(shown.url).searchParams.get("signature"));
    assert.equal(shown.publicId, undefined);
  } finally {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
