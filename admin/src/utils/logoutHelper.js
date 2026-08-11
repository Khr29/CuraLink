import axios from "axios";

// Logout endpoint + token header per role — mirrors ROLE_CONFIG in
// axiosAuth.js. Calling this is what actually revokes the refresh-token
// session server-side and clears the httpOnly refresh cookie (via
// Set-Cookie on the response); merely clearing localStorage/React state,
// as the old logout handlers did, leaves the refresh cookie live and lets
// /refresh-token silently mint a fresh access token for the "logged out"
// account — a real session-hijack risk on any shared/clinic computer.
const LOGOUT_ENDPOINT = {
  atoken: "/api/admin/logout",
  dtoken: "/api/doctor/logout",
  htoken: "/api/hospital/logout",
  ptoken: "/api/pharmacy/logout",
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Best-effort — if the network call fails (offline, expired token) the
// caller still clears local state and navigates away; the refresh cookie
// will simply expire on its own schedule in that fallback case.
export const revokeServerSession = async (headerName, token) => {
  const path = LOGOUT_ENDPOINT[headerName];
  if (!path || !token) return;
  try {
    await axios.post(backendUrl + path, {}, { headers: { [headerName]: token }, withCredentials: true });
  } catch (error) {
    console.error("Logout revoke failed:", error);
  }
};
