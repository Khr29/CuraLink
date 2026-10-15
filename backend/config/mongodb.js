import dns from "node:dns/promises";
import mongoose from "mongoose";
import { assertSafeDatabaseTarget, getMongoDatabaseName } from "./dbSafety.js";

// Some local dev environments (e.g. a Linux systemd-resolved stub at
// 127.0.0.53) fail to resolve MongoDB Atlas SRV records. Instead of always
// forcing a public resolver (which itself times out on networks that block
// it), this is opt-in: set MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8 to use it.
// Never applied in production, where the host's resolver works.
if (process.env.NODE_ENV !== "production" && process.env.MONGODB_DNS_SERVERS) {
  dns.setServers(
    process.env.MONGODB_DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean)
  );
}

const connectDB = async () => {
  // Local/dev processes may only use a local database unless explicitly
  // allowed — see config/dbSafety.js.
  assertSafeDatabaseTarget();
  // A URI with no "/<dbname>" silently selects MongoDB's default database
  // ("test"), which is usually empty: every public list then returns [] with no
  // error. Say so loudly (names only — never the URI or credentials).
  if (!getMongoDatabaseName(process.env.MONGODB_URI)) {
    console.warn(
      '[CONFIG] MONGODB_URI names no database, so the default database "test" is in use. ' +
        "If your data lives in a named database, doctor/hospital lists will be EMPTY. " +
        "Put the database name in the URI path: mongodb+srv://<host>/<dbname>?<options>"
    );
  }
  mongoose.connection.on("connected", () =>
    console.log(`Database Connected (database: ${mongoose.connection.name})`)
  );
  await mongoose.connect(process.env.MONGODB_URI);
};

export default connectDB;
