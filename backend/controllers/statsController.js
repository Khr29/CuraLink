import doctorModel from "../models/doctorModel.js";
import hospitalModel from "../models/hospitalModel.js";
import userModel from "../models/userModels.js";
import appointmentModel from "../models/appointmentModel.js";
import reviewModel from "../models/reviewModel.js";

// =============================
// Get Platform Stats (public)
// =============================
// Live counts for the homepage — no auth required, read-only aggregates.
const getPlatformStats = async (req, res) => {
  try {
    const [totalDoctors, totalHospitals, totalPatients, totalAppointments, ratingAgg] =
      await Promise.all([
        doctorModel.countDocuments(),
        hospitalModel.countDocuments(),
        userModel.countDocuments(),
        appointmentModel.countDocuments(),
        reviewModel.aggregate([
          { $match: { isVisible: true } },
          { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
        ]),
      ]);

    const totalReviews = ratingAgg[0]?.count || 0;
    const averageRating = ratingAgg[0]?.avgRating
      ? Math.round(ratingAgg[0].avgRating * 10) / 10
      : 0;

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalHospitals,
        totalAppointments,
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getPlatformStats };
