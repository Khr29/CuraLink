import mongoose from "mongoose";
import pharmacyModel from "../models/pharmacyModel.js";
import medicalRecordModel from "../models/medicalRecordModel.js";
import { isObjectIdString } from "../middlewares/validateObjectId.js";
import bcrypt from "bcrypt";
import { logAction, AUDIT_ACTIONS } from "../utils/auditLog.js";
import { issueSession, revokeSession } from "../utils/session.js";
import { signAccessToken } from "../utils/tokens.js";
import { validatePasswordStrength, applyNewPassword, isPasswordReused } from "../utils/passwordSecurity.js";
import { readLoginCredentials } from "../utils/loginInput.js";

// Fields a pharmacy is allowed to edit about its own profile — password/
// active/email are managed through their own dedicated paths (self/password,
// admin-only activation, support-assisted email change) same as hospitalModel.
const SELF_EDITABLE_FIELDS = ["name", "phone", "address", "licenseNumber"];

// =============================
// Login Pharmacy
// =============================
const loginPharmacy = async (req, res) => {
  try {
    // Plain non-empty strings only (blocks {"$ne":""}-style operator objects).
    const credentials = readLoginCredentials(req.body);
    if (!credentials) {
      return res.json({ success: false, message: "Missing Details" });
    }
    const { email, password } = credentials;

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

    const pharmacy = await pharmacyModel.findById(req.pharmacyId).select("+previousPasswords");
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
// Admin input helpers
// =============================
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PHONE_RE = /^[0-9+()\-\s]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADDRESS_FIELDS = ["line1", "line2", "city", "state", "country", "pincode"];

// Returns { error } or { value } containing only trimmed, length-capped
// strings. `partial` skips the required checks so create and update share
// the same rules.
const parsePharmacyInput = (body, { partial = false } = {}) => {
  const value = {};
  const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : null);

  if (body.name !== undefined || !partial) {
    const name = str(body.name, 120);
    if (!name) return { error: "Pharmacy name is required" };
    value.name = name;
  }
  if (body.email !== undefined || !partial) {
    const email = str(body.email, 254)?.toLowerCase();
    if (!email || !EMAIL_RE.test(email)) return { error: "A valid email is required" };
    value.email = email;
  }
  if (body.licenseNumber !== undefined) {
    const lic = str(body.licenseNumber, 60);
    if (lic === null) return { error: "Invalid license number" };
    value.licenseNumber = lic;
  }
  if (body.phone !== undefined) {
    const phone = str(body.phone, 20);
    if (phone === null || (phone && !PHONE_RE.test(phone))) return { error: "Invalid phone number" };
    value.phone = phone;
  }
  if (body.address !== undefined) {
    let addr = body.address;
    if (typeof addr === "string") {
      try {
        addr = JSON.parse(addr);
      } catch {
        return { error: "Invalid address" };
      }
    }
    if (!addr || typeof addr !== "object" || Array.isArray(addr)) return { error: "Invalid address" };
    value.address = {};
    for (const f of ADDRESS_FIELDS) {
      if (addr[f] !== undefined) value.address[f] = str(addr[f], 120) ?? "";
    }
  }
  return { value };
};

// A non-empty license number identifies one pharmacy. Compared
// case-insensitively; empty values are never treated as duplicates.
const findDuplicate = async ({ email, licenseNumber }, excludeId) => {
  const or = [];
  if (email) or.push({ email });
  if (licenseNumber) or.push({ licenseNumber: new RegExp(`^${escapeRegex(licenseNumber)}$`, "i") });
  if (!or.length) return null;
  const query = { $or: or };
  if (excludeId) query._id = { $ne: excludeId };
  const dup = await pharmacyModel.findOne(query).select("email licenseNumber");
  if (!dup) return null;
  return dup.email === email
    ? "A pharmacy with this email already exists"
    : "A pharmacy with this license number already exists";
};

const readPaging = (query) => ({
  page: Math.max(parseInt(query.page, 10) || 1, 1),
  limit: Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100),
});

// =============================
// Add Pharmacy (authAdmin)
// =============================
const addPharmacy = async (req, res) => {
  try {
    const parsed = parsePharmacyInput(req.body || {});
    if (parsed.error) return res.json({ success: false, message: parsed.error });

    const { password } = req.body;
    if (typeof password !== "string" || !password) {
      return res.json({ success: false, message: "Name, email and password are required" });
    }
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return res.json({ success: false, message: strength.message });
    }

    const duplicate = await findDuplicate(parsed.value);
    if (duplicate) return res.json({ success: false, message: duplicate });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const pharmacy = new pharmacyModel({ ...parsed.value, password: hashedPassword });
    await pharmacy.save();

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.PHARMACY_CREATED,
      target: { type: "pharmacy", id: pharmacy._id, label: pharmacy.name },
      status: "success",
    });

    res.json({ success: true, message: "Pharmacy created successfully", pharmacyId: pharmacy._id });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Could not create pharmacy" });
  }
};

// =============================
// Get All Pharmacies (authAdmin) — search, status filter, pagination.
// `counts` is always the unfiltered total/active/inactive split.
// =============================
const getAllPharmacies = async (req, res) => {
  try {
    const { page, limit } = readPaging(req.query);
    const { status, search } = req.query;

    const filter = {};
    if (status === "active") filter.active = true;
    else if (status === "inactive") filter.active = false;

    const term = typeof search === "string" ? search.trim().slice(0, 100) : "";
    if (term) {
      const rx = new RegExp(escapeRegex(term), "i");
      filter.$or = [{ name: rx }, { email: rx }, { licenseNumber: rx }, { phone: rx }, { "address.city": rx }];
    }

    const [pharmacies, total, activeCount, allCount] = await Promise.all([
      pharmacyModel.find(filter).select("-password").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      pharmacyModel.countDocuments(filter),
      pharmacyModel.countDocuments({ active: true }),
      pharmacyModel.countDocuments({}),
    ]);

    res.json({
      success: true,
      pharmacies,
      pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
      counts: { total: allCount, active: activeCount, inactive: allCount - activeCount },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Could not load pharmacies" });
  }
};

// =============================
// Get One Pharmacy (authAdmin)
// =============================
const getPharmacyById = async (req, res) => {
  try {
    const pharmacy = await pharmacyModel.findById(req.params.id).select("-password");
    if (!pharmacy) return res.json({ success: false, message: "Pharmacy not found" });
    res.json({ success: true, pharmacy });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Could not load pharmacy" });
  }
};

// =============================
// Update Pharmacy (authAdmin) — whitelisted fields only. `active` has its
// own endpoint; email/license changes are re-checked for duplicates.
// =============================
const updatePharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacy = await pharmacyModel.findById(id);
    if (!pharmacy) return res.json({ success: false, message: "Pharmacy not found" });

    const parsed = parsePharmacyInput(req.body || {}, { partial: true });
    if (parsed.error) return res.json({ success: false, message: parsed.error });
    const updateData = parsed.value;

    const duplicate = await findDuplicate(
      { email: updateData.email, licenseNumber: updateData.licenseNumber },
      id
    );
    if (duplicate) return res.json({ success: false, message: duplicate });

    const changedFields = Object.keys(updateData);

    if (req.body.password) {
      const strength = validatePasswordStrength(req.body.password);
      if (!strength.valid) return res.json({ success: false, message: strength.message });
      updateData.password = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));
      updateData.passwordChangedAt = new Date();
    }

    await pharmacyModel.findByIdAndUpdate(id, { $set: updateData });

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.PHARMACY_UPDATED,
      target: { type: "pharmacy", id, label: updateData.name || pharmacy.name },
      // Field names only — never values.
      newValue: { fields: changedFields, passwordReset: Boolean(updateData.password) },
      status: "success",
    });

    res.json({ success: true, message: "Pharmacy updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Could not update pharmacy" });
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
    res.json({ success: false, message: "Could not update pharmacy status" });
  }
};

// =============================
// Dispensing history for one pharmacy (authAdmin). Reads the append-only
// medicalRecord.dispensingRecords ledger, so only confirmed dispenses
// appear. No patient/doctor identity is returned — the prescription ID is
// the reference an admin can look up on the Prescriptions page.
// =============================
const getPharmacyDispensingHistory = async (req, res) => {
  try {
    const pharmacyId = new mongoose.Types.ObjectId(req.params.id);
    const { page, limit } = readPaging(req.query);

    const rows = await medicalRecordModel.aggregate([
      { $match: { "dispensingRecords.pharmacyId": pharmacyId } },
      { $unwind: "$dispensingRecords" },
      { $match: { "dispensingRecords.pharmacyId": pharmacyId } },
      { $sort: { "dispensingRecords.dispensedAt": -1 } },
      {
        $facet: {
          items: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                prescriptionId: 1,
                medicineName: "$dispensingRecords.medicineName",
                quantityDispensed: "$dispensingRecords.quantityDispensed",
                notes: "$dispensingRecords.notes",
                dispensedAt: "$dispensingRecords.dispensedAt",
              },
            },
          ],
          total: [{ $count: "n" }],
        },
      },
    ]);

    const total = rows[0]?.total[0]?.n || 0;
    res.json({
      success: true,
      history: rows[0]?.items || [],
      pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Could not load dispensing history" });
  }
};

// =============================
// Aggregated stats (authAdmin): pharmacy counts plus dispensing activity,
// overall or for one pharmacy (?pharmacyId=).
// =============================
const getPharmacyAdminStats = async (req, res) => {
  try {
    const match = {};
    if (req.query.pharmacyId !== undefined) {
      if (!isObjectIdString(req.query.pharmacyId)) {
        return res.json({ success: false, message: "Invalid pharmacy id" });
      }
      match.pharmacyId = new mongoose.Types.ObjectId(req.query.pharmacyId);
    }

    const [total, active, dispensing] = await Promise.all([
      pharmacyModel.countDocuments({}),
      pharmacyModel.countDocuments({ active: true }),
      medicalRecordModel.aggregate([
        { $unwind: "$dispensingRecords" },
        { $replaceRoot: { newRoot: { $mergeObjects: ["$dispensingRecords", { recordId: "$_id" }] } } },
        { $match: match },
        {
          $group: {
            _id: null,
            events: { $sum: 1 },
            units: { $sum: "$quantityDispensed" },
            prescriptions: { $addToSet: "$recordId" },
          },
        },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        total,
        active,
        inactive: total - active,
        dispensingEvents: dispensing[0]?.events || 0,
        unitsDispensed: dispensing[0]?.units || 0,
        prescriptionsServed: dispensing[0]?.prescriptions.length || 0,
      },
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Could not load pharmacy stats" });
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
  getPharmacyById,
  getPharmacyDispensingHistory,
  getPharmacyAdminStats,
};
