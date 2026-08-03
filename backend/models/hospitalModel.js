import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Main image (used in hospital cards)
    image: {
      type: String,
      required: true,
    },

    // Small logo
    logo: {
      type: String,
      default: "",
    },

    // Cover banner
    banner: {
      type: String,
      default: "",
    },

    // Gallery images
    gallery: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
      required: true,
    },

    // Contact
    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    website: {
      type: String,
      default: "",
    },

    // Address
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: "India",
      },
      pincode: String,
    },

    // Google Maps Location
    location: {
      latitude: Number,
      longitude: Number,
      mapsUrl: String,
    },

    // Hospital Information
    hospitalType: {
      type: String,
      enum: [
        "Private",
        "Government",
        "Clinic",
        "Multi-Speciality",
        "Diagnostic Centre",
      ],
      required: true,
    },

    openingHours: {
      type: String,
      default: "24 Hours",
    },

    emergency: {
      type: Boolean,
      default: true,
    },

    beds: {
      type: Number,
      default: 0,
    },

    insuranceAccepted: {
      type: Boolean,
      default: true,
    },

    // Departments
    departments: [
      {
        type: String,
      },
    ],

    // CuraLink Specialty Rating
    specialties: [
      {
        type: String,
      },
    ],

    // Facilities
    facilities: [
      {
        type: String,
      },
    ],

    // Doctors
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
      },
    ],

    // Ratings
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    // Active / Inactive
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

// Indexes
hospitalSchema.index({ name: 1 });
hospitalSchema.index({ rating: -1 });
hospitalSchema.index({ "address.city": 1 });
hospitalSchema.index({ hospitalType: 1 });
hospitalSchema.index({ specialties: 1 });

const hospitalModel =
  mongoose.models.hospital || mongoose.model("hospital", hospitalSchema);

export default hospitalModel;
