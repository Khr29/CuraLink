import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // User who wrote the review
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Appointment linked to this review
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      required: true,
    },

    // Doctor review (optional)
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      default: null,
    },

    // Hospital review (optional)
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
      default: null,
    },

    // Rating (1-5)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Review title
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Review comment
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Verified Patient Badge
    verifiedPatient: {
      type: Boolean,
      default: true,
    },

    // Admin can hide inappropriate reviews
    isVisible: {
      type: Boolean,
      default: true,
    },

    // Admin reply (optional)
    adminReply: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ doctorId: 1 });
reviewSchema.index({ hospitalId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ appointmentId: 1 });

const reviewModel =
  mongoose.models.review ||
  mongoose.model("review", reviewSchema);

export default reviewModel;