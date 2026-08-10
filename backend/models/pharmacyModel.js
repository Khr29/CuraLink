import mongoose from "mongoose";

// A first-class role, not a Hospital Portal section — mirrors hospitalModel's
// auth-relevant fields (login/session/security) but drops everything that
// only makes sense for a publicly-listed hospital (image/gallery/ratings/
// departments/doctors). Admin-provisioned only (see adminController's
// addPharmacy) — no public self-registration, since a fake pharmacy account
// could dispense controlled medication.
const pharmacySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: { type: String, required: true },

    licenseNumber: { type: String, default: "", trim: true },

    phone: { type: String, default: "" },

    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: { type: String, default: "India" },
      pincode: String,
    },

    // ==========================
    // Status
    // ==========================
    active: { type: Boolean, default: true },

    // ==========================
    // Account Security — same pattern as hospitalModel/doctorModel
    // ==========================
    emailVerified: { type: Boolean, default: true },
    passwordChangedAt: { type: Date, default: null },
    previousPasswords: { type: [String], default: [] },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const pharmacyModel =
  mongoose.models.pharmacy || mongoose.model("pharmacy", pharmacySchema);

export default pharmacyModel;
