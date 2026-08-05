import express from "express";
import {
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
} from "../controllers/reviewController.js";
import authUser from "../middlewares/authUser.js";
import authAdmin from "../middlewares/authAdmin.js";
import authDoctor from "../middlewares/authDoctor.js";
import authHospital from "../middlewares/authHospital.js";

const reviewRouter = express.Router();

// =====================================
// Patient
// =====================================
reviewRouter.post("/add", authUser, addReview);
reviewRouter.get("/my-reviews", authUser, getMyReviews);
reviewRouter.patch("/:reviewId", authUser, editMyReview);
reviewRouter.delete("/:reviewId", authUser, deleteMyReview);

// =====================================
// Public
// =====================================
reviewRouter.get("/recent", getRecentReviews);
reviewRouter.get("/doctor/:doctorId", getDoctorReviews);
reviewRouter.get("/hospital/:hospitalId", getHospitalReviews);

// =====================================
// Admin Moderation
// =====================================
reviewRouter.get("/admin/all", authAdmin, getAllReviewsAdmin);
reviewRouter.patch("/admin/:reviewId/visibility", authAdmin, toggleReviewVisibility);
reviewRouter.patch("/admin/:reviewId/reply", authAdmin, replyToReview);
reviewRouter.delete("/admin/:reviewId", authAdmin, deleteReview);

// =====================================
// Doctor self-service reply
// =====================================
reviewRouter.post("/doctor/:reviewId/reply", authDoctor, replyToReviewAsDoctor);
reviewRouter.put("/doctor/:reviewId/reply", authDoctor, updateDoctorReply);

// =====================================
// Hospital self-service reply
// =====================================
reviewRouter.post("/hospital/:reviewId/reply", authHospital, replyToReviewAsHospital);
reviewRouter.put("/hospital/:reviewId/reply", authHospital, updateHospitalReply);

export default reviewRouter;
