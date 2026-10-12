import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // Patient
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Doctor
    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },

    // Hospital — nullable: an independent doctor (doctorModel.employmentType
    // === "independent") has no hospitalId, so an appointment with one
    // can't require it either.
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
      required: false,
      default: null,
    },

    // Appointment Details
    slotDate: {
      type: String,
      required: true,
    },

    slotTime: {
      type: String,
      required: true,
    },

    // Snapshot Data
    userData: {
      type: Object,
      required: true,
    },

    docData: {
      type: Object,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    date: {
      type: Number,
      required: true,
    },

    cancelled: {
      type: Boolean,
      default: false,
    },

    payment: {
      type: Boolean,
      default: false,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ userId: 1 });
appointmentSchema.index({ docId: 1 });
appointmentSchema.index({ hospitalId: 1 });
// Supports adminController.js#adminDashboard's `.sort({ date: -1 }).limit(5)`.
appointmentSchema.index({ date: -1 });
// Support the "does this doctor/patient have any active appointment" existence
// checks in adminController.js (deleteDoctor/deleteUser).
appointmentSchema.index({ docId: 1, cancelled: 1, isCompleted: 1 });
appointmentSchema.index({ userId: 1, cancelled: 1, isCompleted: 1 });

// userData/docData are point-in-time snapshots of the patient/doctor document.
// Snapshots taken before previousPasswords became select:false (and any with a
// stray password field) may still carry credential hashes in storage — strip
// them from every read result (hydrated or .lean()) so no appointment endpoint
// can return them. In-memory only: nothing is written back to the database.
const SNAPSHOT_SECRET_FIELDS = ["password", "previousPasswords"];
const scrubSnapshots = (result) => {
  const docs = Array.isArray(result) ? result : result ? [result] : [];
  for (const doc of docs) {
    for (const key of ["userData", "docData"]) {
      const snapshot = typeof doc.get === "function" ? doc.get(key) : doc[key];
      if (snapshot && typeof snapshot === "object") {
        for (const field of SNAPSHOT_SECRET_FIELDS) delete snapshot[field];
      }
    }
  }
};
appointmentSchema.post("find", scrubSnapshots);
appointmentSchema.post("findOne", scrubSnapshots);

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;