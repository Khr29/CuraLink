import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import mongoose from "mongoose";
import { redactUrl, createRequestLogger } from "../utils/logRedaction.js";
import { parseCloudinaryAssetUrl, collectLegacyAttachments, planMigration } from "../utils/legacyAttachments.js";

const TOKEN = "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718";

// --- log redaction --------------------------------------------------------

test("redactUrl hides prescription verification tokens (public and pharmacy routes)", () => {
  assert.equal(redactUrl(`/api/medical-records/verify/${TOKEN}`), "/api/medical-records/verify/[REDACTED]");
  assert.equal(redactUrl(`/api/medical-records/pharmacy/verify/${TOKEN}`), "/api/medical-records/pharmacy/verify/[REDACTED]");
  assert.equal(redactUrl(`/api/medical-records/verify/${TOKEN}?x=1`), "/api/medical-records/verify/[REDACTED]?x=1");
  assert.equal(redactUrl(`/api/medical-records/verify/${encodeURIComponent(TOKEN)}/`), "/api/medical-records/verify/[REDACTED]/");
  assert.ok(!redactUrl(`/VERIFY/${TOKEN}`).includes(TOKEN));
});

test("redactUrl hides secret query parameters and leaves ordinary URLs alone", () => {
  assert.equal(redactUrl("/api/x?token=abc&page=2"), "/api/x?token=[REDACTED]&page=2");
  assert.equal(redactUrl("/api/x?page=2&otp=123456"), "/api/x?page=2&otp=[REDACTED]");
  assert.equal(redactUrl("/api/doctor/list?speciality=Cardiology"), "/api/doctor/list?speciality=Cardiology");
  assert.equal(redactUrl("/api/user/appointments"), "/api/user/appointments");
  assert.equal(redactUrl(undefined), "");
});

test("REGRESSION: the request logger never writes a verification token to the log stream", async () => {
  const lines = [];
  const app = express();
  app.use(createRequestLogger({ stream: { write: (l) => lines.push(l) } }));
  app.get("/api/medical-records/verify/:token", (req, res) => res.json({ ok: true }));
  app.get("/api/medical-records/pharmacy/verify/:token", (req, res) => res.status(404).json({ ok: false }));
  const server = await new Promise((r) => { const s = http.createServer(app).listen(0, "127.0.0.1", () => r(s)); });
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    await fetch(`${base}/api/medical-records/verify/${TOKEN}`);
    await fetch(`${base}/api/medical-records/pharmacy/verify/${TOKEN}?token=${TOKEN}`);
  } finally {
    await new Promise((r) => server.close(r));
  }
  const log = lines.join("");
  assert.equal(lines.length, 2);
  assert.ok(!log.includes(TOKEN), log);
  assert.match(log, /GET \/api\/medical-records\/verify\/\[REDACTED\] 200/);
  assert.match(log, /pharmacy\/verify\/\[REDACTED\]\?token=\[REDACTED\] 404/);
});

// --- legacy attachment parsing -------------------------------------------

test("parseCloudinaryAssetUrl: reverses plain public URLs", () => {
  assert.deepEqual(
    parseCloudinaryAssetUrl("https://res.cloudinary.com/democloud/image/upload/v1712345678/records/scan-1.pdf"),
    { cloudName: "democloud", resourceType: "image", publicId: "records/scan-1", format: "pdf" }
  );
  assert.deepEqual(
    parseCloudinaryAssetUrl("https://res.cloudinary.com/democloud/raw/upload/v1/records/report.docx"),
    { cloudName: "democloud", resourceType: "raw", publicId: "records/report.docx", format: "" }
  );
  assert.deepEqual(
    parseCloudinaryAssetUrl("https://res.cloudinary.com/democloud/image/upload/v9/a%20b/c%2Bd.png?x=1#f"),
    { cloudName: "democloud", resourceType: "image", publicId: "a b/c+d", format: "png" }
  );
  // transformations before the version are ignored, version anchors the public_id
  assert.equal(
    parseCloudinaryAssetUrl("https://res.cloudinary.com/democloud/image/upload/fl_attachment/v5/records/x.jpg").publicId,
    "records/x"
  );
});

test("parseCloudinaryAssetUrl: refuses anything ambiguous or foreign", () => {
  for (const bad of [
    undefined, "", "not a url",
    "http://res.cloudinary.com/c/image/upload/v1/a.png", // not https
    "https://evil.example.com/c/image/upload/v1/a.png",
    "https://res.cloudinary.com/c/image/authenticated/v1/a.png", // already not public
    "https://res.cloudinary.com/c/image/upload/w_100,h_100/a.png", // transformation, no version
    "https://res.cloudinary.com/c/image/upload/v1/../a.png",
    "https://res.cloudinary.com/c/image/upload/v1/",
    "https://res.cloudinary.com/c/image/upload/v1//a.png",
  ]) {
    assert.equal(parseCloudinaryAssetUrl(bad), null, String(bad));
  }
});

test("collectLegacyAttachments / planMigration: only url-without-publicId, across versions, deduped by URL", () => {
  const url = "https://res.cloudinary.com/democloud/image/upload/v1/records/a.pdf";
  const records = [
    {
      _id: "r1",
      attachments: [{ url }, { url: "", publicId: "records/new" }, { url: "https://x.example/y.pdf" }],
      versions: [{ snapshot: { attachments: [{ url }] } }],
    },
    { _id: "r2", attachments: [{ url }, { url: "https://res.cloudinary.com/other/image/upload/v1/z.png" }] },
    { _id: "r3", attachments: [{ url: "https://res.cloudinary.com/democloud/image/upload/v1/q.pdf", publicId: "q" }] },
  ];
  assert.equal(collectLegacyAttachments(records[0]).length, 3);
  const plan = planMigration(records, { cloudName: "democloud" });
  assert.deepEqual(plan.assets.map((a) => a.publicId), ["records/a"]);
  assert.deepEqual(plan.skipped.map((s) => s.reason).sort(), ["different_cloud", "not_a_plain_cloudinary_url"]);
});

// --- the real migration script, DRY RUN only, local throwaway database ------

test("migration script: dry run reports the plan and changes nothing", async (t) => {
  const uri = `mongodb://127.0.0.1:27017/curalink_test_attach_${process.pid}`;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
  } catch {
    return t.skip("local mongod not reachable");
  }
  try {
    const col = mongoose.connection.db.collection("medicalrecords");
    const url = "https://res.cloudinary.com/democloud/image/upload/v1/records/legacy-1.pdf";
    await col.insertOne({
      attachments: [{ url, fileName: "legacy-1.pdf" }],
      versions: [{ snapshot: { attachments: [{ url }] } }],
    });
    await col.insertOne({ attachments: [{ url: "", publicId: "records/already-new" }] });
    const before = JSON.stringify(await col.find().sort({ _id: 1 }).toArray());

    const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../scripts/migrateLegacyAttachments.js");
    const r = spawnSync(process.execPath, [script], {
      env: { ...process.env, MONGODB_URI: uri, NODE_ENV: "development", CLOUDINARY_NAME: "democloud", CLOUDINARY_API_KEY: "1", CLOUDINARY_SECRET_KEY: "x" },
      encoding: "utf8",
      timeout: 60000,
    });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /DRY RUN/);
    assert.match(r.stdout, /records with legacy attachments: 1/);
    assert.match(r.stdout, /unique assets to migrate: 1/);
    assert.match(r.stdout, /would migrate: image\/records\/legacy-1\.pdf/);
    assert.equal(JSON.stringify(await col.find().sort({ _id: 1 }).toArray()), before, "dry run must not modify any document");
  } finally {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
