import pharmacyModel from "../models/pharmacyModel.js";
import bcrypt from "bcrypt";
import { logAction, AUDIT_ACTIONS } from "../utils/auditLog.js";
import { issueSession, revokeSession } from "../utils/session.js";
import { signAccessToken } from "../utils/tokens.js";
import { validatePasswordStrength, applyNewPassword, isPasswordReused } from "../utils/passwordSecurity.js";

// Fields a pharmacy is allowed to edit about its own profile — password/
// active/email are managed through their own dedicated paths (self/password,
// admin-only activation, support-assisted email change) same as hospitalModel.
const SELF_EDITABLE_FIELDS = ["name", "phone", "address", "licenseNumber"];

// =============================
// Login Pharmacy
// =============================
const loginPharmacy = async (req, res) => {
  try {
    const { email, password } = req.body;

    const pharmacy = await pharmacyModel.findOne({ email });
    if (!pharmacy) {
      await logAction({
        req,
        actorType: "pharmacy",
        actorLabel: email || "",
        action: AUDIT_ACTIONS.LOGIN,
        status: "failure",
        reason: "Invalid credentials",
      });
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, pharmacy.password);
    if (!isMatch) {
      await logAction({
        req,
        actorType: "pharmacy",
        actorId: pharmacy._id,
        actorLabel: pharmacy.email,
        action: AUDIT_ACTIONS.LOGIN,
        status: "failure",
        reason: "Invalid credentials",
      });
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    if (!pharmacy.active) {
      await logAction({
        req,
        actorType: "pharmacy",
        actorId: pharmacy._id,
        actorLabel: pharmacy.email,
        action: AUDIT_ACTIONS.LOGIN,
        status: "failure",
        reason: "Account deactivated",
      });
      return res.json({ success: false, message: "This pharmacy account has been deactivated" });
    }

    const rememberMe = req.body.rememberMe === true || req.body.rememberMe === "true";
    await issueSession({
      req,
      res,
      actorType: "pharmacy",
      actorId: pharmacy._id,
      actorLabel: pharmacy.email,
      rememberMe,
    });
    const token = signAccessToken({ id: pharmacy._id.toString() });

    await logAction({
      req,
      actorType: "pharmacy",
      actorId: pharmacy._id,
      actorLabel: pharmacy.email,
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
// Logout Pharmacy — revokes the refresh-token session and clears its cookie
// =============================
const logoutPharmacy = async (req, res) => {
  try {
    await revokeSession({ req, res, actorType: "pharmacy" });
    const pharmacy = await pharmacyModel.findById(req.pharmacyId).select("email");
    await logAction({
      req,
      actorType: "pharmacy",
      actorId: req.pharmacyId,
      actorLabel: pharmacy?.email || "",
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
// Get Own Profile (authPharmacy)
// =============================
const getPharmacySelfProfile = async (req, res) => {
  try {
    const pharmacy = await pharmacyModel.findById(req.pharmacyId).select("-password");
    if (!pharmacy) {
      return res.json({ success: false, message: "Pharmacy not found" });
    }
    res.json({ success: true, pharmacy });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Update Own Profile (authPharmacy)
// =============================
const updatePharmacySelfProfile = async (req, res) => {
  try {
    const updateData = {};
    for (const field of SELF_EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    await pharmacyModel.findByIdAndUpdate(req.pharmacyId, updateData);

    const pharmacy = await pharmacyModel.findById(req.pharmacyId).select("-password");
    res.json({ success: true, message: "Profile updated", pharmacy });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Change Own Password (authPharmacy)
// =============================
const changePharmacySelfPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.json({ success: false, message: "Missing details" });
    }
    if (newPassword !== confirmPassword) {
      return res.json({ success: false, message: "Passwords do not match" });
    }
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return res.json({ success: false, message: strength.message });
    }

    const pharmacy = await pharmacyModel.findById(req.pharmacyId);
    if (!pharmacy) return res.json({ success: false, message: "Not found" });

    const isMatch = await bcrypt.compare(currentPassword || "", pharmacy.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Current password is incorrect" });
    }

    if (await isPasswordReused(pharmacy, newPassword)) {
      return res.json({
        success: false,
        message: "Please choose a password you haven't used recently",
      });
    }

    await applyNewPassword(pharmacy, newPassword);

    await logAction({
      req,
      actorType: "pharmacy",
      actorId: pharmacy._id,
      actorLabel: pharmacy.email,
      action: AUDIT_ACTIONS.PASSWORD_CHANGED,
      status: "success",
    });

    res.json({ success: true, message: "Password updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =====================================
// Admin-facing Pharmacy Management — mirrors hospitalController's
// add/list/update/status pattern. Pharmacies are admin-provisioned only
// (no public self-registration): a fake pharmacy account could dispense
// controlled medication, so onboarding goes through the same trusted path
// as adding a hospital or doctor.
// =====================================

// =============================
// Add Pharmacy (authAdmin)
// =============================
const addPharmacy = async (req, res) => {
  try {
    const { name, email, password, licenseNumber, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Name, email and password are required" });
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return res.json({ success: false, message: strength.message });
    }

    const exists = await pharmacyModel.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.json({ success: false, message: "Pharmacy already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const pharmacy = new pharmacyModel({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      licenseNumber: licenseNumber || "",
      phone: phone || "",
      address: address ? (typeof address === "string" ? JSON.parse(address) : address) : undefined,
    });

    await pharmacy.save();

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.PHARMACY_CREATED,
      target: { type: "pharmacy", id: pharmacy._id, label: pharmacy.name },
      status: "success",
    });

    res.json({ success: true, message: "Pharmacy created successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Get All Pharmacies (authAdmin)
// =============================
const getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await pharmacyModel.find({}).select("-password");
    res.json({ success: true, pharmacies });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Update Pharmacy (authAdmin)
// =============================
const updatePharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.password) {
      const strength = validatePasswordStrength(updateData.password);
      if (!strength.valid) {
        return res.json({ success: false, message: strength.message });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
      updateData.passwordChangedAt = new Date();
    } else {
      delete updateData.password;
    }

    if (updateData.address && typeof updateData.address === "string") {
      updateData.address = JSON.parse(updateData.address);
    }

    await pharmacyModel.findByIdAndUpdate(id, updateData);

    res.json({ success: true, message: "Pharmacy updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =============================
// Change Pharmacy Status (authAdmin)
// =============================
const changePharmacyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacy = await pharmacyModel.findById(id);
    if (!pharmacy) {
      return res.json({ success: false, message: "Pharmacy not found" });
    }

    await pharmacyModel.findByIdAndUpdate(id, { active: !pharmacy.active });

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.PHARMACY_STATUS_CHANGED,
      target: { type: "pharmacy", id, label: pharmacy.name },
      previousValue: { active: pharmacy.active },
      newValue: { active: !pharmacy.active },
      status: "success",
    });

    res.json({ success: true, message: "Pharmacy status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  loginPharmacy,
  logoutPharmacy,
  getPharmacySelfProfile,
  updatePharmacySelfProfile,
  changePharmacySelfPassword,
  addPharmacy,
  getAllPharmacies,
  updatePharmacy,
  changePharmacyStatus,
};
