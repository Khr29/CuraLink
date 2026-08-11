import React from "react";
import { Navigate } from "react-router-dom";

// Mirrors admin/src/components/ProtectedRoute.jsx — same pattern, same
// existing `token` state from AppContext, just a different redirect target
// (this app's login page lives at /login, not /). No new auth mechanism.
const ProtectedRoute = ({ token, children }) => {
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
