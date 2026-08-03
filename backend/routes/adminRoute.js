import express from "express";
import {
  addDoctor,
  adminDashboard,
  allDoctors,
  appointmentCancel,
  appointmentsAdmin,
  loginAdmin,
} from "../controllers/adminController.js";

import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";

import { changeAvailability } from "../controllers/doctorController.js";

import {
  getAllHospitals,
  deleteHospital,
  changeHospitalStatus,
} from "../controllers/hospitalController.js";

const adminRouter = express.Router();

// =====================================
// Admin Authentication
// =====================================

adminRouter.post("/login", loginAdmin);

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

export default adminRouter;
