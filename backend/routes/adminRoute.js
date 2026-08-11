import express from "express";
import {
  addDoctor,
  adminDashboard,
  allDoctors,
  allUsers,
  appointmentCancel,
  appointmentsAdmin,
  changeUserStatus,
  deleteDoctor,
  loginAdmin,
  logoutAdmin,
  deleteUser,
  setDoctorVerification,
  setHospitalVerification,
  getAllPrescriptions,
} from "../controllers/adminController.js";

import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";

import { changeAvailability } from "../controllers/doctorController.js";

import {
  makeRefreshTokenHandler,
  makeLogoutAllHandler,
  makeListSessionsHandler,
  makeRevokeSessionHandler,
} from "../controllers/authSharedController.js";
import { loginLimiter } from "../middlewares/rateLimiters.js";

import {
  getAllHospitals,
  deleteHospital,
  changeHospitalStatus,
} from "../controllers/hospitalController.js";

import {
  getAuditLogs,
  exportAuditLogs,
} from "../controllers/auditLogController.js";

import {
  assignDoctorToHospital,
  removeDoctorFromHospital,
  transferDoctor,
  adminApproveRequest,
  adminRejectRequest,
  getAllDoctorRequests,
} from "../controllers/hospitalRequestController.js";

const adminRouter = express.Router();
const getAdminId = () => null; // admin has no DB row — a single shared account

// =====================================
// Admin Authentication
// =====================================

adminRouter.post("/login", loginLimiter, loginAdmin);
adminRouter.post("/logout", authAdmin, logoutAdmin);

// Session / Token Management
adminRouter.post("/refresh-token", makeRefreshTokenHandler("admin"));
adminRouter.post("/logout-all", authAdmin, makeLogoutAllHandler("admin", getAdminId));
adminRouter.get("/sessions", authAdmin, makeListSessionsHandler("admin", getAdminId));
adminRouter.delete("/sessions/:sessionId", authAdmin, makeRevokeSessionHandler("admin", getAdminId));

// =====================================
// Dashboard
// =====================================

adminRouter.get("/dashboard", authAdmin, adminDashboard);

// =====================================
// Doctor Management
// =====================================

// Add Doctor
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);

// Get All Doctors
adminRouter.post("/all-doctors", authAdmin, allDoctors);

// Change Availability
adminRouter.post("/change-availability", authAdmin, changeAvailability);

// Delete Doctor
adminRouter.delete("/delete-doctor/:id", authAdmin, deleteDoctor);

// Doctor Verification (Registration -> Pending -> Admin Review -> Verified)
adminRouter.patch("/doctor-verification/:id", authAdmin, setDoctorVerification);

// =====================================
// Appointment Management
// =====================================

// Get Appointments
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);

// Cancel Appointment
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);

// =====================================
// Hospital Management
// =====================================

// Get All Hospitals
adminRouter.get("/all-hospitals", authAdmin, getAllHospitals);

// Delete Hospital
adminRouter.delete("/delete-hospital/:id", authAdmin, deleteHospital);

// Change Hospital Status
adminRouter.patch("/hospital-status/:id", authAdmin, changeHospitalStatus);

// Hospital Verification (Registration -> Pending -> Admin Review -> Approved -> Public Listing)
adminRouter.patch("/hospital-verification/:id", authAdmin, setHospitalVerification);

// =====================================
// User Management
// =====================================

// Get All Users
adminRouter.get("/all-users", authAdmin, allUsers);

// Change User Status
adminRouter.patch("/user-status/:id", authAdmin, changeUserStatus);

// Delete User
adminRouter.delete("/delete-user/:id", authAdmin, deleteUser);

// =====================================
// Prescription Monitoring
// =====================================

adminRouter.get("/prescriptions", authAdmin, getAllPrescriptions);

// =====================================
// Audit Logs
// =====================================

adminRouter.get("/audit-logs", authAdmin, getAuditLogs);
adminRouter.get("/audit-logs/export", authAdmin, exportAuditLogs);

// =====================================
// Doctor <-> Hospital Association Control
// =====================================

adminRouter.post("/assign-doctor", authAdmin, assignDoctorToHospital);
adminRouter.post("/remove-doctor-from-hospital", authAdmin, removeDoctorFromHospital);
adminRouter.post("/transfer-doctor", authAdmin, transferDoctor);
adminRouter.patch("/doctor-requests/:id/approve", authAdmin, adminApproveRequest);
adminRouter.patch("/doctor-requests/:id/reject", authAdmin, adminRejectRequest);
adminRouter.get("/doctor-requests", authAdmin, getAllDoctorRequests);

export default adminRouter;
