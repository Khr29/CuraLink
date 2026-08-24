import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    // ==========================
    // Basic Information
    // ==========================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Main image (Hospital Card)
    image: {
      type: String,
      required: true,
    },

    // Small Logo
    logo: {
      type: String,
      default: "",
    },

    // Cover Banner
    banner: {
      type: String,
      default: "",
    },

    // Gallery Images
    gallery: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
      required: true,
    },

    // ==========================
    // Contact Information
    // ==========================
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // Hospital portal login (hashed). Optional at the schema level so
    // hospitals created before the portal existed remain valid documents —
    // an admin sets this via Add/Edit Hospital to grant portal access.
    password: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      required: true,
    },

    website: {
      type: String,
      default: "",
    },

    // ==========================
    // Address
    // ==========================
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

    // ==========================
    // Google Maps
    // ==========================
    location: {
      latitude: Number,
      longitude: Number,
      mapsUrl: String,
    },

    // ==========================
    // Hospital Information
    // ==========================
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

    // ==========================
    // Departments
    // ==========================
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

    // ==========================
    // Facilities
    // ==========================
    facilities: [
      {
        type: String,
      },
    ],

    // ==========================
    // Connected Doctors
    // ==========================
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "doctor",
      },
    ],

    // ==========================
    // Review System
    // ==========================

    // Automatically updated whenever a review is added
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Number of reviews
    totalReviews: {
      type: Number,
      default: 0,
    },

    // ==========================
    // Status
    // ==========================
    active: {
      type: Boolean,
      default: true,
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
    // Verification (Hospital Registration -> Pending -> Admin Review ->
    // Approved -> Public Listing). Defaults to "approved" so every
    // admin-added hospital (today's only creation path) is public
    // immediately with no migration.
    // ==========================
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: String,
      default: "",
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

hospitalSchema.index({ name: 1 });

hospitalSchema.index({ averageRating: -1 });

hospitalSchema.index({ "address.city": 1 });

hospitalSchema.index({ hospitalType: 1 });

hospitalSchema.index({ specialties: 1 });

hospitalSchema.index({ departments: 1 });

const hospitalModel =
  mongoose.models.hospital ||
  mongoose.model("hospital", hospitalSchema);

export default hospitalModel;