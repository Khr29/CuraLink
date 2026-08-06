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
} from "../controllers/adminController.js";

import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";

import { changeAvailability } from "../controllers/doctorController.js";

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

// =====================================
// Admin Authentication
// =====================================

adminRouter.post("/login", loginAdmin);
adminRouter.post("/logout", authAdmin, logoutAdmin);

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

// =====================================
// User Management
// =====================================

// Get All Users
adminRouter.get("/all-users", authAdmin, allUsers);

// Change User Status
adminRouter.patch("/user-status/:id", authAdmin, changeUserStatus);

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
