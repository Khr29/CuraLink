import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // User who wrote the review
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Appointment linked to this review. Required for doctor reviews (enforced
    // in the controller); hospital reviews don't require a completed
    // appointment, so this is left null for those.
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      default: null,
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

    // Official reply from the doctor or hospital being reviewed (optional, one per review)
    reply: {
      type: {
        text: {
          type: String,
          trim: true,
          maxlength: 1000,
        },
        repliedAt: {
          type: Date,
        },
        repliedBy: {
          type: String,
          enum: ["doctor", "hospital"],
        },
      },
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
reviewSchema.index({ doctorId: 1 });
reviewSchema.index({ hospitalId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ appointmentId: 1 });
// Supports getRecentReviews' `{ isVisible: true }` sorted by createdAt
// (reviewController.js) — the homepage recent-reviews widget.
reviewSchema.index({ isVisible: 1, createdAt: -1 });

// A user may leave at most one review per doctor for a given appointment
// (doctor reviews remain tied to a specific completed appointment). Partial
// so the constraint only applies when doctorId is actually set.
reviewSchema.index(
  { appointmentId: 1, doctorId: 1 },
  {
    unique: true,
    partialFilterExpression: { doctorId: { $type: "objectId" } },
  },
);

// Hospital reviews aren't tied to an appointment, so instead a user may
// leave at most one review per hospital overall.
reviewSchema.index(
  { userId: 1, hospitalId: 1 },
  {
    unique: true,
    partialFilterExpression: { hospitalId: { $type: "objectId" } },
  },
);

const reviewModel =
  mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;
