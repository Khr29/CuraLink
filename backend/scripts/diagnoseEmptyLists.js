// READ-ONLY diagnostic for "the public doctor / hospital lists are empty".
//
//   node scripts/diagnoseEmptyLists.js                    # counts in the database MONGODB_URI selects
//   node scripts/diagnoseEmptyLists.js --scan-other-dbs   # also counts doctors/hospitals in EVERY database on the cluster
//
// Performs ONLY countDocuments / listDatabases. It never inserts, updates,
// deletes or creates anything, and never prints the URI or credentials.
//
// Pointing it at a remote cluster is refused by config/dbSafety.js unless you
// set ALLOW_REMOTE_DB=true for that one command, e.g. (bash):
//   ALLOW_REMOTE_DB=true node scripts/diagnoseEmptyLists.js --scan-other-dbs
//
// How to read the result:
//   - selected database has 0 doctors/hospitals but ANOTHER database has them
//     -> MONGODB_URI is missing the right "/<dbname>" (the backend is reading
//        the default "test" database). Fix the URI in the Render environment.
//   - selected database HAS them -> the backend data is fine; the problem is
//     between the browser and the API (wrong VITE_BACKEND_URL, CORS_ORIGIN, a
//     sleeping free-tier backend, or an API error the frontend swallows).
import "../config/loadEnv.js";
import mongoose from "mongoose";
import connectDB from "../config/mongodb.js";
import { getMongoDatabaseName } from "../config/dbSafety.js";

const COLLECTIONS = ["doctors", "hospitals"];
const SYSTEM_DBS = new Set(["admin", "local", "config"]);

const countIn = async (db) => {
  const out = {};
  for (const name of COLLECTIONS) out[name] = await db.collection(name).countDocuments({});
  return out;
};

const main = async () => {
  await connectDB();
  const db = mongoose.connection.db;
  const uriDb = getMongoDatabaseName(process.env.MONGODB_URI);
  console.log(`[diagnose] database named in MONGODB_URI: ${uriDb || "(none -> default \"test\")"}`);
  console.log(`[diagnose] database actually in use:      ${db.databaseName}`);
  console.log(`[diagnose] counts in "${db.databaseName}":`, await countIn(db));

  if (process.argv.includes("--scan-other-dbs")) {
    let list;
    try {
      list = await db.admin().listDatabases({ nameOnly: true });
    } catch (error) {
      console.log(`[diagnose] cannot list databases with this user (${error.message}); check the Atlas UI instead.`);
      return;
    }
    for (const { name } of list.databases) {
      if (SYSTEM_DBS.has(name)) continue;
      console.log(`[diagnose] counts in "${name}"${name === db.databaseName ? " (in use)" : ""}:`, await countIn(mongoose.connection.client.db(name)));
    }
  }
};

main()
  .catch((error) => {
    console.error("[diagnose] aborted:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
