import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isLocalMongoUri,
  isDeployedEnvironment,
  assertSafeDatabaseTarget,
} from "../config/dbSafety.js";

test("isLocalMongoUri accepts local hosts only", () => {
  for (const uri of [
    "mongodb://127.0.0.1:27017/curalink_dev",
    "mongodb://localhost/curalink",
    "mongodb://user:p%40ss@localhost:27017/db?authSource=admin",
    "mongodb://[::1]:27017/db",
    "mongodb://localhost:27017,127.0.0.1:27018/db?replicaSet=rs0",
  ]) {
    assert.equal(isLocalMongoUri(uri), true, uri);
  }
  for (const uri of [
    "mongodb+srv://user:pw@cluster0.abcde.mongodb.net/db",
    "mongodb://db.example.com:27017/db",
    "mongodb://localhost:27017,db.example.com:27017/db",
    "mongodb://localhost:pw@db.example.com/db", // "localhost" as a username, not a host
    "",
    undefined,
  ]) {
    assert.equal(isLocalMongoUri(uri), false, String(uri));
  }
});

test("deployed environment is detected from NODE_ENV or Render", () => {
  assert.equal(isDeployedEnvironment({ NODE_ENV: "production" }), true);
  assert.equal(isDeployedEnvironment({ RENDER: "true" }), true);
  assert.equal(isDeployedEnvironment({ NODE_ENV: "development" }), false);
  assert.equal(isDeployedEnvironment({}), false);
});

test("local dev process may use a local database", () => {
  assert.doesNotThrow(() =>
    assertSafeDatabaseTarget({ MONGODB_URI: "mongodb://127.0.0.1:27017/curalink_dev" })
  );
});

test("local dev process refuses a remote database", () => {
  assert.throws(
    () => assertSafeDatabaseTarget({ MONGODB_URI: "mongodb+srv://u:secretpw@prod.mongodb.net/db" }),
    (err) => {
      assert.match(err.message, /Refusing to start/);
      assert.doesNotMatch(err.message, /secretpw|prod\.mongodb\.net/, "URI must never be echoed");
      return true;
    }
  );
});

test("remote database is allowed in production, on Render, or with explicit opt-in", () => {
  const MONGODB_URI = "mongodb+srv://u:p@prod.mongodb.net/db";
  assert.doesNotThrow(() => assertSafeDatabaseTarget({ MONGODB_URI, NODE_ENV: "production" }));
  assert.doesNotThrow(() => assertSafeDatabaseTarget({ MONGODB_URI, RENDER: "true" }));
  assert.doesNotThrow(() => assertSafeDatabaseTarget({ MONGODB_URI, ALLOW_REMOTE_DB: "true" }));
  assert.throws(() => assertSafeDatabaseTarget({ MONGODB_URI, ALLOW_REMOTE_DB: "1" }));
});

test("missing MONGODB_URI fails with a helpful message", () => {
  assert.throws(() => assertSafeDatabaseTarget({}), /MONGODB_URI is not set/);
});
