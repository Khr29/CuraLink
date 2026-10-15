import morgan from "morgan";

// Prescription verification tokens are bearer secrets that travel in the URL
// PATH (GET /api/medical-records/verify/:token and .../pharmacy/verify/:token),
// so a plain request logger writes them into the hosting platform's log
// stream — readable by anyone with log access, and retained far longer than
// the token should be useful. Everything that logs a URL must go through here.

const REDACTED = "[REDACTED]";

// Whatever follows a "/verify/" path segment is the token.
const VERIFY_SEGMENT_RE = /(\/verify\/)[^/?#\s]+/gi;

// Query-string parameters that carry secrets.
const SENSITIVE_QUERY_RE =
  /([?&](?:token|otp|code|password|secret|key|signature|sig|auth|authorization|access_token|refresh_token)=)[^&#\s]*/gi;

export const redactUrl = (url) => {
  if (typeof url !== "string") return "";
  return url.replace(VERIFY_SEGMENT_RE, `$1${REDACTED}`).replace(SENSITIVE_QUERY_RE, `$1${REDACTED}`);
};

const requestUrl = (req) => redactUrl(req.originalUrl || req.url || "");

morgan.token("safe-url", requestUrl);

// Same fields as morgan's "dev" format, with the URL redacted.
export const REQUEST_LOG_FORMAT =
  ":method :safe-url :status :response-time ms - :res[content-length]";

export const createRequestLogger = (options) => morgan(REQUEST_LOG_FORMAT, options);

export { requestUrl as redactedRequestUrl };
