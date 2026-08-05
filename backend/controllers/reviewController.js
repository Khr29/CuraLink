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

// =============================
// Add Review (patient, authUser)
// =============================
const addReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId, doctorId, hospitalId, rating, title, comment } =
      req.body;

    if (!appointmentId || !rating || !title || !comment) {
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

    if (doctorId && appointment.docId.toString() !== doctorId) {
      return res.json({
        success: false,
        message: "Doctor does not match this appointment",
      });
    }

    if (hospitalId && appointment.hospitalId.toString() !== hospitalId) {
      return res.json({
        success: false,
        message: "Hospital does not match this appointment",
      });
    }

    const existing = await reviewModel.findOne({
      appointmentId,
      ...(doctorId ? { doctorId } : {}),
      ...(hospitalId ? { hospitalId } : {}),
    });

    if (existing) {
      return res.json({
        success: false,
        message: "You have already reviewed this appointment",
      });
    }

    const review = await reviewModel.create({
      userId,
      appointmentId,
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
        message: "You have already reviewed this appointment",
      });
    }
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

    const [reviews, total] = await Promise.all([
      reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name image"),
      reviewModel.countDocuments(filter),
    ]);

    res.json({ success: true, reviews, total, page, limit });
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

    const [reviews, total] = await Promise.all([
      reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name image"),
      reviewModel.countDocuments(filter),
    ]);

    res.json({ success: true, reviews, total, page, limit });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Get My Reviews (authUser)
// =============================
const getMyReviews = async (req, res) => {
  try {
    const userId = req.userId;

    const reviews = await reviewModel.find({ userId });

    res.json({ success: true, reviews });
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
  getDoctorReviews,
  getHospitalReviews,
  getMyReviews,
  getAllReviewsAdmin,
  toggleReviewVisibility,
  replyToReview,
  deleteReview,
};
