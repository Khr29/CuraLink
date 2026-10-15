import { test } from "node:test";
import assert from "node:assert/strict";
import { getMongoDatabaseName } from "../config/dbSafety.js";

// A MONGODB_URI without "/<dbname>" makes Mongoose use the default database
// "test": usually empty, so public lists come back [] with no error. The
// startup warning in config/mongodb.js relies on this parser.
test("getMongoDatabaseName: names the selected database", () => {
  assert.equal(getMongoDatabaseName("mongodb+srv://u:p@cluster0.abc.mongodb.net/curalink?retryWrites=true&w=majority"), "curalink");
  assert.equal(getMongoDatabaseName("mongodb://127.0.0.1:27017/curalink_dev"), "curalink_dev");
  assert.equal(getMongoDatabaseName("mongodb://u:p@h1:27017,h2:27017/db?replicaSet=rs0"), "db");
  assert.equal(getMongoDatabaseName("mongodb+srv://u:p%40w@c.mongodb.net/my%20db"), "my db");
});

test("getMongoDatabaseName: empty when the URI names no database (the silent-'test' trap)", () => {
  for (const uri of [
    "mongodb+srv://u:p@cluster0.abc.mongodb.net/?retryWrites=true&w=majority",
    "mongodb+srv://u:p@cluster0.abc.mongodb.net",
    "mongodb+srv://u:p@cluster0.abc.mongodb.net/",
    "mongodb://localhost:27017",
    "mongodb://localhost:27017/?directConnection=true",
    "",
    undefined,
    null,
    "not a uri",
  ]) {
    assert.equal(getMongoDatabaseName(uri), "", String(uri));
  }
});

test("getMongoDatabaseName never returns credentials", () => {
  const name = getMongoDatabaseName("mongodb+srv://admin:SuperSecret@c.mongodb.net/?x=1");
  assert.ok(!name.includes("SuperSecret") && !name.includes("admin"));
});
