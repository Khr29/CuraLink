import axios from "axios";
import { toast } from "react-toastify";

// Access tokens are short-lived (15 min) by design — see backend/utils/tokens.js.
// This app hosts four roles (admin/doctor/hospital/pharmacy) sharing one
// axios instance, so the interceptor inspects which token header a failed
// request used to know which refresh endpoint / localStorage key / React
// setter applies, refreshes silently via the httpOnly cookie, and retries
// the request once.
const ROLE_CONFIG = {
  atoken: { refreshPath: "/api/admin/refresh-token", storageKey: "aToken" },
  dtoken: { refreshPath: "/api/doctor/refresh-token", storageKey: "dToken" },
  htoken: { refreshPath: "/api/hospital/refresh-token", storageKey: "hToken" },
  ptoken: { refreshPath: "/api/pharmacy/refresh-token", storageKey: "pToken" },
};

// Wire convention: role headers are lowercase (atoken/dtoken/htoken/ptoken),
// which is what the backend reads. HTTP header names are case-insensitive, but
// axios preserves whatever casing a call site used (`{ dToken }` is common for
// doctor calls), and a plain `headers["dtoken"]` property lookup is
// case-sensitive. All header access therefore goes through these helpers so a
// differently-cased call site is recognised and updated correctly.
const readHeader = (headers, name) => {
  if (!headers) return undefined;
  if (typeof headers.get === "function") return headers.get(name) || undefined; // AxiosHeaders: case-insensitive
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name);
  return key ? headers[key] : undefined;
};

const writeHeader = (headers, name, value) => {
  if (typeof headers.set === "function") {
    headers.set(name, value, true); // case-insensitive match: overwrites e.g. "dToken" rather than adding a second header
    return;
  }
  for (const k of Object.keys(headers)) if (k.toLowerCase() === name) delete headers[k];
  headers[name] = value;
};

const setters = {};

export const registerTokenSetter = (headerName, setter) => {
  setters[headerName] = setter;
};

// The refresh token is single-use/rotating (backend/utils/session.js), so if
// several requests 401 at once and each independently calls /refresh-token,
// only the first succeeds and the rest get rejected by the backend as if the
// session were dead. Sharing one in-flight promise per role means concurrent
// 401s for the same role await a single refresh instead of racing each other.
const refreshPromises = {};
const refreshAccessToken = (backendUrl, headerName, refreshPath) => {
  if (!refreshPromises[headerName]) {
    refreshPromises[headerName] = axios
      .post(`${backendUrl}${refreshPath}`, {}, { withCredentials: true })
      .finally(() => {
        refreshPromises[headerName] = null;
      });
  }
  return refreshPromises[headerName];
};

// A hard redirect reloads the page, which resets all module state — so this
// only ever needs to fire once per dead session, not be manually reset.
const handleSessionExpired = (storageKey, headerName) => {
  localStorage.removeItem(storageKey);
  setters[headerName]?.("");
  // Fixed toastId collapses concurrent 401s into a single toast instead of
  // stacking one per failed request (react-toastify no-ops duplicate ids).
  toast.error("Your session has expired. Please log in again.", {
    toastId: `session-expired-${headerName}`,
  });
  if (window.location.pathname !== "/") {
    window.location.href = "/";
  }
};

// Rewrites a 429 into a friendly, non-technical message (the backend
// already sends one — see backend/middlewares/rateLimiters.js — this adds
// a human "try again in N minutes" hint from the Retry-After header/body)
// so every existing `toast.error(error.message)` call site shows it
// automatically instead of axios's generic "Request failed with status
// code 429". In practice this should be rare here — admin is exempt from
// the general limiter, and doctor/hospital only hit the sensitive,
// dedicated limiters (login/OTP/etc), never day-to-day CRUD.
const describeRetryAfter = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return ` Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`;
  }
  return ` Try again in ${seconds} second${seconds !== 1 ? "s" : ""}.`;
};

const applyFriendlyRateLimitMessage = (error) => {
  const backendMessage = error.response?.data?.message;
  const retryAfterSeconds = Number(
    error.response?.headers?.["retry-after"] ?? error.response?.data?.retryAfter
  );
  const friendly =
    (backendMessage || "You're making requests very quickly. Please wait a few seconds and try again.") +
    describeRetryAfter(retryAfterSeconds);

  error.message = friendly;
  if (error.response?.data) error.response.data.message = friendly;
};

let installed = false;

export const installAuthInterceptor = (backendUrl) => {
  if (installed) return;
  installed = true;

  axios.defaults.withCredentials = true;

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      const headers = originalRequest?.headers;

      const headerName = Object.keys(ROLE_CONFIG).find((name) => readHeader(headers, name));

      if (status === 429) {
        applyFriendlyRateLimitMessage(error);
      }

      if (status === 401 && headerName && !originalRequest._retry) {
        originalRequest._retry = true;
        const { refreshPath, storageKey } = ROLE_CONFIG[headerName];

        // This request may have been sent with a token that a concurrent
        // refresh has already replaced (it 401'd after that refresh finished,
        // so the shared in-flight promise is gone). Rotating AGAIN would be a
        // needless second rotation; just retry once with the newer token.
        const usedToken = readHeader(headers, headerName);
        const currentToken = localStorage.getItem(storageKey);
        if (currentToken && currentToken !== usedToken) {
          writeHeader(originalRequest.headers, headerName, currentToken);
          return axios(originalRequest);
        }

        try {
          const { data } = await refreshAccessToken(backendUrl, headerName, refreshPath);
          if (data?.success && data.token) {
            localStorage.setItem(storageKey, data.token);
            setters[headerName]?.(data.token);
            writeHeader(originalRequest.headers, headerName, data.token);
            return axios(originalRequest);
          }
        } catch {
          // session is unrecoverable — fall through to sign-out below
        }
        handleSessionExpired(storageKey, headerName);
        // Redirecting away; never resolve so this request's own .catch()
        // doesn't also fire a duplicate "Request failed with status code
        // 401" toast on top of the one handleSessionExpired just showed.
        return new Promise(() => {});
      }

      return Promise.reject(error);
    }
  );
};
