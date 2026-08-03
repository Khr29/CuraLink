import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    speciality: {
      type: String,
      required: true,
    },

    degree: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      required: true,
    },

    about: {
      type: String,
      required: true,
    },

    available: {
      type: Boolean,
      default: true,
    },

    fees: {
      type: Number,
      required: true,
    },

    address: {
      type: Object,
      required: true,
    },

    // ============================
    // Hospital Relationship
    // ============================
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
      required: true,
    },

    date: {
      type: Number,
      required: true,
    },

    slots_booked: {
      type: Object,
      default: {},
    },
  },
  {
    minimize: false,
  }
);

// Indexes
doctorSchema.index({ speciality: 1 });
doctorSchema.index({ available: 1 });
doctorSchema.index({ hospitalId: 1 });

const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;