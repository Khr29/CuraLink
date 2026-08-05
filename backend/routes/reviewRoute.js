import express from "express";
import {
  addReview,
  getDoctorReviews,
  getHospitalReviews,
  getMyReviews,
  getAllReviewsAdmin,
  toggleReviewVisibility,
  replyToReview,
  deleteReview,
} from "../controllers/reviewController.js";
import authUser from "../middlewares/authUser.js";
import authAdmin from "../middlewares/authAdmin.js";

const reviewRouter = express.Router();

// =====================================
// Patient
// =====================================
reviewRouter.post("/add", authUser, addReview);
reviewRouter.get("/my-reviews", authUser, getMyReviews);

// =====================================
// Public
// =====================================
reviewRouter.get("/doctor/:doctorId", getDoctorReviews);
reviewRouter.get("/hospital/:hospitalId", getHospitalReviews);

// =====================================
// Admin Moderation
// =====================================
reviewRouter.get("/admin/all", authAdmin, getAllReviewsAdmin);
reviewRouter.patch("/admin/:reviewId/visibility", authAdmin, toggleReviewVisibility);
reviewRouter.patch("/admin/:reviewId/reply", authAdmin, replyToReview);
reviewRouter.delete("/admin/:reviewId", authAdmin, deleteReview);

export default reviewRouter;
