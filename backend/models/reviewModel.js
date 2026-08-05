import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      default: null,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital",
      default: null,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    verifiedPatient: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ doctorId: 1 });
reviewSchema.index({ hospitalId: 1 });
reviewSchema.index({ userId: 1 });

const reviewModel =
  mongoose.models.review ||
  mongoose.model("review", reviewSchema);

export default reviewModel;