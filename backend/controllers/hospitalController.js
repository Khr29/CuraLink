import hospitalModel from "../models/hospitalModel.js";
import { v2 as cloudinary } from "cloudinary";

// =============================
// Add Hospital
// =============================
const addHospital = async (req, res) => {
  try {
    console.log("========== REQUEST ==========");
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("FILES:", req.files);
    console.log("=============================");

    const hospitalData = req.body;

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

    const image = req.files.image[0].path;

    hospitalData.image = image;
    // Create hospital
    // Upload gallery images
    const galleryUrls = [];

    if (req.files.galleryImages) {
      for (const file of req.files.galleryImages) {
        const upload = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });

        galleryUrls.push(upload.secure_url);
      }
    }

    hospitalData.galleryImages = galleryUrls;

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

    res.json({
      success: true,
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
