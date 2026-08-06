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
    // Nullable — a doctor with employmentType "independent" has no
    // hospitalId. Every existing doctor already has one, so the default
    // below keeps them correctly marked "hospital" with no migration.
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
      required: false,
      default: null,
    },

    employmentType: {
      type: String,
      enum: ["independent", "hospital"],
      default: "hospital",
    },

    // ==========================
    // Registration Date
    // ==========================
    date: {
      type: Number,
      required: true,
    },

    // ==========================
    // Account Security
    // ==========================
    emailVerified: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    previousPasswords: {
      type: [String],
      default: [],
    },

    // ==========================
    // Verification (Doctor Registration -> Pending -> Hospital/Admin
    // Verification -> Verified). Defaults to "verified" so every doctor
    // added by Admin (an already-trusted path) works immediately with no
    // migration; hospitalAddDoctor explicitly sets "pending" since that is
    // this app's actual doctor-registration entry point.
    // ==========================
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "verified",
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: String,
      default: "",
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