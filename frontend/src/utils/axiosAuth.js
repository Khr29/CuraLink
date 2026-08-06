import axios from "axios";

// Access tokens are short-lived (15 min) by design — see backend/utils/tokens.js.
// This installs one global interceptor that transparently refreshes an
// expired token using the httpOnly refresh cookie and retries the failed
// request once, so the short TTL never surfaces as an unexpected logout.

let tokenSetter = null;
let installed = false;

export const registerUserTokenSetter = (setter) => {
  tokenSetter = setter;
};

// Rewrites a 429 into a friendly, non-technical message (the backend
// already sends one — see backend/middlewares/rateLimiters.js — this adds
// a human "try again in N minutes" hint from the Retry-After header/body)
// so every existing `toast.error(error.response?.data?.message ||
// error.message)` call site shows it automatically, instead of axios's
// generic "Request failed with status code 429".
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

export const installAuthInterceptor = (backendUrl) => {
  if (installed) return;
  installed = true;

  // Refresh tokens travel as httpOnly cookies — every request must carry them.
  axios.defaults.withCredentials = true;

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      const usedUserToken = originalRequest?.headers?.token;

      if (status === 429) {
        applyFriendlyRateLimitMessage(error);
      }

      if (status === 401 && usedUserToken && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/refresh-token`,
            {},
            { withCredentials: true }
          );
          if (data?.success && data.token) {
            localStorage.setItem("token", data.token);
            tokenSetter?.(data.token);
            originalRequest.headers.token = data.token;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // fall through — session is unrecoverable, sign out below
        }
        localStorage.removeItem("token");
        tokenSetter?.(false);
      }

      return Promise.reject(error);
    }
  );
};
