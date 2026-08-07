import express from "express";
import {
  getSchedule,
  upsertSchedule,
  setDoctorEditPermission,
  getAvailableSlots,
} from "../controllers/scheduleController.js";
import authDoctor from "../middlewares/authDoctor.js";
import authHospital from "../middlewares/authHospital.js";
import authAdmin from "../middlewares/authAdmin.js";

const scheduleRouter = express.Router();

// Doctor / owning hospital / admin may read or write the raw schedule —
// which actor is calling is resolved from whichever auth header is
// present, same pattern as medicalRecordRoute's /appointment/:id route.
const anyStaffAuth = (req, res, next) => {
  const { dtoken, htoken, atoken } = req.headers;
  if (dtoken) return authDoctor(req, res, next);
  if (htoken) return authHospital(req, res, next);
  if (atoken) return authAdmin(req, res, next);
  return res.status(401).json({ success: false, message: "Not authorized Login again" });
};

scheduleRouter.get("/doctor/:doctorId", anyStaffAuth, getSchedule);
scheduleRouter.put("/doctor/:doctorId", anyStaffAuth, upsertSchedule);
scheduleRouter.patch("/doctor/:doctorId/permission", authHospital, setDoctorEditPermission);

// Computed slots only — public, same trust level as the doctor list/profile
// endpoints patients already browse without logging in.
scheduleRouter.get("/doctor/:doctorId/slots", getAvailableSlots);

export default scheduleRouter;
