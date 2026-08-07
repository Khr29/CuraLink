import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true }, // "HH:mm", 24h
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const breakSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    label: { type: String, default: "Break" },
  },
  { _id: false }
);

const dayPatternSchema = new mongoose.Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0 = Sunday
    isWorking: { type: Boolean, default: true },
    shifts: { type: [shiftSchema], default: [] },
    breaks: { type: [breakSchema], default: [] },
  },
  { _id: false }
);

// One document per (doctorId, hospitalId) pair — a separate collection
// rather than a sub-document on doctorModel so a doctor working at more
// than one hospital in the future is "add another document," not a schema
// migration. hospitalId is null for independent doctors, matching the same
// nullable convention already used on doctorModel.hospitalId.
const doctorScheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
      default: null,
    },

    weeklyPattern: { type: [dayPatternSchema], default: [] },

    slotDurationMinutes: { type: Number, enum: [15, 20, 30, 60], default: 30 },

    // Full-day overrides — holidays, approved leave, etc. "YYYY-MM-DD".
    unavailableDates: { type: [String], default: [] },

    // Hospitals manage a doctor's schedule by default; this is the only way
    // a doctor gets write access to their own hospital-scoped schedule.
    // Independent doctors always have implicit edit rights (enforced in the
    // controller, not here, since it depends on doctorModel.employmentType).
    doctorCanEdit: { type: Boolean, default: false },
  },
  { timestamps: true }
);

doctorScheduleSchema.index({ doctorId: 1, hospitalId: 1 }, { unique: true });

const doctorScheduleModel =
  mongoose.models.doctorSchedule ||
  mongoose.model("doctorSchedule", doctorScheduleSchema);

export default doctorScheduleModel;
