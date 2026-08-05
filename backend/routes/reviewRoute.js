import express from "express";
import {
  addReview,
  getDoctorReviews,
  getHospitalReviews,
  getMyReviews,
  editMyReview,
  deleteMyReview,
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
reviewRouter.patch("/:reviewId", authUser, editMyReview);
reviewRouter.delete("/:reviewId", authUser, deleteMyReview);

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
