import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { getMissingIntegrationConfig, getCookieAdvice } from "../utils/integrationConfig.js";

test("lists only unset integration variables, by name", () => {
  assert.equal(getMissingIntegrationConfig({
    CLOUDINARY_NAME: "x", CLOUDINARY_API_KEY: "x", CLOUDINARY_SECRET_KEY: "x",
    RAZORPAY_KEY_ID: "x", RAZORPAY_KEY_SECRET: "x", CURRENCY: "INR",
    EMAIL_USER: "x", EMAIL_PASS: "x", CORS_ORIGIN: "https://a.example",
  }).length, 0);
  const missing = getMissingIntegrationConfig({ CLOUDINARY_NAME: "x", EMAIL_USER: "  ", CURRENCY: "INR" });
  const byFeature = Object.fromEntries(missing.map((m) => [m.feature, m.names]));
  assert.deepEqual(byFeature["image uploads (Cloudinary)"], ["CLOUDINARY_API_KEY", "CLOUDINARY_SECRET_KEY"]);
  assert.deepEqual(byFeature["payments (Razorpay)"], ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"]);
  assert.deepEqual(byFeature["email (Gmail)"], ["EMAIL_USER", "EMAIL_PASS"]);
});

test("cookie advice only for production without SameSite=none", () => {
  assert.ok(getCookieAdvice({ NODE_ENV: "production" }));
  assert.ok(getCookieAdvice({ NODE_ENV: "production", COOKIE_SAME_SITE: "lax" }));
  assert.equal(getCookieAdvice({ NODE_ENV: "production", COOKIE_SAME_SITE: "None" }), null);
  assert.equal(getCookieAdvice({ NODE_ENV: "development" }), null);
});

test("razorpay client module loads without Razorpay keys (must not crash startup)", () => {
  const env = { ...process.env };
  delete env.RAZORPAY_KEY_ID;
  delete env.RAZORPAY_KEY_SECRET;
  const out = execFileSync(
    process.execPath,
    ["--input-type=module", "-e",
      'const m = await import("./utils/razorpayClient.js"); console.log(typeof m.razorpayInstance.orders.create)'],
    { env, cwd: new URL("..", import.meta.url), encoding: "utf8" },
  );
  assert.equal(out.trim(), "function");
});
