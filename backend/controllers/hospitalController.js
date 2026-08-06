import hospitalModel from "../models/hospitalModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import { logAction, AUDIT_ACTIONS } from "../utils/auditLog.js";

// Fields a hospital is allowed to edit about its own profile — everything
// else (password, active, doctors, averageRating, totalReviews, media) is
// managed through its own dedicated endpoint or is admin/system-controlled.
const SELF_EDITABLE_FIELDS = [
  "name",
  "description",
  "phone",
  "email",
  "website",
  "address",
  "location",
  "openingHours",
  "beds",
  "emergency",
  "insuranceAccepted",
  "departments",
  "facilities",
  "specialties",
  "hospitalType",
];

// Fields a hospital may edit on one of its own doctors. Deliberately
// excludes email/password/hospitalId/reviews/ratings/appointment history.
const DOCTOR_SELF_EDITABLE_FIELDS = [
  "about",
  "experience",
  "fees",
  "available",
  "degree",
  "address",
  "speciality",
];

// =============================
// Add Hospital
// =============================
const addHospital = async (req, res) => {
  try {
    const hospitalData = req.body;

    hospitalData.active = hospitalData.active === "true";
    hospitalData.beds = Number(hospitalData.beds);

    // Portal login password is optional at creation time (admin can set it
    // later via Edit) — hash it now if provided so it's never stored plain.
    if (hospitalData.password) {
      if (hospitalData.password.length < 8) {
        return res.json({
          success: false,
          message: "Please enter a stronger portal password (min 8 characters)",
        });
      }
      const salt = await bcrypt.genSalt(10);
      hospitalData.password = await bcrypt.hash(hospitalData.password, salt);
    } else {
      delete hospitalData.password;
    }

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

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.HOSPITAL_CREATED,
      target: { type: "hospital", id: hospital._id, label: hospital.name },
      status: "success",
    });

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
    const hospitals = await hospitalModel.find({}).select("-password");

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

    const hospital = await hospitalModel.findById(id).select("-password");

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
    const updateData = { ...req.body };

    // Admin resetting/setting the hospital's portal login password —
    // never persist it in plain text.
    if (updateData.password) {
      if (updateData.password.length < 8) {
        return res.json({
          success: false,
          message: "Please enter a stronger portal password (min 8 characters)",
        });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete updateData.password;
    }

    await hospitalModel.findByIdAndUpdate(id, updateData);

    const { password: _updatedPassword, ...updateLogValue } = updateData;

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.HOSPITAL_UPDATED,
      target: { type: "hospital", id, label: updateData.name || "" },
      newValue: updateLogValue,
      status: "success",
    });

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

    const hospital = await hospitalModel.findByIdAndDelete(id);
    const hospitalSnapshot = hospital
      ? (({ password, ...rest }) => rest)(hospital.toObject())
      : null;

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.HOSPITAL_DELETED,
      target: { type: "hospital", id, label: hospital?.name || "" },
      previousValue: hospitalSnapshot,
      status: "success",
    });

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

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.HOSPITAL_STATUS_CHANGED,
      target: { type: "hospital", id, label: hospital.name },
      previousValue: { active: hospital.active },
      newValue: { active: !hospital.active },
      status: "success",
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

// =============================
// Hospital Portal Login
// =============================
const loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hospital = await hospitalModel.findOne({ email });
    if (!hospital || !hospital.password) {
      await logAction({
        req,
        actorType: "hospital",
        actorLabel: email || "",
        action: AUDIT_ACTIONS.LOGIN,
        status: "failure",
        reason: "Invalid credentials",
      });
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch) {
      await logAction({
        req,
        actorType: "hospital",
        actorId: hospital._id,
        actorLabel: hospital.email,
        action: AUDIT_ACTIONS.LOGIN,
        status: "failure",
        reason: "Invalid credentials",
      });
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: hospital._id }, process.env.JWT_SECRET);

    await logAction({
      req,
      actorType: "hospital",
      actorId: hospital._id,
      actorLabel: hospital.email,
      action: AUDIT_ACTIONS.LOGIN,
      status: "success",
    });

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Logout Hospital (stateless JWT — this only records the audit entry)
// =============================
const logoutHospital = async (req, res) => {
  try {
    const hospital = await hospitalModel.findById(req.hospitalId).select("email");
    await logAction({
      req,
      actorType: "hospital",
      actorId: req.hospitalId,
      actorLabel: hospital?.email || "",
      action: AUDIT_ACTIONS.LOGOUT,
      status: "success",
    });
    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Get Own Profile (authHospital)
// =============================
const getHospitalSelfProfile = async (req, res) => {
  try {
    const hospital = await hospitalModel
      .findById(req.hospitalId)
      .select("-password");

    if (!hospital) {
      return res.json({ success: false, message: "Hospital not found" });
    }

    res.json({ success: true, hospital });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Update Own Profile (authHospital)
// =============================
const updateHospitalSelfProfile = async (req, res) => {
  try {
    const updateData = {};
    for (const field of SELF_EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    if (updateData.beds !== undefined) updateData.beds = Number(updateData.beds);

    await hospitalModel.findByIdAndUpdate(req.hospitalId, updateData);

    const hospital = await hospitalModel
      .findById(req.hospitalId)
      .select("-password");

    res.json({ success: true, message: "Profile updated", hospital });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Change Own Password (authHospital)
// =============================
const changeHospitalSelfPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    const hospital = await hospitalModel.findById(req.hospitalId);
    if (!hospital) {
      return res.json({ success: false, message: "Hospital not found" });
    }

    if (hospital.password) {
      const isMatch = await bcrypt.compare(currentPassword || "", hospital.password);
      if (!isMatch) {
        return res.json({ success: false, message: "Current password is incorrect" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    hospital.password = await bcrypt.hash(newPassword, salt);
    await hospital.save();

    await logAction({
      req,
      actorType: "hospital",
      actorId: hospital._id,
      actorLabel: hospital.email,
      action: AUDIT_ACTIONS.PASSWORD_CHANGED,
      target: { type: "hospital", id: hospital._id, label: hospital.name },
      status: "success",
    });

    res.json({ success: true, message: "Password updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Upload Banner / Logo / Gallery (authHospital)
// =============================
const uploadHospitalMedia = async (req, res) => {
  try {
    const updateData = {};

    if (req.files?.banner?.length) {
      const upload = await cloudinary.uploader.upload(req.files.banner[0].path, {
        resource_type: "image",
      });
      updateData.banner = upload.secure_url;
    }

    if (req.files?.logo?.length) {
      const upload = await cloudinary.uploader.upload(req.files.logo[0].path, {
        resource_type: "image",
      });
      updateData.logo = upload.secure_url;
    }

    if (req.files?.image?.length) {
      const upload = await cloudinary.uploader.upload(req.files.image[0].path, {
        resource_type: "image",
      });
      updateData.image = upload.secure_url;
    }

    if (req.files?.galleryImages?.length) {
      const galleryUrls = [];
      for (const file of req.files.galleryImages) {
        const upload = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });
        galleryUrls.push(upload.secure_url);
      }

      const hospital = await hospitalModel.findById(req.hospitalId).select("gallery");
      updateData.gallery = [...(hospital?.gallery || []), ...galleryUrls];
    }

    if (Object.keys(updateData).length === 0) {
      return res.json({ success: false, message: "No files uploaded" });
    }

    await hospitalModel.findByIdAndUpdate(req.hospitalId, updateData);

    const hospital = await hospitalModel
      .findById(req.hospitalId)
      .select("-password");

    res.json({ success: true, message: "Media updated", hospital });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Delete a Gallery Image (authHospital)
// =============================
const deleteHospitalGalleryImage = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.json({ success: false, message: "Image url is required" });
    }

    await hospitalModel.findByIdAndUpdate(req.hospitalId, {
      $pull: { gallery: url },
    });

    res.json({ success: true, message: "Image removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Own Dashboard (authHospital)
// =============================
const getHospitalSelfDashboard = async (req, res) => {
  try {
    const hospitalId = req.hospitalId;

    const [hospital, doctors, appointments] = await Promise.all([
      hospitalModel.findById(hospitalId).select("-password"),
      doctorModel.find({ hospitalId }).select("-password"),
      appointmentModel.find({ hospitalId }).lean(),
    ]);

    if (!hospital) {
      return res.json({ success: false, message: "Hospital not found" });
    }

    const todayKey = (() => {
      const d = new Date();
      return `${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`;
    })();

    const todaysAppointments = appointments.filter(
      (a) => a.slotDate === todayKey && !a.cancelled,
    ).length;

    const upcomingAppointments = appointments.filter(
      (a) => !a.cancelled && !a.isCompleted,
    ).length;

    const patientsServed = new Set(
      appointments.filter((a) => a.isCompleted).map((a) => a.userId.toString()),
    ).size;

    const departmentCount = new Set([
      ...(hospital.departments || []),
      ...doctors.map((d) => d.speciality).filter(Boolean),
    ]).size;

    const dashData = {
      doctors: doctors.length,
      departments: departmentCount,
      todaysAppointments,
      upcomingAppointments,
      averageRating: hospital.averageRating,
      totalReviews: hospital.totalReviews,
      beds: hospital.beds,
      patientsServed,
    };

    res.json({ success: true, hospital, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Own Doctors (authHospital)
// =============================
const getHospitalSelfDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({ hospitalId: req.hospitalId })
      .select("-password");

    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Add Doctor scoped to own hospital (authHospital)
// =============================
const hospitalAddDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, address } =
      req.body;
    const imageFile = req.file;

    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address ||
      !imageFile
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter valid email" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter strong password",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const [hashedPassword, imageUpload] = await Promise.all([
      bcrypt.hash(password, salt),
      cloudinary.uploader.upload(imageFile.path, { resource_type: "image" }),
    ]);

    const doctorData = {
      name,
      email,
      image: imageUpload.secure_url,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      // The hospital is never chosen manually — it's always the
      // authenticated hospital's own id.
      hospitalId: req.hospitalId,
      date: Date.now(),
    };

    await doctorModel.create(doctorData);

    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Update own doctor (authHospital)
// =============================
const hospitalUpdateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor || doctor.hospitalId.toString() !== req.hospitalId) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const updateData = {};
    for (const field of DOCTOR_SELF_EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    if (updateData.address !== undefined && typeof updateData.address === "string") {
      updateData.address = JSON.parse(updateData.address);
    }
    if (updateData.available !== undefined) {
      updateData.available = updateData.available === true || updateData.available === "true";
    }

    if (req.file) {
      const imageUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      updateData.image = imageUpload.secure_url;
    }

    await doctorModel.findByIdAndUpdate(doctorId, updateData);

    res.json({ success: true, message: "Doctor Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Delete own doctor (authHospital)
// =============================
const hospitalDeleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor || doctor.hospitalId.toString() !== req.hospitalId) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    await doctorModel.findByIdAndDelete(doctorId);

    res.json({ success: true, message: "Doctor Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Own Appointments (authHospital)
// =============================
const getHospitalSelfAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find({ hospitalId: req.hospitalId })
      .lean();

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  deleteHospital,
  changeHospitalStatus,
  loginHospital,
  logoutHospital,
  getHospitalSelfProfile,
  updateHospitalSelfProfile,
  changeHospitalSelfPassword,
  uploadHospitalMedia,
  deleteHospitalGalleryImage,
  getHospitalSelfDashboard,
  getHospitalSelfDoctors,
  hospitalAddDoctor,
  hospitalUpdateDoctor,
  hospitalDeleteDoctor,
  getHospitalSelfAppointments,
};
