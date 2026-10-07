// Guards against a local/dev process connecting to a remote (potentially
// production) database by accident. Kept free of side effects so it can be
// unit tested (tests/dbSafety.test.js).

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

// True only for plain mongodb:// URIs whose every host is the local machine.
// mongodb+srv:// is always a DNS-discovered (remote) cluster.
export const isLocalMongoUri = (uri) => {
  if (typeof uri !== "string") return false;
  const match = uri.trim().match(/^mongodb:\/\/([^/?]+)/i);
  if (!match) return false;
  // Drop "user:pass@" credentials, keep the comma-separated host list.
  const hostList = match[1].slice(match[1].lastIndexOf("@") + 1);
  const hosts = hostList.split(",").map((h) => {
    const host = h.trim().toLowerCase();
    if (host.startsWith("[")) return host.slice(1, host.indexOf("]")); // [::1]:27017
    return host.split(":")[0];
  });
  return hosts.length > 0 && hosts.every((h) => LOCAL_HOSTS.has(h) || h.endsWith(".localhost"));
};

// Render sets RENDER=true on every service; NODE_ENV=production is the
// documented production setting (render.yaml). Either one marks a deployed
// environment, where a remote database is expected.
export const isDeployedEnvironment = (env = process.env) =>
  env.NODE_ENV === "production" || env.RENDER === "true";

// Throws (with a message that never includes the URI itself — it can carry
// credentials) when this process must not use the configured database.
export const assertSafeDatabaseTarget = (env = process.env) => {
  const uri = env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. For local development put MONGODB_URI=mongodb://127.0.0.1:27017/<db> " +
        "in backend/.env.local (see backend/.env.example)."
    );
  }
  if (isDeployedEnvironment(env) || isLocalMongoUri(uri)) return;
  if (env.ALLOW_REMOTE_DB === "true") return;
  throw new Error(
    "Refusing to start: this is a non-production process but MONGODB_URI points at a remote " +
      "database (possibly production). Use a local database via backend/.env.local, or set " +
      "ALLOW_REMOTE_DB=true if you deliberately want a remote staging database."
  );
};
