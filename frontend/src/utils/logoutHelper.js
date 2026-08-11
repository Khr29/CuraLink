import axios from "axios";

// Revokes the server-side session (backend/controllers/userController.js
// logoutUser -> authSharedController's revokeSession) so the httpOnly
// refresh-token cookie actually gets cleared. Merely clearing localStorage/
// React state, as the old logout handlers did, leaves that cookie live and
// lets /api/user/refresh-token silently mint a fresh access token for the
// "logged out" account — a real session-hijack risk on a shared computer.
// Best-effort: if the network call fails, the caller still clears local
// state and navigates away; the refresh cookie then just expires on its
// own schedule instead of being revoked immediately.
export const revokeServerSession = async (token) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!token) return;
  try {
    await axios.post(backendUrl + "/api/user/logout", {}, { headers: { token }, withCredentials: true });
  } catch (error) {
    console.error("Logout revoke failed:", error);
  }
};
