import express from "express";
import {
  loginPharmacy,
  logoutPharmacy,
  getPharmacySelfProfile,
  updatePharmacySelfProfile,
  changePharmacySelfPassword,
  addPharmacy,
  getAllPharmacies,
  updatePharmacy,
  changePharmacyStatus,
} from "../controllers/pharmacyController.js";
import authPharmacy from "../middlewares/authPharmacy.js";
import authAdmin from "../middlewares/authAdmin.js";
import {
  makeRefreshTokenHandler,
  makeLogoutAllHandler,
  makeListSessionsHandler,
  makeRevokeSessionHandler,
  makeForgotPasswordHandler,
  makeResetPasswordHandler,
} from "../controllers/authSharedController.js";
import { loginLimiter, forgotPasswordLimiter, otpVerifyLimiter } from "../middlewares/rateLimiters.js";

const pharmacyRouter = express.Router();
const getPharmacyId = (req) => req.pharmacyId;

// =====================================
// Pharmacy Portal Authentication
// =====================================

pharmacyRouter.post("/login", loginLimiter, loginPharmacy);
pharmacyRouter.post("/logout", authPharmacy, logoutPharmacy);

// Session / Token Management
pharmacyRouter.post("/refresh-token", makeRefreshTokenHandler("pharmacy"));
pharmacyRouter.post("/logout-all", authPharmacy, makeLogoutAllHandler("pharmacy", getPharmacyId));
pharmacyRouter.get("/sessions", authPharmacy, makeListSessionsHandler("pharmacy", getPharmacyId));
pharmacyRouter.delete("/sessions/:sessionId", authPharmacy, makeRevokeSessionHandler("pharmacy", getPharmacyId));

// Password Security (change-password already exists below as /self/password)
pharmacyRouter.post("/forgot-password", forgotPasswordLimiter, makeForgotPasswordHandler("pharmacy"));
pharmacyRouter.post("/reset-password", otpVerifyLimiter, makeResetPasswordHandler("pharmacy"));

// =====================================
// Pharmacy Portal — Self Service
// (all scoped to the authenticated pharmacy via req.pharmacyId)
// =====================================

pharmacyRouter.get("/self/profile", authPharmacy, getPharmacySelfProfile);
pharmacyRouter.put("/self/profile", authPharmacy, updatePharmacySelfProfile);
pharmacyRouter.post("/self/password", authPharmacy, changePharmacySelfPassword);

// =====================================
// Admin-facing Pharmacy Management
// =====================================

pharmacyRouter.post("/add", authAdmin, addPharmacy);
pharmacyRouter.get("/list", authAdmin, getAllPharmacies);
pharmacyRouter.put("/update/:id", authAdmin, updatePharmacy);
pharmacyRouter.patch("/status/:id", authAdmin, changePharmacyStatus);

export default pharmacyRouter;
