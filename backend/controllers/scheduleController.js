import doctorModel from "../models/doctorModel.js";
import doctorScheduleModel from "../models/doctorScheduleModel.js";
import { computeAvailableSlots } from "../utils/slotGenerator.js";
import { nowIST, istCalendarDate } from "../utils/istTime.js";

const SLOT_DURATIONS = [15, 20, 30, 60];
const DEFAULT_SLOT_DAYS = 7;
const MAX_SLOT_DAYS = 30;

// date is IST-anchored (istCalendarDate) — must read it via the UTC
// accessors, matching slotGenerator.js's convention.
const slotDateKey = (date) => `${date.getUTCDate()}_${date.getUTCMonth() + 1}_${date.getUTCFullYear()}`;

// A schedule always scopes to wherever the doctor is CURRENTLY affiliated —
// hospitalId comes from the doctor record, never from the caller.
const findScheduleForDoctor = (doctor) =>
  doctorScheduleModel.findOne({ doctorId: doctor._id, hospitalId: doctor.hospitalId || null });

const canViewSchedule = (req, doctor) => {
  if (req.hospitalId) return Boolean(doctor.hospitalId && doctor.hospitalId.toString() === req.hospitalId);
  if (req.docId) return doctor._id.toString() === req.docId;
  if (req.adminEmail) return true;
  return false;
};

// Hospitals manage a doctor's schedule by default. A doctor may only write
// their own schedule if they're independent (no hospital to do it for them)
// or the hospital has explicitly granted doctorCanEdit.
const canManageSchedule = (req, doctor, existingSchedule) => {
  if (req.hospitalId) return Boolean(doctor.hospitalId && doctor.hospitalId.toString() === req.hospitalId);
  if (req.docId) {
    if (doctor._id.toString() !== req.docId) return false;
    if (doctor.employmentType === "independent" || !doctor.hospitalId) return true;
    return Boolean(existingSchedule?.doctorCanEdit);
  }
  return false;
};

const TIME_RE = /^\d{2}:\d{2}$/;
const validateWeeklyPattern = (weeklyPattern) => {
  if (!Array.isArray(weeklyPattern)) return "weeklyPattern must be an array";
  for (const day of weeklyPattern) {
    if (typeof day.dayOfWeek !== "number" || day.dayOfWeek < 0 || day.dayOfWeek > 6) {
      return "Each day must have a dayOfWeek between 0 and 6";
    }
    for (const shift of day.shifts || []) {
      if (!TIME_RE.test(shift.startTime) || !TIME_RE.test(shift.endTime)) {
        return "Shift times must be in HH:mm format";
      }
      if (shift.startTime >= shift.endTime) return "Each shift's start time must be before its end time";
    }
    for (const brk of day.breaks || []) {
      if (!TIME_RE.test(brk.startTime) || !TIME_RE.test(brk.endTime)) {
        return "Break times must be in HH:mm format";
      }
      if (brk.startTime >= brk.endTime) return "Each break's start time must be before its end time";
    }
  }
  return null;
};

// Doctor / owning hospital / admin — read the raw schedule structure.
const getSchedule = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.params.doctorId).select("hospitalId employmentType");
    if (!doctor) return res.json({ success: false, message: "Doctor not found" });
    if (!canViewSchedule(req, doctor)) {
      return res.json({ success: false, message: "Not authorized" });
    }
    const schedule = await findScheduleForDoctor(doctor);
    res.json({ success: true, schedule });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Owning hospital, or a permitted doctor — create/update the schedule.
const upsertSchedule = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.params.doctorId).select("hospitalId employmentType");
    if (!doctor) return res.json({ success: false, message: "Doctor not found" });

    const existing = await findScheduleForDoctor(doctor);
    if (!canManageSchedule(req, doctor, existing)) {
      return res.json({ success: false, message: "Not authorized to edit this schedule" });
    }

    const { weeklyPattern, slotDurationMinutes, unavailableDates } = req.body;

    if (weeklyPattern !== undefined) {
      const error = validateWeeklyPattern(weeklyPattern);
      if (error) return res.json({ success: false, message: error });
    }
    if (slotDurationMinutes !== undefined && !SLOT_DURATIONS.includes(Number(slotDurationMinutes))) {
      return res.json({ success: false, message: "slotDurationMinutes must be 15, 20, 30, or 60" });
    }
    if (unavailableDates !== undefined && !Array.isArray(unavailableDates)) {
      return res.json({ success: false, message: "unavailableDates must be an array" });
    }

    const update = {};
    if (weeklyPattern !== undefined) update.weeklyPattern = weeklyPattern;
    if (slotDurationMinutes !== undefined) update.slotDurationMinutes = Number(slotDurationMinutes);
    if (unavailableDates !== undefined) update.unavailableDates = unavailableDates;

    const schedule = await doctorScheduleModel.findOneAndUpdate(
      { doctorId: doctor._id, hospitalId: doctor.hospitalId || null },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: "Schedule updated", schedule });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Hospital-only — grants/revokes a doctor's ability to edit their own
// hospital-scoped schedule.
const setDoctorEditPermission = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.params.doctorId).select("hospitalId");
    if (!doctor || !doctor.hospitalId || doctor.hospitalId.toString() !== req.hospitalId) {
      return res.json({ success: false, message: "Doctor not found" });
    }
    const schedule = await doctorScheduleModel.findOneAndUpdate(
      { doctorId: doctor._id, hospitalId: doctor.hospitalId },
      { $set: { doctorCanEdit: Boolean(req.body.doctorCanEdit) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, message: "Permission updated", schedule });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Public — computed available slots only (never the raw shift/break
// structure), for patients browsing/booking.
const getAvailableSlots = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.params.doctorId).select("hospitalId slots_booked");
    if (!doctor) return res.json({ success: false, message: "Doctor not found" });

    const days = Math.min(Number(req.query.days) || DEFAULT_SLOT_DAYS, MAX_SLOT_DAYS);
    const schedule = await findScheduleForDoctor(doctor);

    const now = nowIST();
    const slots = {};
    for (let i = 0; i < days; i++) {
      const date = istCalendarDate(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i);
      const key = slotDateKey(date);
      const booked = doctor.slots_booked?.[key] || [];
      slots[key] = computeAvailableSlots(schedule, date, booked, now);
    }

    res.json({ success: true, slots });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getSchedule, upsertSchedule, setDoctorEditPermission, getAvailableSlots };
