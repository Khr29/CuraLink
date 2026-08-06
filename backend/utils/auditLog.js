import auditLogModel from "../models/auditLogModel.js";

// Canonical action names. Only a subset is wired up today (login/logout,
// password change, doctor delete) — this list is intentionally broader so
// later phases can log new actions without inventing new naming.
export const AUDIT_ACTIONS = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",

  USER_REGISTERED: "USER_REGISTERED",
  USER_UPDATED: "USER_UPDATED",
  USER_STATUS_CHANGED: "USER_STATUS_CHANGED",

  DOCTOR_CREATED: "DOCTOR_CREATED",
  DOCTOR_UPDATED: "DOCTOR_UPDATED",
  DOCTOR_DELETED: "DOCTOR_DELETED",

  HOSPITAL_CREATED: "HOSPITAL_CREATED",
  HOSPITAL_UPDATED: "HOSPITAL_UPDATED",
  HOSPITAL_DELETED: "HOSPITAL_DELETED",
  HOSPITAL_STATUS_CHANGED: "HOSPITAL_STATUS_CHANGED",
};

// Records one audit entry. Never throws — a logging failure must not break
// the action being logged, so any error here is only console.error'd.
export const logAction = async ({
  req,
  actorType,
  actorId = null,
  actorLabel = "",
  action,
  target = {},
  previousValue,
  newValue,
  status = "success",
  reason = "",
}) => {
  try {
    const ip =
      req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req?.ip ||
      req?.socket?.remoteAddress ||
      "";
    const userAgent = req?.headers?.["user-agent"] || "";

    await auditLogModel.create({
      actorType,
      actorId,
      actorLabel,
      action,
      target,
      previousValue,
      newValue,
      ip,
      userAgent,
      status,
      reason,
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};
