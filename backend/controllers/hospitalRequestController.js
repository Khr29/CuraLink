import doctorModel from "../models/doctorModel.js";
import hospitalModel from "../models/hospitalModel.js";
import hospitalRequestModel from "../models/hospitalRequestModel.js";
import { logAction, AUDIT_ACTIONS } from "../utils/auditLog.js";

const POPULATE_DOCTOR = "name email speciality image employmentType hospitalId";
const POPULATE_HOSPITAL = "name email image hospitalType";

// Once a doctor's affiliation actually changes, any OTHER pending request
// of theirs (a stray invite, or a transfer request to a different hospital)
// is moot — cancel it so it doesn't sit forever claiming to be "pending"
// against a doctor who has already moved elsewhere.
const cancelOtherPendingRequests = async (doctorId, exceptRequestId) => {
  await hospitalRequestModel.updateMany(
    { doctorId, status: "pending", _id: { $ne: exceptRequestId } },
    { status: "cancelled", respondedAt: new Date() }
  );
};

// Shared mutation: moves a doctor onto a hospital and marks the request
// approved. Used by hospital self-approve, admin approve, admin force
// actions, and a doctor accepting an invite — every path that actually
// grants a doctor <-> hospital affiliation goes through here so the
// doctor-side mutation and the request bookkeeping never drift apart.
const approveRequestInternal = async (request, { respondedByType, respondedById }) => {
  await doctorModel.findByIdAndUpdate(request.doctorId, {
    hospitalId: request.hospitalId,
    employmentType: "hospital",
  });

  request.status = "approved";
  request.respondedAt = new Date();
  request.respondedBy = respondedById || null;
  await request.save();

  await cancelOtherPendingRequests(request.doctorId, request._id);
};

const rejectRequestInternal = async (request, { reason }) => {
  request.status = "rejected";
  request.reason = reason || "";
  request.respondedAt = new Date();
  await request.save();
};

// =====================================
// Doctor-side
// =====================================

// POST /api/doctor/request-hospital — body: { hospitalId }
// Infers join vs transfer from the doctor's current employment.
const requestHospital = async (req, res) => {
  try {
    const docId = req.docId;
    const { hospitalId } = req.body;

    const [doctor, hospital] = await Promise.all([
      doctorModel.findById(docId),
      hospitalModel.findById(hospitalId),
    ]);

    if (!doctor) return res.json({ success: false, message: "Doctor not found" });
    if (!hospital) return res.json({ success: false, message: "Hospital not found" });

    if (doctor.employmentType === "hospital" && doctor.hospitalId?.toString() === hospitalId) {
      return res.json({ success: false, message: "You already work at this hospital" });
    }

    const existingPending = await hospitalRequestModel.findOne({
      doctorId: docId,
      status: "pending",
    });
    if (existingPending) {
      return res.json({
        success: false,
        message: "You already have a pending hospital request. Cancel it before sending a new one.",
      });
    }

    const isTransfer = doctor.employmentType === "hospital" && !!doctor.hospitalId;

    const request = await hospitalRequestModel.create({
      doctorId: docId,
      hospitalId,
      fromHospitalId: isTransfer ? doctor.hospitalId : null,
      type: isTransfer ? "transfer" : "join",
      status: "pending",
      requestedBy: "doctor",
    });

    await logAction({
      req,
      actorType: "doctor",
      actorId: docId,
      actorLabel: doctor.email,
      action: AUDIT_ACTIONS.HOSPITAL_REQUEST_CREATED,
      target: { type: "hospital", id: hospitalId, label: hospital.name },
      newValue: { type: request.type },
      status: "success",
    });

    res.json({ success: true, message: "Request sent", request });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/doctor/leave-hospital — immediate, no approval needed.
const leaveHospital = async (req, res) => {
  try {
    const docId = req.docId;
    const doctor = await doctorModel.findById(docId);
    if (!doctor) return res.json({ success: false, message: "Doctor not found" });

    if (doctor.employmentType !== "hospital" || !doctor.hospitalId) {
      return res.json({ success: false, message: "You are not currently affiliated with a hospital" });
    }

    const previousHospital = await hospitalModel.findById(doctor.hospitalId).select("name");

    await doctorModel.findByIdAndUpdate(docId, {
      hospitalId: null,
      employmentType: "independent",
    });

    // Any pending request this doctor had (join/transfer they sent, or an
    // invite they hadn't responded to) is now moot.
    await cancelOtherPendingRequests(docId, null);

    await logAction({
      req,
      actorType: "doctor",
      actorId: docId,
      actorLabel: doctor.email,
      action: AUDIT_ACTIONS.DOCTOR_LEFT_HOSPITAL,
      target: { type: "hospital", id: doctor.hospitalId, label: previousHospital?.name || "" },
      status: "success",
    });

    res.json({ success: true, message: "You have left the hospital" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/doctor/hospital-requests — full history for the logged-in doctor.
const getMyHospitalRequests = async (req, res) => {
  try {
    const requests = await hospitalRequestModel
      .find({ doctorId: req.docId })
      .sort({ createdAt: -1 })
      .populate("hospitalId", POPULATE_HOSPITAL)
      .populate("fromHospitalId", POPULATE_HOSPITAL);

    res.json({ success: true, requests });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// DELETE /api/doctor/hospital-requests/:id — cancel own pending join/transfer.
const cancelMyHospitalRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await hospitalRequestModel.findById(id);

    if (!request || request.doctorId.toString() !== req.docId) {
      return res.json({ success: false, message: "Request not found" });
    }
    if (request.requestedBy !== "doctor") {
      return res.json({ success: false, message: "Use respond to accept/decline an invite" });
    }
    if (request.status !== "pending") {
      return res.json({ success: false, message: "Only pending requests can be cancelled" });
    }

    request.status = "cancelled";
    request.respondedAt = new Date();
    await request.save();

    await logAction({
      req,
      actorType: "doctor",
      actorId: req.docId,
      action: AUDIT_ACTIONS.HOSPITAL_REQUEST_CANCELLED,
      target: { type: "hospitalRequest", id, label: request.type },
      status: "success",
    });

    res.json({ success: true, message: "Request cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// PATCH /api/doctor/hospital-requests/:id/respond — accept/decline an invite.
// body: { accept: boolean }
const respondToInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const { accept } = req.body;

    const request = await hospitalRequestModel.findById(id);
    if (!request || request.doctorId.toString() !== req.docId) {
      return res.json({ success: false, message: "Request not found" });
    }
    if (request.type !== "invite" || request.status !== "pending") {
      return res.json({ success: false, message: "This invite is no longer pending" });
    }

    if (accept) {
      await approveRequestInternal(request, { respondedByType: "doctor", respondedById: req.docId });
      await logAction({
        req,
        actorType: "doctor",
        actorId: req.docId,
        action: AUDIT_ACTIONS.DOCTOR_JOINED_HOSPITAL,
        target: { type: "hospital", id: request.hospitalId },
        status: "success",
      });
      return res.json({ success: true, message: "Invite accepted" });
    }

    await rejectRequestInternal(request, { reason: "Declined by doctor" });
    await logAction({
      req,
      actorType: "doctor",
      actorId: req.docId,
      action: AUDIT_ACTIONS.HOSPITAL_REQUEST_REJECTED,
      target: { type: "hospital", id: request.hospitalId },
      status: "success",
    });
    res.json({ success: true, message: "Invite declined" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =====================================
// Hospital-side (authHospital, scoped to req.hospitalId)
// =====================================

// GET /api/hospital/self/doctor-requests?status=pending
const getHospitalDoctorRequests = async (req, res) => {
  try {
    const filter = { hospitalId: req.hospitalId };
    if (req.query.status) filter.status = req.query.status;

    const requests = await hospitalRequestModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate("doctorId", POPULATE_DOCTOR)
      .populate("fromHospitalId", POPULATE_HOSPITAL);

    res.json({ success: true, requests });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const approveHospitalDoctorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await hospitalRequestModel.findById(id);

    if (!request || request.hospitalId.toString() !== req.hospitalId) {
      return res.json({ success: false, message: "Request not found" });
    }
    if (request.type === "invite" || request.status !== "pending") {
      return res.json({ success: false, message: "This request can no longer be approved" });
    }

    await approveRequestInternal(request, { respondedByType: "hospital", respondedById: req.hospitalId });

    const hospital = await hospitalModel.findById(req.hospitalId).select("name");
    await logAction({
      req,
      actorType: "hospital",
      actorId: req.hospitalId,
      actorLabel: hospital?.name || "",
      action: AUDIT_ACTIONS.HOSPITAL_REQUEST_APPROVED,
      target: { type: "doctor", id: request.doctorId },
      status: "success",
    });

    res.json({ success: true, message: "Request approved" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const rejectHospitalDoctorRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const request = await hospitalRequestModel.findById(id);

    if (!request || request.hospitalId.toString() !== req.hospitalId) {
      return res.json({ success: false, message: "Request not found" });
    }
    if (request.type === "invite" || request.status !== "pending") {
      return res.json({ success: false, message: "This request can no longer be rejected" });
    }

    await rejectRequestInternal(request, { reason });

    const hospital = await hospitalModel.findById(req.hospitalId).select("name");
    await logAction({
      req,
      actorType: "hospital",
      actorId: req.hospitalId,
      actorLabel: hospital?.name || "",
      action: AUDIT_ACTIONS.HOSPITAL_REQUEST_REJECTED,
      target: { type: "doctor", id: request.doctorId },
      reason,
      status: "success",
    });

    res.json({ success: true, message: "Request rejected" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/hospital/self/invite-doctor — body: { doctorId }
const inviteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const [doctor, hospital] = await Promise.all([
      doctorModel.findById(doctorId),
      hospitalModel.findById(req.hospitalId).select("name"),
    ]);

    if (!doctor) return res.json({ success: false, message: "Doctor not found" });
    if (doctor.employmentType === "hospital" && doctor.hospitalId?.toString() === req.hospitalId) {
      return res.json({ success: false, message: "This doctor already works at your hospital" });
    }

    const existingPending = await hospitalRequestModel.findOne({
      doctorId,
      hospitalId: req.hospitalId,
      type: "invite",
      status: "pending",
    });
    if (existingPending) {
      return res.json({ success: false, message: "You already have a pending invite out to this doctor" });
    }

    await hospitalRequestModel.create({
      doctorId,
      hospitalId: req.hospitalId,
      fromHospitalId: doctor.employmentType === "hospital" ? doctor.hospitalId : null,
      type: "invite",
      status: "pending",
      requestedBy: "hospital",
    });

    await logAction({
      req,
      actorType: "hospital",
      actorId: req.hospitalId,
      actorLabel: hospital?.name || "",
      action: AUDIT_ACTIONS.HOSPITAL_INVITED_DOCTOR,
      target: { type: "doctor", id: doctorId, label: doctor.name },
      status: "success",
    });

    res.json({ success: true, message: "Invite sent" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// =====================================
// Admin-side (authAdmin — full authority, can bypass approval)
// =====================================

const assignDoctorToHospital = async (req, res) => {
  try {
    const { doctorId, hospitalId } = req.body;
    const [doctor, hospital] = await Promise.all([
      doctorModel.findById(doctorId),
      hospitalModel.findById(hospitalId).select("name"),
    ]);
    if (!doctor) return res.json({ success: false, message: "Doctor not found" });
    if (!hospital) return res.json({ success: false, message: "Hospital not found" });

    const fromHospitalId = doctor.employmentType === "hospital" ? doctor.hospitalId : null;

    await doctorModel.findByIdAndUpdate(doctorId, { hospitalId, employmentType: "hospital" });

    const assignedRequest = await hospitalRequestModel.create({
      doctorId,
      hospitalId,
      fromHospitalId,
      type: fromHospitalId ? "transfer" : "join",
      status: "approved",
      requestedBy: "admin",
      respondedAt: new Date(),
    });
    await cancelOtherPendingRequests(doctorId, assignedRequest._id);

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.ADMIN_ASSIGNED_DOCTOR,
      target: { type: "doctor", id: doctorId, label: doctor.name },
      newValue: { hospitalId, hospitalName: hospital.name },
      status: "success",
    });

    res.json({ success: true, message: "Doctor assigned to hospital" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const removeDoctorFromHospital = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) return res.json({ success: false, message: "Doctor not found" });

    const previousHospitalId = doctor.hospitalId;

    await doctorModel.findByIdAndUpdate(doctorId, { hospitalId: null, employmentType: "independent" });
    await cancelOtherPendingRequests(doctorId, null);

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.ADMIN_REMOVED_DOCTOR,
      target: { type: "doctor", id: doctorId, label: doctor.name },
      previousValue: { hospitalId: previousHospitalId },
      status: "success",
    });

    res.json({ success: true, message: "Doctor removed from hospital" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// POST /api/admin/transfer-doctor — body: { doctorId, hospitalId, force }
const transferDoctor = async (req, res) => {
  try {
    const { doctorId, hospitalId, force } = req.body;
    const [doctor, hospital] = await Promise.all([
      doctorModel.findById(doctorId),
      hospitalModel.findById(hospitalId).select("name"),
    ]);
    if (!doctor) return res.json({ success: false, message: "Doctor not found" });
    if (!hospital) return res.json({ success: false, message: "Hospital not found" });

    const fromHospitalId = doctor.employmentType === "hospital" ? doctor.hospitalId : null;
    const type = fromHospitalId ? "transfer" : "join";

    if (force) {
      await doctorModel.findByIdAndUpdate(doctorId, { hospitalId, employmentType: "hospital" });

      const forcedRequest = await hospitalRequestModel.create({
        doctorId,
        hospitalId,
        fromHospitalId,
        type,
        status: "approved",
        requestedBy: "admin",
        respondedAt: new Date(),
      });
      await cancelOtherPendingRequests(doctorId, forcedRequest._id);

      await logAction({
        req,
        actorType: "admin",
        actorLabel: req.adminEmail || "",
        action: AUDIT_ACTIONS.ADMIN_TRANSFERRED_DOCTOR,
        target: { type: "doctor", id: doctorId, label: doctor.name },
        newValue: { hospitalId, hospitalName: hospital.name, forced: true },
        status: "success",
      });

      return res.json({ success: true, message: "Doctor transferred (forced)" });
    }

    const request = await hospitalRequestModel.create({
      doctorId,
      hospitalId,
      fromHospitalId,
      type,
      status: "pending",
      requestedBy: "admin",
    });

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.HOSPITAL_REQUEST_CREATED,
      target: { type: "doctor", id: doctorId, label: doctor.name },
      newValue: { hospitalId, hospitalName: hospital.name, forced: false },
      status: "success",
    });

    res.json({ success: true, message: "Transfer request sent to hospital", request });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Admin can arbitrate any pending request, not just ones targeting a
// specific hospital — reuses the same shared mutation as the hospital's
// own approve endpoint.
const adminApproveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await hospitalRequestModel.findById(id);
    if (!request || request.status !== "pending") {
      return res.json({ success: false, message: "Request not found or already resolved" });
    }

    await approveRequestInternal(request, { respondedByType: "admin", respondedById: null });

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.HOSPITAL_REQUEST_APPROVED,
      target: { type: "doctor", id: request.doctorId },
      status: "success",
    });

    res.json({ success: true, message: "Request approved" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const adminRejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const request = await hospitalRequestModel.findById(id);
    if (!request || request.status !== "pending") {
      return res.json({ success: false, message: "Request not found or already resolved" });
    }

    await rejectRequestInternal(request, { reason });

    await logAction({
      req,
      actorType: "admin",
      actorLabel: req.adminEmail || "",
      action: AUDIT_ACTIONS.HOSPITAL_REQUEST_REJECTED,
      target: { type: "doctor", id: request.doctorId },
      reason,
      status: "success",
    });

    res.json({ success: true, message: "Request rejected" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// GET /api/admin/doctor-requests — full cross-hospital history.
const getAllDoctorRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const requests = await hospitalRequestModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate("doctorId", POPULATE_DOCTOR)
      .populate("hospitalId", POPULATE_HOSPITAL)
      .populate("fromHospitalId", POPULATE_HOSPITAL);

    res.json({ success: true, requests });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  requestHospital,
  leaveHospital,
  getMyHospitalRequests,
  cancelMyHospitalRequest,
  respondToInvite,
  getHospitalDoctorRequests,
  approveHospitalDoctorRequest,
  rejectHospitalDoctorRequest,
  inviteDoctor,
  assignDoctorToHospital,
  removeDoctorFromHospital,
  transferDoctor,
  adminApproveRequest,
  adminRejectRequest,
  getAllDoctorRequests,
};
