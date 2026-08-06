import axios from "axios";

// Access tokens are short-lived (15 min) by design — see backend/utils/tokens.js.
// This app hosts three roles (admin/doctor/hospital) sharing one axios
// instance, so the interceptor inspects which token header a failed
// request used to know which refresh endpoint / localStorage key / React
// setter applies, refreshes silently via the httpOnly cookie, and retries
// the request once.
const ROLE_CONFIG = {
  atoken: { refreshPath: "/api/admin/refresh-token", storageKey: "aToken" },
  dtoken: { refreshPath: "/api/doctor/refresh-token", storageKey: "dToken" },
  htoken: { refreshPath: "/api/hospital/refresh-token", storageKey: "hToken" },
};

const setters = {};

export const registerTokenSetter = (headerName, setter) => {
  setters[headerName] = setter;
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
      const headers = originalRequest?.headers || {};

      const headerName = Object.keys(ROLE_CONFIG).find(
        (name) => headers[name] || headers[name.toUpperCase()]
      );

      if (status === 401 && headerName && !originalRequest._retry) {
        originalRequest._retry = true;
        const { refreshPath, storageKey } = ROLE_CONFIG[headerName];
        try {
          const { data } = await axios.post(
            `${backendUrl}${refreshPath}`,
            {},
            { withCredentials: true }
          );
          if (data?.success && data.token) {
            localStorage.setItem(storageKey, data.token);
            setters[headerName]?.(data.token);
            originalRequest.headers[headerName] = data.token;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // fall through — session is unrecoverable, sign out below
        }
        localStorage.removeItem(storageKey);
        setters[headerName]?.("");
      }

      return Promise.reject(error);
    }
  );
};
