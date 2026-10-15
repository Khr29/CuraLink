import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cors from "cors";
import {
  parseAllowedOrigins,
  isOriginAllowed,
  corsOriginCallback,
  buildCorsOptions,
} from "../utils/corsConfig.js";

const EVIL = "https://evil.example.com";
const FRONTEND = "https://app.example.com";
const ADMIN = "https://admin.example.com";

test("parseAllowedOrigins trims, drops blanks and wildcards, strips trailing slashes", () => {
  assert.deepEqual(parseAllowedOrigins(` ${FRONTEND}/ , ,${ADMIN},* `), [FRONTEND, ADMIN]);
  assert.deepEqual(parseAllowedOrigins("*"), []);
  assert.deepEqual(parseAllowedOrigins(""), []);
  assert.deepEqual(parseAllowedOrigins(undefined), []);
});

test("configured allowlist: only exact listed origins pass", () => {
  const env = { NODE_ENV: "production", CORS_ORIGIN: `${FRONTEND},${ADMIN}` };
  assert.equal(isOriginAllowed(FRONTEND, env), true);
  assert.equal(isOriginAllowed(ADMIN, env), true);
  assert.equal(isOriginAllowed(EVIL, env), false);
  assert.equal(isOriginAllowed(`${FRONTEND}.evil.com`, env), false);
  assert.equal(isOriginAllowed("http://app.example.com", env), false);
  assert.equal(isOriginAllowed("http://localhost:5173", env), false);
});

test("REGRESSION: production with CORS_ORIGIN unset reflects NO origin", () => {
  for (const env of [{ NODE_ENV: "production" }, { RENDER: "true" }, { NODE_ENV: "production", CORS_ORIGIN: "" }]) {
    assert.equal(isOriginAllowed(EVIL, env), false);
    assert.equal(isOriginAllowed("http://localhost:5173", env), false);
  }
});

test("a lone wildcard CORS_ORIGIN does not open the API", () => {
  assert.equal(isOriginAllowed(EVIL, { NODE_ENV: "production", CORS_ORIGIN: "*" }), false);
  assert.equal(isOriginAllowed(EVIL, { CORS_ORIGIN: "*" }), false);
});

test("local development with CORS_ORIGIN unset allows localhost only", () => {
  const env = { NODE_ENV: "development" };
  for (const o of ["http://localhost:5173", "http://127.0.0.1:3000", "https://localhost", "http://[::1]:8080"]) {
    assert.equal(isOriginAllowed(o, env), true, o);
  }
  for (const o of [EVIL, "http://localhost.evil.com", "http://evil.com/localhost", "http://localhost:5173.evil.com"]) {
    assert.equal(isOriginAllowed(o, env), false, o);
  }
});

test("requests without an Origin header (non-browser clients) are not blocked", () => {
  assert.equal(isOriginAllowed(undefined, { NODE_ENV: "production" }), true);
});

test("corsOriginCallback never errors; it only signals allow/deny", () => {
  const results = [];
  corsOriginCallback(EVIL, (err, allowed) => results.push([err, allowed]));
  assert.equal(results[0][0], null);
  assert.equal(typeof results[0][1], "boolean");
});

test("buildCorsOptions keeps credentials enabled with a function origin (never `true` or '*')", () => {
  const opts = buildCorsOptions();
  assert.equal(opts.credentials, true);
  assert.equal(typeof opts.origin, "function");
});

// End-to-end through the real `cors` middleware, as server.js wires it.
const withServer = async (env, fn) => {
  const saved = { NODE_ENV: process.env.NODE_ENV, RENDER: process.env.RENDER, CORS_ORIGIN: process.env.CORS_ORIGIN };
  for (const k of Object.keys(saved)) delete process.env[k];
  Object.assign(process.env, env);
  const app = express();
  app.use(cors(buildCorsOptions()));
  app.get("/ping", (req, res) => res.json({ ok: true }));
  const server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
};

test("e2e REGRESSION: production, CORS_ORIGIN unset -> no ACAO / credentials headers for evil origin", async () => {
  await withServer({ NODE_ENV: "production" }, async (base) => {
    const res = await fetch(`${base}/ping`, { headers: { Origin: EVIL } });
    assert.equal(res.headers.get("access-control-allow-origin"), null);
    assert.equal(res.headers.get("access-control-allow-credentials"), null);

    const pre = await fetch(`${base}/ping`, {
      method: "OPTIONS",
      headers: { Origin: EVIL, "Access-Control-Request-Method": "GET" },
    });
    assert.equal(pre.headers.get("access-control-allow-origin"), null);
  });
});

test("e2e: configured origin is echoed with credentials; others are not", async () => {
  await withServer({ NODE_ENV: "production", CORS_ORIGIN: `${FRONTEND},${ADMIN}` }, async (base) => {
    const ok = await fetch(`${base}/ping`, { headers: { Origin: ADMIN } });
    assert.equal(ok.headers.get("access-control-allow-origin"), ADMIN);
    assert.equal(ok.headers.get("access-control-allow-credentials"), "true");

    const bad = await fetch(`${base}/ping`, { headers: { Origin: EVIL } });
    assert.equal(bad.headers.get("access-control-allow-origin"), null);
    assert.equal(bad.status, 200); // not turned into an error response
  });
});
