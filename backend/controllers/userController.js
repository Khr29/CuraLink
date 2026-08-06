import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModels.js";
import { v2 as cloudinary } from "cloudinary";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import hospitalModel from "../models/hospitalModel.js";
import razorpay from "razorpay";
import { sendEmail } from "../utils/email.js";
import { logAction, AUDIT_ACTIONS } from "../utils/auditLog.js";
import { validatePasswordStrength } from "../utils/passwordSecurity.js";
import { sanitizeText, isSafeName } from "../utils/sanitize.js";
import { issueSession, revokeSession } from "../utils/session.js";
import { signAccessToken } from "../utils/tokens.js";
import { issueEmailVerificationOtp } from "./authSharedController.js";
// api to register user

const EMAIL_VERIFICATION_REQUIRED = process.env.EMAIL_VERIFICATION_REQUIRED === "true";

const registerUser = async (req, res) => {
  try {
    const { name, password, confirmPassword } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }
    if (!isSafeName(name)) {
      return res.json({ success: false, message: "Please enter a valid name" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a Valid email" });
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.json({ success: false, message: "Passwords do not match" });
    }
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return res.json({ success: false, message: strength.message });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "An account with this email already exists. Please log in instead.",
      });
    }

    //hasing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Everything below is optional — the richer registration form collects
    // it, but the API contract stays name/email/password-only-required so
    // nothing that already integrates against /register breaks.
    const {
      phone,
      dob,
      gender,
      bloodGroup,
      emergencyContactName,
      emergencyContactPhone,
      height,
      weight,
      allergies,
      chronicDiseases,
      medications,
      insuranceProvider,
      insurancePolicyNumber,
      insuranceValidTill,
      address,
    } = req.body;

    const userData = {
      name: sanitizeText(name, { maxLength: 80 }),
      email,
      password: hashedPassword,
    };

    if (EMAIL_VERIFICATION_REQUIRED) userData.emailVerified = false;

    if (phone) userData.phone = phone;
    if (dob) userData.dob = dob;
    if (gender) userData.gender = gender;
    if (bloodGroup) userData.bloodGroup = bloodGroup;
    if (emergencyContactName || emergencyContactPhone) {
      userData.emergencyContact = {
        name: sanitizeText(emergencyContactName || "", { maxLength: 80 }),
        phone: emergencyContactPhone || "",
      };
    }
    if (insuranceProvider || insurancePolicyNumber || insuranceValidTill) {
      userData.insurance = {
        provider: sanitizeText(insuranceProvider || "", { maxLength: 120 }),
        policyNumber: sanitizeText(insurancePolicyNumber || "", { maxLength: 60 }),
        validTill: insuranceValidTill || "",
      };
    }
    if (height || weight || allergies || chronicDiseases || medications) {
      userData.medical = {
        height: height || "",
        weight: weight || "",
        allergies: sanitizeText(allergies || "", { maxLength: 1000 }),
        chronicDiseases: sanitizeText(chronicDiseases || "", { maxLength: 1000 }),
        medications: sanitizeText(medications || "", { maxLength: 1000 }),
      };
    }
    if (address) {
      try {
        userData.address = JSON.parse(address);
      } catch (e) {
        // Malformed address JSON shouldn't block registration — the field
        // is optional and can be filled in later from the profile page.
      }
    }

    if (req.file) {
      const imageUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      userData.image = imageUpload.secure_url;
    }

    const newUser = new userModel(userData);
    const user = await newUser.save();

    // ✅ EMAIL SEND (ADDED)
    try {
      await sendEmail(
        email,
        "Welcome to CuraLink 🎉",
        `
                <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
                  
                  <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <div style="background:#1976d2; color:white; padding:20px; text-align:center;">
                      <h2 style="margin:0;">CuraLink</h2>
                      <p style="margin:5px 0 0;">Welcome 🎉</p>
                    </div>

                    <!-- Body -->
                    <div style="padding:20px;">
                      
                      <p style="font-size:16px;">Hi <b>${name}</b>,</p>
                      
                      <p style="color:#555;">
                        Welcome to <b>CuraLink</b>! 🎉 Your account has been successfully created.
                      </p>

                      <p style="color:#555;">
                        You can now easily book doctor appointments, manage schedules, and make secure payments.
                      </p>

                      <!-- CTA -->
                      <div style="text-align:center; margin:25px 0;">
                        <a href="#" 
                           style="background:#1976d2; color:white; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">
                           Book Appointment
                        </a>
                      </div>

                      <p style="color:#777; font-size:14px;">
                        We're here to make your healthcare experience seamless and easy 💙
                      </p>

                    </div>

                    <!-- Footer -->
                    <div style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#777;">
                      © 2026 CuraLink. All rights reserved.
                    </div>

                  </div>
                </div>
                `,
      );
    } catch (e) {
      console.log("Welcome Email failed:", e.message);
    }

    if (EMAIL_VERIFICATION_REQUIRED) {
      try {
        await issueEmailVerificationOtp("user", user);
      } catch (e) {
        console.log("Verification OTP failed:", e.message);
      }
    }

    // short-lived access token + httpOnly refresh-token cookie
    const rememberMe = req.body.rememberMe === true || req.body.rememberMe === "true";
    await issueSession({
      req,
      res,
      actorType: "user",
      actorId: user._id,
      actorLabel: user.email,
      rememberMe,
    });
    const token = signAccessToken({ id: user._id.toString() });

    await logAction({
      req,
      actorType: "user",
      actorId: user._id,
      actorLabel: user.email,
      action: AUDIT_ACTIONS.USER_REGISTERED,
      target: { type: "user", id: user._id, label: user.name },
      status: "success",
    });

    res.json({ success: true, token, emailVerificationRequired: EMAIL_VERIFICATION_REQUIRED });
  } catch (error) {
    console.log(error);
    // Race-condition fallback: two simultaneous registrations with the same
    // email can both pass the findOne check above before either saves.
    if (error.code === 11000) {
      return res.json({
        success: false,
        message: "An account with this email already exists. Please log in instead.",
      });
    }
    res.json({ success: false, message: error.message });
  }
};

//api for user login

const loginUser = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      await logAction({
        req,
        actorType: "user",
        actorLabel: email,
        action: AUDIT_ACTIONS.LOGIN,
        status: "failure",
        reason: "User does not exist",
      });
      return res.json({ success: false, message: "User does not exist" });
    }

    if (!user.isActive) {
      await logAction({
        req,
        actorType: "user",
        actorId: user._id,
        actorLabel: user.email,
        action: AUDIT_ACTIONS.LOGIN,
        status: "failure",
        reason: "Account suspended",
      });
      return res.json({ success: false, message: "This account has been suspended" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      if (EMAIL_VERIFICATION_REQUIRED && !user.emailVerified) {
        return res.json({
          success: false,
          message: "Please verify your email before logging in",
          code: "EMAIL_NOT_VERIFIED",
        });
      }

      const rememberMe = req.body.rememberMe === true || req.body.rememberMe === "true";
      await issueSession({
        req,
        res,
        actorType: "user",
        actorId: user._id,
        actorLabel: user.email,
        rememberMe,
      });
      const token = signAccessToken({ id: user._id.toString() });

      await logAction({
        req,
        actorType: "user",
        actorId: user._id,
        actorLabel: user.email,
        action: AUDIT_ACTIONS.LOGIN,
        status: "success",
      });
      res.json({ success: true, token });
    } else {
      await logAction({
        req,
        actorType: "user",
        actorId: user._id,
        actorLabel: user.email,
        action: AUDIT_ACTIONS.LOGIN,
        status: "failure",
        reason: "Invalid credentials",
      });
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// api to log out a user — revokes the refresh-token session and clears its cookie
const logoutUser = async (req, res) => {
  try {
    await revokeSession({ req, res, actorType: "user" });
    const user = await userModel.findById(req.userId).select("email");
    await logAction({
      req,
      actorType: "user",
      actorId: req.userId,
      actorLabel: user?.email || "",
      action: AUDIT_ACTIONS.LOGOUT,
      status: "success",
    });
    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to get user profile data

const getProfie = async (req, res) => {
  try {
    // const { userId } = req.body
    const userId = req.userId;
    const userData = await userModel.findById(userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to update user profile

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      name,
      phone,
      address,
      dob,
      gender,
      bloodGroup,
      emergencyContactName,
      emergencyContactPhone,
      height,
      weight,
      allergies,
      chronicDiseases,
      medications,
      insuranceProvider,
      insurancePolicyNumber,
      insuranceValidTill,
    } = req.body;
    const imageFile = req.file;
    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }
    if (!isSafeName(name)) {
      return res.json({ success: false, message: "Please enter a valid name" });
    }

    const updateData = {
      name: sanitizeText(name, { maxLength: 80 }),
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    };

    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (emergencyContactName !== undefined || emergencyContactPhone !== undefined) {
      updateData.emergencyContact = {
        name: sanitizeText(emergencyContactName || "", { maxLength: 80 }),
        phone: emergencyContactPhone || "",
      };
    }
    if (
      height !== undefined ||
      weight !== undefined ||
      allergies !== undefined ||
      chronicDiseases !== undefined ||
      medications !== undefined
    ) {
      updateData.medical = {
        height: height || "",
        weight: weight || "",
        allergies: sanitizeText(allergies || "", { maxLength: 1000 }),
        chronicDiseases: sanitizeText(chronicDiseases || "", { maxLength: 1000 }),
        medications: sanitizeText(medications || "", { maxLength: 1000 }),
      };
    }
    if (
      insuranceProvider !== undefined ||
      insurancePolicyNumber !== undefined ||
      insuranceValidTill !== undefined
    ) {
      updateData.insurance = {
        provider: sanitizeText(insuranceProvider || "", { maxLength: 120 }),
        policyNumber: sanitizeText(insurancePolicyNumber || "", { maxLength: 60 }),
        validTill: insuranceValidTill || "",
      };
    }

    await userModel.findByIdAndUpdate(userId, updateData);

    if (imageFile) {
      //ulload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageUrl });
    }

    await logAction({
      req,
      actorType: "user",
      actorId: userId,
      actorLabel: name,
      action: AUDIT_ACTIONS.USER_UPDATED,
      target: { type: "user", id: userId, label: name },
      status: "success",
    });

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to book appointment

// Backend is authoritative for booking rules — the frontend's slot picker
// only generates 10:00-21:00 slots, but a direct API call must be blocked
// too. Window is intentionally a bit wider than the picker's to tolerate
// locale-formatted time strings without false-rejecting real bookings.
const WORKING_HOURS_START = 7;
const WORKING_HOURS_END = 21;
const MAX_ADVANCE_BOOKING_DAYS = 90;

// slotDate is this codebase's "D_M_YYYY" convention (see getHospitalSelfDashboard).
const parseSlotDate = (slotDate) => {
  if (typeof slotDate !== "string") return null;
  const parts = slotDate.split("_");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Accepts both "10:00 AM" and 24h "14:00" — whichever the client's locale
// produced (see frontend Appointments.jsx toLocaleTimeString call).
const parseSlotTime = (slotTime) => {
  if (typeof slotTime !== "string") return null;
  const trimmed = slotTime.trim();
  let match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    return { hour, minute };
  }
  match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match) return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) };
  return null;
};

const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.userId;

    if (!docId || !slotDate || !slotTime) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }
    if (!docData.available) {
      return res.json({ success: false, message: "Doctor not available" });
    }
    if (docData.verificationStatus === "rejected") {
      return res.json({ success: false, message: "This doctor is not currently accepting bookings" });
    }

    if (docData.hospitalId) {
      const hospitalData = await hospitalModel
        .findById(docData.hospitalId)
        .select("active verificationStatus");
      if (!hospitalData || !hospitalData.active || hospitalData.verificationStatus === "rejected") {
        return res.json({ success: false, message: "This hospital is not currently accepting bookings" });
      }
    }

    const dateOnly = parseSlotDate(slotDate);
    if (!dateOnly) {
      return res.json({ success: false, message: "Invalid appointment date" });
    }
    const now = new Date();
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateOnly < todayOnly) {
      return res.json({ success: false, message: "Cannot book an appointment in the past" });
    }
    const maxAdvance = new Date(todayOnly);
    maxAdvance.setDate(maxAdvance.getDate() + MAX_ADVANCE_BOOKING_DAYS);
    if (dateOnly > maxAdvance) {
      return res.json({ success: false, message: "This date is too far in advance to book" });
    }

    const time = parseSlotTime(slotTime);
    if (time) {
      if (time.hour < WORKING_HOURS_START || time.hour >= WORKING_HOURS_END) {
        return res.json({ success: false, message: "Selected time is outside working hours" });
      }
      const appointmentDateTime = new Date(dateOnly);
      appointmentDateTime.setHours(time.hour, time.minute, 0, 0);
      if (appointmentDateTime < now) {
        return res.json({ success: false, message: "This slot has already passed" });
      }
    }

    // Atomic reservation: the filter only matches while the slot is still
    // free, so two concurrent requests for the same slot can't both win
    // (fixes a read-then-write race in the previous implementation).
    const reserved = await doctorModel.findOneAndUpdate(
      { _id: docId, [`slots_booked.${slotDate}`]: { $ne: slotTime } },
      { $push: { [`slots_booked.${slotDate}`]: slotTime } },
      { new: true }
    );
    if (!reserved) {
      return res.json({ success: false, message: "Slot not available" });
    }

    const userData = await userModel.findById(userId).select("-password");
    const docDataSnapshot = docData.toObject();
    delete docDataSnapshot.slots_booked;
    const appointmentData = {
      userId,
      docId,

      hospitalId: docData.hospitalId,

      userData,
      docData: docDataSnapshot,

      amount: docData.fees,

      slotTime,
      slotDate,

      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    try {
      await newAppointment.save();
    } catch (saveError) {
      // The slot was already reserved atomically above — if the appointment
      // itself fails to save, release it instead of leaking a permanently
      // "booked" slot with no appointment behind it.
      await doctorModel.findByIdAndUpdate(docId, {
        $pull: { [`slots_booked.${slotDate}`]: slotTime },
      });
      throw saveError;
    }

    // ✅ EMAIL SEND (ADDED)
    try {
      await sendEmail(
        userData.email,
        "Appointment Confirmed ✅",
        `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
          
          <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background:#4CAF50; color:white; padding:20px; text-align:center;">
              <h2 style="margin:0;">CuraLink</h2>
              <p style="margin:5px 0 0;">Appointment Confirmed 🎉</p>
            </div>

            <!-- Body -->
            <div style="padding:20px;">
              
              <p style="font-size:16px;">Hi <b>${userData.name}</b>,</p>
              
              <p style="color:#555;">
                Your appointment has been successfully booked. Here are your details:
              </p>

              <!-- Card -->
              <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin:20px 0;">
                <p><b>👨‍⚕️ Doctor:</b> ${docData.name}</p>
                <p><b>📅 Date:</b> ${slotDate}</p>
                <p><b>⏰ Time:</b> ${slotTime}</p>
                <p><b>💰 Fees:</b> ₹${docData.fees}</p>
              </div>

              <p style="color:#555;">
                Please arrive 10 minutes before your scheduled time.
              </p>

              <!-- Button -->
              <div style="text-align:center; margin:25px 0;">
                <a href="#" 
                   style="background:#4CAF50; color:white; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">
                   View Appointment
                </a>
              </div>

              <p style="color:#777; font-size:14px;">
                Need help? Contact our support anytime.
              </p>

            </div>

            <!-- Footer -->
            <div style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#777;">
              © 2026 CuraLink. All rights reserved.
            </div>

          </div>
        </div>
        `,
      );
    } catch (e) {
      console.log("Email failed but appointment booked");
    }

    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to get user appointment for frontend my-appoingmntpage

const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;

    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//aapt to cancel appointmet

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const userId = req.userId;
    const appointmentData = await appointmentModel.findById(appointmentId);

    //verify appointment user
    // (ObjectId vs string must be compared via .toString() — `!==` on an
    // ObjectId object and a string is always true, which would reject the
    // rightful owner too.)
    if (!appointmentData || appointmentData.userId.toString() !== userId) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });
    //releasing doct slot

    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);
    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime,
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    // email notiication
    try {
      await sendEmail(
        appointmentData.userData.email,
        "Appointment Cancelled ❌",
        `
                <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:20px">
                  <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:10px">
                    
                    <h2 style="color:#e53935;">Appointment Cancelled ❌</h2>
                    
                    <p>Hi <b>${appointmentData.userData.name}</b>,</p>
                    
                    <p>Your appointment has been <b>successfully cancelled</b>.</p>

                    <hr/>

                    <h3>📋 Appointment Details</h3>
                    <p><b>Doctor:</b> ${appointmentData.docData.name}</p>
                    <p><b>Date:</b> ${slotDate}</p>
                    <p><b>Time:</b> ${slotTime}</p>

                    <hr/>

                    <p style="color:#555;">
                      If you made any payment, the refund  will be processed shortly.
                    </p>

                    <p>We hope to serve you again soon 💙</p>

                    <br/>
                    <p style="font-size:12px; color:gray;">
                      — Team CuraLink
                    </p>
                  </div>
                </div>
                `,
      );
    } catch (e) {
      console.log("Cancel Email failed:", e.message);
    }
    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//API FOR RAZORPAAY

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointment Cancelled or not found",
      });
    }

    //create option

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };
    //creation of an order
    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//api to verify razorpay
// const verifyRazorpay = async (req, res) => {
//     try {
//         const { razorpay_order_id } = req.body
//         const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
//         if (orderInfo.status === "paid") {
//             await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
//             res.json({ success: true, message: "Payment Successful" })
//         } else {
//             res.json({ success: false, message: "Payment failed" })
//         }
//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }

// }
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });

      // ✅ GET APPOINTMENT DATA (for email)
      const appointment = await appointmentModel.findById(orderInfo.receipt);

      // ✅ EMAIL SEND (ADDED)
      try {
        await sendEmail(
          appointment.userData.email,
          "Payment Successful 💳",
          `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
          
          <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background:#2e7d32; color:white; padding:20px; text-align:center;">
              <h2 style="margin:0;">CuraLink</h2>
              <p style="margin:5px 0 0;">Payment Successful ✅</p>
            </div>

            <!-- Body -->
            <div style="padding:20px;">
              
              <p style="font-size:16px;">Hi <b>${appointment.userData.name}</b>,</p>
              
              <p style="color:#555;">
                Your payment has been successfully processed. Here are your appointment details:
              </p>

              <!-- Card -->
              <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin:20px 0;">
                <p><b>👨‍⚕️ Doctor:</b> ${appointment.docData.name}</p>
                <p><b>📅 Date:</b> ${appointment.slotDate}</p>
                <p><b>⏰ Time:</b> ${appointment.slotTime}</p>
                <p><b>💰 Amount Paid:</b> ₹${appointment.amount}</p>
                <p><b>📌 Status:</b> <span style="color:green;">Paid ✅</span></p>
              </div>

              <p style="color:#555;">
                Please keep this email for your records. We look forward to serving you.
              </p>

              <!-- Button -->
              <div style="text-align:center; margin:25px 0;">
                <a href="#" 
                   style="background:#2e7d32; color:white; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">
                   View Appointment
                </a>
              </div>

              <p style="color:#777; font-size:14px;">
                Need help? Contact our support anytime.
              </p>

            </div>

            <!-- Footer -->
            <div style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#777;">
              © 2026 CuraLink. All rights reserved.
            </div>

          </div>
        </div>
        `,
        );
      } catch (e) {
        console.log("Email failed but payment successful");
      }

      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  getProfie,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
};
