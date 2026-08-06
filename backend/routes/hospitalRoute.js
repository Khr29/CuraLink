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

const hospitalRouter = express.Router();

// =====================================
// Hospital Portal Authentication
// =====================================

hospitalRouter.post("/login", loginHospital);
hospitalRouter.post("/logout", authHospital, logoutHospital);

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
