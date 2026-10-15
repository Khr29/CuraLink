import cors from "cors";
import { isDeployedEnvironment } from "../config/dbSafety.js";

// CORS is combined with `credentials: true`, so reflecting an arbitrary
// request Origin would let any website make authenticated cross-origin calls.
// The policy therefore FAILS CLOSED:
//   - CORS_ORIGIN set          -> only those exact origins are allowed
//   - unset, deployed (prod)   -> no cross-origin origin is allowed
//   - unset, local development -> only http(s)://localhost / 127.0.0.1 / [::1]
// A literal "*" entry is ignored (it is invalid with credentials anyway).

const LOCAL_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

// Browsers send Origin without a trailing slash; tolerate one in the config.
const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, "");

export const parseAllowedOrigins = (value) =>
  typeof value === "string"
    ? value
        .split(",")
        .map((o) => normalizeOrigin(o).toLowerCase()) // browsers send scheme/host lower-cased
        .filter((o) => o && o !== "*")
    : [];

export const isOriginAllowed = (origin, env = process.env) => {
  // No Origin header: same-origin or non-browser client (curl, server-to-server).
  // CORS is a browser control, so there is nothing to allow or deny here.
  if (!origin) return true;

  const configured = parseAllowedOrigins(env.CORS_ORIGIN);
  if (configured.length) return configured.includes(origin);

  if (isDeployedEnvironment(env)) return false;
  return LOCAL_ORIGIN_RE.test(origin);
};

// Disallowed origins get no CORS headers (the browser blocks the response)
// rather than a thrown error, so the API does not turn into a 500.
export const corsOriginCallback = (origin, callback) =>
  callback(null, isOriginAllowed(origin));

export const buildCorsOptions = () => ({
  origin: corsOriginCallback,
  credentials: true,
});

// The `cors` package skips CORS handling (and so omits Vary) entirely for a
// denied origin. The response still depends on the Origin header, so always
// say so — otherwise a shared cache could serve a "no CORS headers" reply to
// the allowed origin.
export const corsMiddleware = () => {
  const handler = cors(buildCorsOptions());
  return (req, res, next) => {
    res.vary("Origin");
    handler(req, res, next);
  };
};
