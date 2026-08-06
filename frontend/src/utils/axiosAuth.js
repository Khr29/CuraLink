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
