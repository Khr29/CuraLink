import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    // ==========================
    // Basic Information
    // ==========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    // ==========================
    // Professional Information
    // ==========================
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

    fees: {
      type: Number,
      required: true,
    },

    // ==========================
    // Availability
    // ==========================
    available: {
      type: Boolean,
      default: true,
    },

    // ==========================
    // Address
    // ==========================
    address: {
      type: Object,
      required: true,
    },

    // ==========================
    // Hospital Relationship
    // ==========================
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
      required: true,
    },

    // ==========================
    // Registration Date
    // ==========================
    date: {
      type: Number,
      required: true,
    },

    // ==========================
    // Appointment Slots
    // ==========================
    slots_booked: {
      type: Object,
      default: {},
    },

    // ==========================
    // Review System
    // ==========================
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// ==========================
// Indexes
// ==========================

doctorSchema.index({ speciality: 1 });

doctorSchema.index({ available: 1 });

doctorSchema.index({ hospitalId: 1 });

doctorSchema.index({ averageRating: -1 });

const doctorModel =
  mongoose.models.doctor ||
  mongoose.model("doctor", doctorSchema);

export default doctorModel;