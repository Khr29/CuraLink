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
    const [
      totalDoctors,
      totalVerifiedDoctors,
      totalHospitals,
      totalActiveHospitals,
      totalPatients,
      totalAppointments,
      ratingAgg,
      specialities,
    ] = await Promise.all([
      doctorModel.countDocuments(),
      doctorModel.countDocuments({ verificationStatus: "verified" }),
      hospitalModel.countDocuments(),
      hospitalModel.countDocuments({ active: true }),
      userModel.countDocuments(),
      appointmentModel.countDocuments(),
      reviewModel.aggregate([
        { $match: { isVisible: true } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
      doctorModel.distinct("speciality"),
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
        totalVerifiedDoctors,
        totalHospitals,
        totalActiveHospitals,
        totalAppointments,
        totalReviews,
        averageRating,
        totalSpecialties: specialities.length,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { getPlatformStats };
