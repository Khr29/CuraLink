import express from "express";
import {
  saveDraftRecord,
  finalizeRecord,
  amendRecord,
  addAttachment,
  getRecordByAppointment,
  getMyRecords,
  getDoctorRecords,
  getHospitalRecords,
  getPrescriptionOptions,
} from "../controllers/medicalRecordController.js";
import authDoctor from "../middlewares/authDoctor.js";
import authUser from "../middlewares/authUser.js";
import authHospital from "../middlewares/authHospital.js";
import authAdmin from "../middlewares/authAdmin.js";
import upload from "../middlewares/multer.js";

const medicalRecordRouter = express.Router();

// Public — canonical dropdown vocabulary for structured prescriptions.
medicalRecordRouter.get("/prescription-options", getPrescriptionOptions);

// =====================================
// Doctor — write access, scoped to appointments they handled
// =====================================
medicalRecordRouter.post("/draft", authDoctor, saveDraftRecord);
medicalRecordRouter.post("/finalize", authDoctor, finalizeRecord);
medicalRecordRouter.post("/amend", authDoctor, amendRecord);
medicalRecordRouter.post("/attachment", authDoctor, upload.single("file"), addAttachment);
medicalRecordRouter.get("/doctor/mine", authDoctor, getDoctorRecords);

// =====================================
// Patient — own records only
// =====================================
medicalRecordRouter.get("/mine", authUser, getMyRecords);

// =====================================
// Hospital — records created by their own doctors only
// =====================================
medicalRecordRouter.get("/hospital/mine", authHospital, getHospitalRecords);

// =====================================
// Shared read — access enforced per-actor inside the controller
// (patient owner / creating doctor / owning hospital / admin)
// =====================================
medicalRecordRouter.get(
  "/appointment/:appointmentId",
  (req, res, next) => {
    const { token, dtoken, htoken, atoken } = req.headers;
    if (token) return authUser(req, res, next);
    if (dtoken) return authDoctor(req, res, next);
    if (htoken) return authHospital(req, res, next);
    if (atoken) return authAdmin(req, res, next);
    return res.status(401).json({ success: false, message: "Not authorized Login again" });
  },
  getRecordByAppointment
);

export default medicalRecordRouter;
