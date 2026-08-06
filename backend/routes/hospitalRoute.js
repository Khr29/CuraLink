import express from "express";
import {
  addHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  changeHospitalStatus,
  loginHospital,
  logoutHospital,
  getHospitalSelfProfile,
  updateHospitalSelfProfile,
  changeHospitalSelfPassword,
  uploadHospitalMedia,
  deleteHospitalGalleryImage,
  getHospitalSelfDashboard,
  getHospitalSelfDoctors,
  hospitalAddDoctor,
  hospitalUpdateDoctor,
  hospitalDeleteDoctor,
  getHospitalSelfAppointments,
  getHospitalSelfPatients,
  getHospitalSelfPatientDetail,
} from "../controllers/hospitalController.js";
import {
  getHospitalDoctorRequests,
  approveHospitalDoctorRequest,
  rejectHospitalDoctorRequest,
  inviteDoctor,
} from "../controllers/hospitalRequestController.js";
import upload from "../middlewares/multer.js";
import authHospital from "../middlewares/authHospital.js";
import authAdmin from "../middlewares/authAdmin.js";
import {
  makeRefreshTokenHandler,
  makeLogoutAllHandler,
  makeListSessionsHandler,
  makeRevokeSessionHandler,
  makeForgotPasswordHandler,
  makeResetPasswordHandler,
  makeSendVerificationOtpHandler,
  makeVerifyEmailHandler,
} from "../controllers/authSharedController.js";
import { loginLimiter, forgotPasswordLimiter, otpVerifyLimiter } from "../middlewares/rateLimiters.js";

const hospitalRouter = express.Router();
const getHospitalId = (req) => req.hospitalId;

// =====================================
// Hospital Portal Authentication
// =====================================

hospitalRouter.post("/login", loginLimiter, loginHospital);
hospitalRouter.post("/logout", authHospital, logoutHospital);

// Session / Token Management
hospitalRouter.post("/refresh-token", makeRefreshTokenHandler("hospital"));
hospitalRouter.post("/logout-all", authHospital, makeLogoutAllHandler("hospital", getHospitalId));
hospitalRouter.get("/sessions", authHospital, makeListSessionsHandler("hospital", getHospitalId));
hospitalRouter.delete("/sessions/:sessionId", authHospital, makeRevokeSessionHandler("hospital", getHospitalId));

// Password Security (change-password already exists below as /self/password)
hospitalRouter.post("/forgot-password", forgotPasswordLimiter, makeForgotPasswordHandler("hospital"));
hospitalRouter.post("/reset-password", otpVerifyLimiter, makeResetPasswordHandler("hospital"));

// Email Verification
hospitalRouter.post("/send-verification-otp", authHospital, forgotPasswordLimiter, makeSendVerificationOtpHandler("hospital", getHospitalId));
hospitalRouter.post("/verify-email", authHospital, otpVerifyLimiter, makeVerifyEmailHandler("hospital", getHospitalId));

// =====================================
// Hospital Portal — Self Service
// (all scoped to the authenticated hospital via req.hospitalId)
// =====================================

hospitalRouter.get("/self/profile", authHospital, getHospitalSelfProfile);
hospitalRouter.put("/self/profile", authHospital, updateHospitalSelfProfile);
hospitalRouter.post("/self/password", authHospital, changeHospitalSelfPassword);

hospitalRouter.post(
  "/self/media",
  authHospital,
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  uploadHospitalMedia,
);
hospitalRouter.post("/self/gallery/delete", authHospital, deleteHospitalGalleryImage);

hospitalRouter.get("/self/dashboard", authHospital, getHospitalSelfDashboard);

hospitalRouter.get("/self/doctors", authHospital, getHospitalSelfDoctors);
hospitalRouter.post(
  "/self/doctors/add",
  authHospital,
  upload.single("image"),
  hospitalAddDoctor,
);
hospitalRouter.put(
  "/self/doctors/:doctorId",
  authHospital,
  upload.single("image"),
  hospitalUpdateDoctor,
);
hospitalRouter.delete("/self/doctors/:doctorId", authHospital, hospitalDeleteDoctor);

hospitalRouter.get("/self/appointments", authHospital, getHospitalSelfAppointments);

hospitalRouter.get("/self/patients", authHospital, getHospitalSelfPatients);
hospitalRouter.get("/self/patients/:patientId", authHospital, getHospitalSelfPatientDetail);

hospitalRouter.get("/self/doctor-requests", authHospital, getHospitalDoctorRequests);
hospitalRouter.patch("/self/doctor-requests/:id/approve", authHospital, approveHospitalDoctorRequest);
hospitalRouter.patch("/self/doctor-requests/:id/reject", authHospital, rejectHospitalDoctorRequest);
hospitalRouter.post("/self/invite-doctor", authHospital, inviteDoctor);

// =====================================
// Admin-facing Hospital Management
// =====================================

// Add Hospital
hospitalRouter.post(
  "/add",
  authAdmin,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  addHospital,
);

// Get All Hospitals
hospitalRouter.get("/list", getAllHospitals);

// Get Single Hospital
hospitalRouter.get("/:id", getHospitalById);

// Update Hospital
hospitalRouter.put("/update/:id", authAdmin, updateHospital);

// Delete Hospital
hospitalRouter.delete("/delete/:id", authAdmin, deleteHospital);

// Active / Inactive
hospitalRouter.patch("/status/:id", authAdmin, changeHospitalStatus);

export default hospitalRouter;
