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
  getPrescriptionQr,
  verifyPrescription,
  revokePrescription,
  pharmacyVerifyPrescription,
  pharmacyDispense,
  getPharmacyStats,
  getPharmacyHistory,
} from "../controllers/medicalRecordController.js";
import authDoctor from "../middlewares/authDoctor.js";
import authUser from "../middlewares/authUser.js";
import authHospital from "../middlewares/authHospital.js";
import authAdmin from "../middlewares/authAdmin.js";
import upload from "../middlewares/multer.js";
import { prescriptionVerifyLimiter } from "../middlewares/rateLimiters.js";

const medicalRecordRouter = express.Router();

// Doctor or admin only — used by revokePrescription.
const authDoctorOrAdmin = (req, res, next) => {
  const { dtoken, atoken } = req.headers;
  if (dtoken) return authDoctor(req, res, next);
  if (atoken) return authAdmin(req, res, next);
  return res.status(401).json({ success: false, message: "Not authorized Login again" });
};

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
const authAnyRole = (req, res, next) => {
  const { token, dtoken, htoken, atoken } = req.headers;
  if (token) return authUser(req, res, next);
  if (dtoken) return authDoctor(req, res, next);
  if (htoken) return authHospital(req, res, next);
  if (atoken) return authAdmin(req, res, next);
  return res.status(401).json({ success: false, message: "Not authorized Login again" });
};

medicalRecordRouter.get("/appointment/:appointmentId", authAnyRole, getRecordByAppointment);

// Secure QR — same multi-role access as the record itself.
medicalRecordRouter.get("/appointment/:appointmentId/qr", authAnyRole, getPrescriptionQr);

// Doctor (owning) or admin — one-way revoke.
medicalRecordRouter.post("/revoke", authDoctorOrAdmin, revokePrescription);

// =====================================
// Public prescription verification (no auth) — minimal info only.
// =====================================
medicalRecordRouter.get("/verify/:token", prescriptionVerifyLimiter, verifyPrescription);

// =====================================
// Pharmacy — part of the Hospital Portal (authHospital), not a separate
// account type. Authorized access to a specific prescription by its
// verification token (from a scanned QR or the verify link), dispensing,
// and the Pharmacy section's own dashboard stats/history.
// =====================================
medicalRecordRouter.get("/pharmacy/verify/:token", authHospital, pharmacyVerifyPrescription);
medicalRecordRouter.post("/pharmacy/dispense/:token", authHospital, pharmacyDispense);
medicalRecordRouter.get("/pharmacy/stats", authHospital, getPharmacyStats);
medicalRecordRouter.get("/pharmacy/history", authHospital, getPharmacyHistory);

export default medicalRecordRouter;
