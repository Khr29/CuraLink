import hospitalModel from "../models/hospitalModel.js";
import doctorModel from "../models/doctorModel.js";
import { v2 as cloudinary } from "cloudinary";

// =============================
// Add Hospital
// =============================
const addHospital = async (req, res) => {
  try {
    const hospitalData = req.body;

    hospitalData.active = hospitalData.active === "true";
    hospitalData.beds = Number(hospitalData.beds);

    if (!req.files?.image?.length) {
      return res.json({
        success: false,
        message: "Hospital image is required",
      });
    }

    // Upload main image
    const imageFile = req.files.image[0];

    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    hospitalData.image = imageUpload.secure_url;

    hospitalData.address = JSON.parse(hospitalData.address);
    hospitalData.location = JSON.parse(hospitalData.location);
    hospitalData.departments = JSON.parse(hospitalData.departments);
    hospitalData.facilities = JSON.parse(hospitalData.facilities);

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
    // Upload gallery images
    const galleryUrls = [];

    if (req.files?.galleryImages?.length) {
      for (const file of req.files.galleryImages) {
        const upload = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });

        galleryUrls.push(upload.secure_url);
      }
    }

    hospitalData.gallery = galleryUrls;

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
const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await hospitalModel.find({});

    res.json({
      success: true,
      hospitals,
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
// Get Hospital By ID
// =============================
const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await hospitalModel.findById(id);

    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found",
      });
    }

    // Get all doctors belonging to this hospital
    const doctors = await doctorModel
      .find({ hospitalId: id })
      .select("-password");

    res.json({
      success: true,
      hospital,
      doctors,
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
// Update Hospital
// =============================
const updateHospital = async (req, res) => {
  try {
    const { id } = req.params;

    await hospitalModel.findByIdAndUpdate(id, req.body);

    res.json({
      success: true,
      message: "Hospital Updated Successfully",
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
// Delete Hospital
// =============================
const deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;

    await hospitalModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Hospital Deleted Successfully",
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
// Change Hospital Status
// =============================
const changeHospitalStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await hospitalModel.findById(id);

    if (!hospital) {
      return res.json({
        success: false,
        message: "Hospital not found",
      });
    }

    await hospitalModel.findByIdAndUpdate(id, {
      active: !hospital.active,
    });

    res.json({
      success: true,
      message: "Hospital Status Updated",
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

export {
  addHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  changeHospitalStatus,
};
