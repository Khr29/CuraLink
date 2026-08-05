import reviewModel from "../models/reviewModel.js";
import doctorModel from "../models/doctorModel.js";
import hospitalModel from "../models/hospitalModel.js";
import appointmentModel from "../models/appointmentModel.js";

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