import mongoose from "mongoose";
import reviewModel from "../models/reviewModel.js";
import doctorModel from "../models/doctorModel.js";
import hospitalModel from "../models/hospitalModel.js";
import appointmentModel from "../models/appointmentModel.js";

// Recalculates and persists averageRating/totalReviews for a doctor and/or
// hospital from their currently-visible reviews. Called after any review
// is created, hidden/shown, or deleted.
const updateAverageRating = async (doctorId, hospitalId) => {
  if (doctorId) {
    const reviews = await reviewModel.find({
      doctorId,
      isVisible: true,
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews;

    await doctorModel.findByIdAndUpdate(doctorId, {
      averageRating,
      totalReviews,
    });
  }

  if (hospitalId) {
    const reviews = await reviewModel.find({
      hospitalId,
      isVisible: true,
    });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews;

    await hospitalModel.findByIdAndUpdate(hospitalId, {
      averageRating,
      totalReviews,
    });
  }
};

// Small helper: bounded page/limit parsing shared by the list endpoints below.
const parsePagination = (query, defaultLimit = 10, maxLimit = 50) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(query.limit, 10) || defaultLimit),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Star-count breakdown (5..1) for a doctor or hospital's currently-visible
// reviews, used to render the "Rating Distribution" bars.
const getRatingDistribution = async (doctorId, hospitalId) => {
  const filter = doctorId
    ? { doctorId: new mongoose.Types.ObjectId(doctorId), isVisible: true }
    : { hospitalId: new mongoose.Types.ObjectId(hospitalId), isVisible: true };

  const rows = await reviewModel.aggregate([
    { $match: filter },
    { $group: { _id: "$rating", count: { $sum: 1 } } },
  ]);
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  rows.forEach((row) => {
    distribution[row._id] = row.count;
  });
  return distribution;
};

// =============================
// Add Review (patient, authUser)
// =============================
const addReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId, doctorId, hospitalId, rating, title, comment } =
      req.body;

    if (!rating || !title || !comment) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!doctorId && !hospitalId) {
      return res.json({
        success: false,
        message: "A doctor or hospital must be specified",
      });
    }

    if (doctorId && hospitalId) {
      return res.json({
        success: false,
        message: "A review can target only one doctor or hospital at a time",
      });
    }

    const numericRating = Number(rating);
    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (doctorId) {
      // Doctor reviews still require a completed appointment with that doctor.
      if (!appointmentId) {
        return res.json({ success: false, message: "Missing Details" });
      }

      const appointment = await appointmentModel.findById(appointmentId);

      if (!appointment || appointment.userId.toString() !== userId) {
        return res.json({ success: false, message: "Appointment not found" });
      }

      if (!appointment.isCompleted) {
        return res.json({
          success: false,
          message: "You can only review a completed appointment",
        });
      }

      if (appointment.docId.toString() !== doctorId) {
        return res.json({
          success: false,
          message: "Doctor does not match this appointment",
        });
      }

      const existing = await reviewModel.findOne({ appointmentId, doctorId });

      if (existing) {
        return res.json({
          success: false,
          message: "You have already reviewed this appointment",
        });
      }
    }

    if (hospitalId) {
      // Any authenticated user may review a hospital — no completed
      // appointment required. One review per user per hospital.
      const existing = await reviewModel.findOne({ userId, hospitalId });

      if (existing) {
        return res.json({
          success: false,
          message: "You have already reviewed this hospital",
        });
      }
    }

    const review = await reviewModel.create({
      userId,
      appointmentId: doctorId ? appointmentId : null,
      doctorId: doctorId || null,
      hospitalId: hospitalId || null,
      rating: numericRating,
      title,
      comment,
      verifiedPatient: true,
    });

    await updateAverageRating(doctorId || null, hospitalId || null);

    res.json({ success: true, message: "Review submitted", review });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.json({
        success: false,
        message: "You have already reviewed this",
      });
    }
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Get Recent Reviews (public, platform-wide — for the homepage)
// =============================
const getRecentReviews = async (req, res) => {
  try {
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 6));

    const reviews = await reviewModel
      .find({ isVisible: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name image")
      .populate("doctorId", "name")
      .populate("hospitalId", "name");

    res.json({ success: true, reviews });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Get Doctor Reviews (public)
// =============================
const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page, limit, skip } = parsePagination(req.query);

    const filter = { doctorId, isVisible: true };

    const [reviews, total, distribution] = await Promise.all([
      reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name image"),
      reviewModel.countDocuments(filter),
      getRatingDistribution(doctorId, null),
    ]);

    res.json({ success: true, reviews, total, page, limit, distribution });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Get Hospital Reviews (public)
// =============================
const getHospitalReviews = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { page, limit, skip } = parsePagination(req.query);

    const filter = { hospitalId, isVisible: true };

    const [reviews, total, distribution] = await Promise.all([
      reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name image"),
      reviewModel.countDocuments(filter),
      getRatingDistribution(null, hospitalId),
    ]);

    res.json({ success: true, reviews, total, page, limit, distribution });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Get My Reviews (authUser)
// =============================
// Reviews can only be edited within this window of being created.
const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const getMyReviews = async (req, res) => {
  try {
    const userId = req.userId;

    const reviews = await reviewModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate("doctorId", "name image speciality")
      .populate("hospitalId", "name image")
      .populate("appointmentId", "slotDate slotTime");

    // `editable` is computed server-side (rather than left to the client)
    // so the 24h window has a single source of truth shared with editMyReview.
    const now = Date.now();
    const reviewsWithEditable = reviews.map((review) => ({
      ...review.toObject(),
      editable: now - review.createdAt.getTime() <= EDIT_WINDOW_MS,
    }));

    res.json({ success: true, reviews: reviewsWithEditable });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Edit My Review (authUser, owner, within 24h)
// =============================
const editMyReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await reviewModel.findById(reviewId);

    if (!review || review.userId.toString() !== userId) {
      return res.json({ success: false, message: "Review not found" });
    }

    if (Date.now() - review.createdAt.getTime() > EDIT_WINDOW_MS) {
      return res.json({
        success: false,
        message: "Reviews can only be edited within 24 hours of posting",
      });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);
      if (
        !Number.isFinite(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }
      review.rating = numericRating;
    }
    if (title !== undefined) review.title = title.trim();
    if (comment !== undefined) review.comment = comment.trim();

    await review.save();
    await updateAverageRating(review.doctorId, review.hospitalId);

    res.json({ success: true, message: "Review updated", review });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Delete My Review (authUser, owner)
// =============================
const deleteMyReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { reviewId } = req.params;

    const review = await reviewModel.findById(reviewId);

    if (!review || review.userId.toString() !== userId) {
      return res.json({ success: false, message: "Review not found" });
    }

    await review.deleteOne();
    await updateAverageRating(review.doctorId, review.hospitalId);

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Get All Reviews (admin moderation)
// =============================
const getAllReviewsAdmin = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, 20, 100);

    const [reviews, total] = await Promise.all([
      reviewModel
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name image")
        .populate("doctorId", "name")
        .populate("hospitalId", "name"),
      reviewModel.countDocuments(),
    ]);

    res.json({ success: true, reviews, total, page, limit });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Toggle Review Visibility (admin)
// =============================
const toggleReviewVisibility = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }

    review.isVisible = !review.isVisible;
    await review.save();

    await updateAverageRating(review.doctorId, review.hospitalId);

    res.json({ success: true, message: "Review visibility updated", review });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Reply To Review (admin)
// =============================
const replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    const review = await reviewModel.findByIdAndUpdate(
      reviewId,
      { adminReply: reply || "" },
      { new: true },
    );

    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }

    res.json({ success: true, message: "Reply saved", review });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Doctor / Hospital reply to review (owner-only)
// =============================
// Shared logic for the four owner-reply endpoints below. `role` determines
// which id field on the review is checked for ownership and which value is
// stamped into reply.repliedBy — both derived from the authenticated
// account (req.docId / req.hospitalId), never from the request body.
const MAX_REPLY_LENGTH = 1000;

const submitOwnerReply = async (req, res, { role, mode }) => {
  try {
    const { reviewId } = req.params;
    const { text } = req.body;
    const ownerId = role === "doctor" ? req.docId : req.hospitalId;
    const ownerField = role === "doctor" ? "doctorId" : "hospitalId";

    if (!text || !text.trim()) {
      return res.json({ success: false, message: "Reply cannot be empty" });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > MAX_REPLY_LENGTH) {
      return res.json({
        success: false,
        message: `Reply cannot exceed ${MAX_REPLY_LENGTH} characters`,
      });
    }

    const review = await reviewModel.findById(reviewId);

    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }

    const target = review[ownerField];
    if (!target || target.toString() !== ownerId) {
      return res.json({ success: false, message: "Not authorized to reply to this review" });
    }

    if (mode === "create" && review.reply && review.reply.text) {
      return res.json({
        success: false,
        message: "A reply already exists for this review. Use edit instead.",
      });
    }

    if (mode === "update" && (!review.reply || !review.reply.text)) {
      return res.json({
        success: false,
        message: "No existing reply to update",
      });
    }

    review.reply = {
      text: trimmedText,
      repliedAt: new Date(),
      repliedBy: role,
    };

    await review.save();

    res.json({
      success: true,
      message:
        mode === "create"
          ? "Reply submitted successfully"
          : "Reply updated successfully",
      review,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const replyToReviewAsDoctor = (req, res) =>
  submitOwnerReply(req, res, { role: "doctor", mode: "create" });

const updateDoctorReply = (req, res) =>
  submitOwnerReply(req, res, { role: "doctor", mode: "update" });

const replyToReviewAsHospital = (req, res) =>
  submitOwnerReply(req, res, { role: "hospital", mode: "create" });

const updateHospitalReply = (req, res) =>
  submitOwnerReply(req, res, { role: "hospital", mode: "update" });

// =============================
// Delete Review (admin)
// =============================
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await reviewModel.findByIdAndDelete(reviewId);

    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }

    await updateAverageRating(review.doctorId, review.hospitalId);

    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  updateAverageRating,
  addReview,
  getRecentReviews,
  getDoctorReviews,
  getHospitalReviews,
  getMyReviews,
  editMyReview,
  deleteMyReview,
  getAllReviewsAdmin,
  toggleReviewVisibility,
  replyToReview,
  replyToReviewAsDoctor,
  updateDoctorReply,
  replyToReviewAsHospital,
  updateHospitalReply,
  deleteReview,
};
