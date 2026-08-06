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

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;