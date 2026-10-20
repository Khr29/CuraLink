import { test } from "node:test";
import assert from "node:assert/strict";
import { v2 as cloudinary } from "cloudinary";
import { resolveCloudinaryConfig } from "../config/cloudinaryConfig.js";
import connectCloudinary from "../config/cloudinary.js";

const PROD = { CLOUDINARY_NAME: "prodcloud", CLOUDINARY_API_KEY: "prodkey", CLOUDINARY_SECRET_KEY: "prodsecret" };
const DEV = { CLOUDINARY_DEV_NAME: "devcloud", CLOUDINARY_DEV_API_KEY: "devkey", CLOUDINARY_DEV_SECRET_KEY: "devsecret" };

test("development without dev credentials is unconfigured and ignores production credentials", () => {
  const r = resolveCloudinaryConfig({ NODE_ENV: "development", ...PROD });
  assert.equal(r.mode, "development");
  assert.equal(r.configured, false);
  assert.deepEqual(Object.values(r.config), [undefined, undefined, undefined]);
  assert.ok(!JSON.stringify(r).includes("prod"));
});

test("development with only some dev credentials stays unconfigured", () => {
  const r = resolveCloudinaryConfig({ NODE_ENV: "development", ...PROD, CLOUDINARY_DEV_NAME: "devcloud" });
  assert.equal(r.configured, false);
  assert.equal(r.config.cloud_name, undefined);
});

test("unset NODE_ENV is treated as non-production", () => {
  const r = resolveCloudinaryConfig({ ...PROD });
  assert.equal(r.mode, "development");
  assert.equal(r.configured, false);
});

test("development with full dev credentials uses only the dev account", () => {
  const r = resolveCloudinaryConfig({ NODE_ENV: "development", ...PROD, ...DEV });
  assert.equal(r.configured, true);
  assert.deepEqual(r.config, { cloud_name: "devcloud", api_key: "devkey", api_secret: "devsecret" });
});

test("production (NODE_ENV or RENDER) uses the regular credentials, unchanged", () => {
  for (const env of [{ NODE_ENV: "production" }, { RENDER: "true" }]) {
    const r = resolveCloudinaryConfig({ ...env, ...PROD, ...DEV });
    assert.equal(r.mode, "production");
    assert.deepEqual(r.config, { cloud_name: "prodcloud", api_key: "prodkey", api_secret: "prodsecret" });
  }
});

test("connectCloudinary leaves the SDK without credentials in development", async () => {
  const saved = { ...process.env };
  const savedWarn = console.warn;
  console.warn = () => {};
  try {
    Object.assign(process.env, { NODE_ENV: "development", ...PROD });
    delete process.env.RENDER;
    for (const k of Object.keys(DEV)) delete process.env[k];
    await connectCloudinary();
    const c = cloudinary.config();
    assert.equal(c.cloud_name, undefined);
    assert.equal(c.api_key, undefined);
    assert.equal(c.api_secret, undefined);
    // Fails locally for lack of credentials; no network request is made.
    await assert.rejects(async () => cloudinary.uploader.upload("nonexistent.png"), /api_key|cloud_name/i);
  } finally {
    console.warn = savedWarn;
    for (const k of Object.keys(process.env)) if (!(k in saved)) delete process.env[k];
    Object.assign(process.env, saved);
    cloudinary.config({ cloud_name: undefined, api_key: undefined, api_secret: undefined });
  }
});

test("connectCloudinary applies production credentials in production", async () => {
  const saved = { ...process.env };
  try {
    Object.assign(process.env, { NODE_ENV: "production", ...PROD });
    await connectCloudinary();
    assert.equal(cloudinary.config().cloud_name, "prodcloud");
    assert.equal(cloudinary.config().api_key, "prodkey");
  } finally {
    for (const k of Object.keys(process.env)) if (!(k in saved)) delete process.env[k];
    Object.assign(process.env, saved);
    cloudinary.config({ cloud_name: undefined, api_key: undefined, api_secret: undefined });
  }
});
