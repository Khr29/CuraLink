import bcrypt from "bcrypt";
import { ACTOR_MODELS } from "../utils/actorRegistry.js";
import otpModel from "../models/otpModel.js";
import refreshTokenModel from "../models/refreshTokenModel.js";
import { generateOtp, hashOtp, OTP_TTL_MS, OTP_MAX_ATTEMPTS } from "../utils/otp.js";
import { sendEmail } from "../utils/email.js";
import { otpEmailHtml, passwordChangedEmailHtml } from "../utils/securityEmails.js";
import { validatePasswordStrength, applyNewPassword, isPasswordReused } from "../utils/passwordSecurity.js";
import { rotateSession, revokeAllSessions } from "../utils/session.js";
import { hashToken, signAccessToken } from "../utils/tokens.js";
import { REFRESH_COOKIE_NAMES } from "../utils/cookies.js";
import { logAction, AUDIT_ACTIONS } from "../utils/auditLog.js";

// ============================================================
// Factories — one implementation per concern, parameterized by
// actorType (+ how to read the authenticated actor's id off req) so the
// four panels (user/doctor/hospital/admin) don't each reimplement the same
// refresh/session/OTP logic. Mounted into the existing route files.
// ============================================================

const accessPayloadFor = (actorType, actor) =>
  actorType === "admin" ? { email: actor.email } : { id: actor._id.toString() };

// POST — public, reads the httpOnly refresh cookie, rotates it, issues a
// new short-lived access token. This is what "Automatic Token Refresh"
// calls silently in the background.
export const makeRefreshTokenHandler = (actorType) => async (req, res) => {
  try {
    const session = await rotateSession({ req, res, actorType });
    if (!session) {
      return res.status(401).json({ success: false, message: "Session expired, please login again" });
    }
    const payload =
      actorType === "admin"
        ? { email: session.actorLabel, actorType }
        : { id: session.actorId?.toString(), actorType };
    const token = signAccessToken(payload);
    res.json({ success: true, token });
  } catch (error) {
    res.status(401).json({ success: false, message: "Session expired, please login again" });
  }
};

// POST — authenticated. Revokes every active session for this actor
// (including the one making the request) — "Logout All Sessions".
export const makeLogoutAllHandler = (actorType, getActorId) => async (req, res) => {
  try {
    const actorId = getActorId(req);
    await revokeAllSessions({ actorType, actorId });
    res.clearCookie(REFRESH_COOKIE_NAMES[actorType], { path: "/" });
    res.json({ success: true, message: "Logged out of all sessions" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// GET — authenticated. Lists this actor's active sessions (device/IP/login
// time) for the Session Management screen, flagging which one is "current".
export const makeListSessionsHandler = (actorType, getActorId) => async (req, res) => {
  try {
    const actorId = getActorId(req);
    const raw = req.cookies?.[REFRESH_COOKIE_NAMES[actorType]];
    let currentHash = null;
    if (raw) {
      const idx = raw.indexOf(":");
      if (idx !== -1 && raw.slice(0, idx) === actorType) {
        currentHash = hashToken(raw.slice(idx + 1));
      }
    }

    const sessions = await refreshTokenModel
      .find({ actorType, actorId, revokedAt: null, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      sessions: sessions.map(({ tokenHash, ...s }) => ({
        ...s,
        isCurrent: tokenHash === currentHash,
      })),
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// DELETE — authenticated. Revokes a single session by id ("Logout Current
// Device" for a device other than the one you're on).
export const makeRevokeSessionHandler = (actorType, getActorId) => async (req, res) => {
  try {
    const actorId = getActorId(req);
    const { sessionId } = req.params;
    const session = await refreshTokenModel.findById(sessionId);
    if (
      !session ||
      session.actorType !== actorType ||
      String(session.actorId) !== String(actorId)
    ) {
      return res.json({ success: false, message: "Session not found" });
    }
    session.revokedAt = new Date();
    await session.save();
    res.json({ success: true, message: "Session revoked" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST — authenticated. Current-password-verified change, used by the
// "Change Password" page. Invalidates every session (this one included —
// the client is expected to redirect to login) per the spec's requirement
// that a password change invalidates old sessions.
export const makeChangePasswordHandler = (actorType, getActorId) => async (req, res) => {
  try {
    const Model = ACTOR_MODELS[actorType];
    const actorId = getActorId(req);
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

    const actor = await Model.findById(actorId);
    if (!actor) return res.json({ success: false, message: "Not found" });

    if (actor.password) {
      const isMatch = await bcrypt.compare(currentPassword || "", actor.password);
      if (!isMatch) {
        return res.json({ success: false, message: "Current password is incorrect" });
      }
    }

    if (await isPasswordReused(actor, newPassword)) {
      return res.json({
        success: false,
        message: "Please choose a password you haven't used recently",
      });
    }

    await applyNewPassword(actor, newPassword);
    await revokeAllSessions({ actorType, actorId: actor._id });

    await logAction({
      req,
      actorType,
      actorId: actor._id,
      actorLabel: actor.email,
      action: AUDIT_ACTIONS.PASSWORD_CHANGED,
      status: "success",
    });

    try {
      await sendEmail(actor.email, "Your CuraLink password was changed", passwordChangedEmailHtml(actor.name || ""));
    } catch (e) {
      // Notification failure must never block the password change itself.
    }

    res.json({ success: true, message: "Password updated. Please log in again." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST — public. Always responds success (no user enumeration) but only
// actually sends an OTP email when the account exists.
export const makeForgotPasswordHandler = (actorType) => async (req, res) => {
  try {
    const Model = ACTOR_MODELS[actorType];
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.json({ success: false, message: "Email is required" });

    const actor = await Model.findOne({ email });
    if (actor) {
      const otp = generateOtp();
      await otpModel.create({
        actorType,
        actorId: actor._id,
        email,
        purpose: "password_reset",
        codeHash: hashOtp(otp),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      });
      try {
        await sendEmail(
          email,
          "CuraLink Password Reset Code",
          otpEmailHtml(actor.name || "", otp, "Reset your password")
        );
      } catch (e) {
        // swallow — response stays generic either way
      }
    }

    res.json({
      success: true,
      message: "If an account exists for this email, a reset code has been sent.",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST — public, OTP-verified. Sets the new password and force-signs-out
// every existing session (the account may have been compromised).
export const makeResetPasswordHandler = (actorType) => async (req, res) => {
  try {
    const Model = ACTOR_MODELS[actorType];
    const email = req.body.email?.trim().toLowerCase();
    const { otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.json({ success: false, message: "Missing details" });
    }
    if (newPassword !== confirmPassword) {
      return res.json({ success: false, message: "Passwords do not match" });
    }
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return res.json({ success: false, message: strength.message });
    }

    const otpRecord = await otpModel
      .findOne({ actorType, email, purpose: "password_reset", consumedAt: null })
      .sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.json({ success: false, message: "Code expired or invalid, please request a new one" });
    }
    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      return res.json({ success: false, message: "Too many attempts, please request a new code" });
    }
    if (hashOtp(otp) !== otpRecord.codeHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.json({ success: false, message: "Invalid code" });
    }

    const actor = await Model.findById(otpRecord.actorId);
    if (!actor) return res.json({ success: false, message: "Account not found" });

    if (await isPasswordReused(actor, newPassword)) {
      return res.json({
        success: false,
        message: "Please choose a password you haven't used recently",
      });
    }

    await applyNewPassword(actor, newPassword);
    otpRecord.consumedAt = new Date();
    await otpRecord.save();
    await revokeAllSessions({ actorType, actorId: actor._id });

    await logAction({
      req,
      actorType,
      actorId: actor._id,
      actorLabel: actor.email,
      action: AUDIT_ACTIONS.PASSWORD_CHANGED,
      status: "success",
      reason: "Password reset via OTP",
    });

    try {
      await sendEmail(actor.email, "Your CuraLink password was reset", passwordChangedEmailHtml(actor.name || ""));
    } catch (e) {}

    res.json({ success: true, message: "Password reset successful. Please log in." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Shared by the register flows (send immediately on signup when
// EMAIL_VERIFICATION_REQUIRED=true) and the resend endpoint below.
export const issueEmailVerificationOtp = async (actorType, actor) => {
  const otp = generateOtp();
  await otpModel.create({
    actorType,
    actorId: actor._id,
    email: actor.email,
    purpose: "email_verification",
    codeHash: hashOtp(otp),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });
  await sendEmail(
    actor.email,
    "Verify your CuraLink email",
    otpEmailHtml(actor.name || "", otp, "Verify your email")
  );
};

// POST — authenticated. Sends (or resends) the email-verification OTP.
export const makeSendVerificationOtpHandler = (actorType, getActorId) => async (req, res) => {
  try {
    const Model = ACTOR_MODELS[actorType];
    const actor = await Model.findById(getActorId(req));
    if (!actor) return res.json({ success: false, message: "Not found" });
    if (actor.emailVerified) {
      return res.json({ success: true, message: "Email already verified" });
    }
    await issueEmailVerificationOtp(actorType, actor);
    res.json({ success: true, message: "Verification code sent" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// POST — authenticated, OTP-verified. Marks the account's email as verified.
export const makeVerifyEmailHandler = (actorType, getActorId) => async (req, res) => {
  try {
    const Model = ACTOR_MODELS[actorType];
    const actorId = getActorId(req);
    const { otp } = req.body;
    if (!otp) return res.json({ success: false, message: "Code is required" });

    const otpRecord = await otpModel
      .findOne({ actorType, actorId, purpose: "email_verification", consumedAt: null })
      .sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.json({ success: false, message: "Code expired, please request a new one" });
    }
    if (otpRecord.attempts >= OTP_MAX_ATTEMPTS) {
      return res.json({ success: false, message: "Too many attempts, please request a new code" });
    }
    if (hashOtp(otp) !== otpRecord.codeHash) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.json({ success: false, message: "Invalid code" });
    }

    otpRecord.consumedAt = new Date();
    await otpRecord.save();
    await Model.findByIdAndUpdate(actorId, { emailVerified: true });

    res.json({ success: true, message: "Email verified" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export { accessPayloadFor };
