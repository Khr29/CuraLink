import hospitalModel from "../models/hospitalModel.js";

// =============================
// Add Hospital
// =============================
const addHospital = async (req, res) => {
  try {
    const hospitalData = req.body;

    // Check if hospital already exists
    const exists = await hospitalModel.findOne({
      email: hospitalData.email,
    });

    if (exists) {
      return res.json({
        success: false,
        message: "Hospital already exists",
      });
    }

    // Create hospital
    const hospital = new hospitalModel(hospitalData);

    await hospital.save();

    res.json({
      success: true,
      message: "Hospital Added Successfully",
      hospital,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// =============================
// Get All Hospitals
// =============================
const getAllHospitals = async (req, res) => {};


// =============================
// Get Hospital By ID
// =============================
const getHospitalById = async (req, res) => {};


// =============================
// Update Hospital
// =============================
const updateHospital = async (req, res) => {};


// =============================
// Delete Hospital
// =============================
const deleteHospital = async (req, res) => {};


// =============================
// Change Hospital Status
// =============================
const changeHospitalStatus = async (req, res) => {};

export {
  addHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  changeHospitalStatus,
};