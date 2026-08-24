// import doctorModel from "../models/doctorModel.js"
// import bcrypt from 'bcrypt'
// import jwt from 'jsonwebtoken'
// import appointmentModel from "../models/appointmentModel.js"


// const changeAvailability = async (req, res) => {
//     try {
//         const { docId } = req.body

//         const docData = await doctorModel.findById(docId)
//         await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
//         res.json({ success: true, message: "Availability Changed" })

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// const doctorList = async (req, res) => {
//     try {
//         const doctors = await doctorModel.find({}).select(['-password', '-email'])
//         res.json({ success: true, doctors })
//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// //api for doctor login
// const loginDoctor = async (req, res) => {
//     try {
//         const { email, password } = req.body
//         const doctor = await doctorModel.findOne({ email })
//         if (!doctor) {
//             return res.json({ success: false, message: "Invalid Credentials" })
//         }
//         const isMatch = await bcrypt.compare(password, doctor.password)
//         if (isMatch) {
//             const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
//             res.json({ success: true, token })

//         } else {
//             res.json({ success: false, message: "Invalid Credentials" })
//         }
//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// //api to get doctor appointment or doctor panel
// const appointmentsDoctor = async (req, res) => {
//     try {
//         // const {docId} = req.body
//         const docId = req.docId
//         const appointments = await appointmentModel.find({ docId })
//         res.json({ success: true, appointments })
//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// //API TO MARK APPOINTMENT COMPLETE 
// const appointmentComplete = async (req, res) => {
//     try {
//         const docId = req.docId
//         const { appointmentId } = req.body
//         const appointmentData = await appointmentModel.findById(appointmentId)
//         if (appointmentData && appointmentData.docId === docId) {
//             await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
//             return res.json({ success: false, message: 'Appointment Completed' })
//         } else {
//             return res.json({ success: false, message: 'Mark Failed' })
//         }
//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// //API TO CANCEL APPOINTMENT FOR DOCTOR PANEL
// const appointmentCancel = async (req, res) => {
//     try {
//         const docId = req.docId
//         const { appointmentId } = req.body
//         const appointmentData = await appointmentModel.findById(appointmentId)
//         if (appointmentData && appointmentData.docId === docId) {
//             await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
//             return res.json({ success: false, message: 'Appointment Cancelled' })
//         } else {
//             return res.json({ success: false, message: 'Cancelled Failed' })
//         }
//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// const doctorDashboard = async (req, res) => {
//     try {
//         const docId = req.docId
//         const appointments = await appointmentModel.find({ docId })
//         let earnings = 0
//         appointments.map((item) => {
//             if (item.isCompleted || item.payment) {
//                 earnings += item.amount
//             }
//         })
//         let patients = []
//         appointments.map((item) => {
//             if (!patients.includes(item.userId)) {
//                 patients.push(item.userId)
//             }
//         })

//         const dashData = {
//             earnings,
//             appointments: appointments.length,
//             patients: patients.length,
//             latestAppointments: appointments.reverse().slice(0, 5)
//         }
//         res.json({ success: true, dashData })
//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// //api to get doctor proile
// const doctorProfile = async (req, res) => {
//     try {
//         const docId = req.docId
//         const profileData = await doctorModel.findById(docId).select('-password')
//         res.json({ success: true, profileData })
//     } catch (error) {
//          console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// //API TO UPDATE DOCTOR PROFILE DATA

// const updateDoctorProffile =async(req,res) =>{
//     try {
//          const docId = req.docId
//         const { fees, address,available} = req.body
//         await doctorModel.findByIdAndUpdate(docId,{fees,address,available})
//         res.json({ success: true, message:'profile Updated' })
//     } catch (error) {
//           console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }
// export { changeAvailability, doctorList, loginDoctor, appointmentsDoctor, appointmentCancel, appointmentComplete, doctorDashboard,doctorProfile,updateDoctorProffile }

import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import appointmentModel from "../models/appointmentModel.js"
import doctorScheduleModel from "../models/doctorScheduleModel.js"
import { computeAvailableSlots } from "../utils/slotGenerator.js"
import { nowIST } from "../utils/istTime.js"
import { v2 as cloudinary } from "cloudinary"
import { logAction, AUDIT_ACTIONS } from "../utils/auditLog.js"
import { issueSession, revokeSession } from "../utils/session.js"
import { signAccessToken } from "../utils/tokens.js"
import { sanitizeText, isSafeName } from "../utils/sanitize.js"

// Change Availability
const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body

        const docData = await doctorModel.findById(docId).select('available')
        if (!docData) {
            return res.json({ success: false, message: "Doctor not found" })
        }

        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: "Availability Changed" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Doctor List
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}, { password: 0, email: 0 }).populate("hospitalId", "name")

        // `available` (below) is a manual on/off toggle (see changeAvailability
        // above) — it says nothing about whether TODAY specifically has open
        // slots. Cards/lists used to show it as "Available" on its own, which
        // could disagree with the booking page's "No Slots Available" (same
        // schedule-derived source of truth as utils/slotGenerator.js /
        // scheduleController.getAvailableSlots). Compute that same signal here,
        // batched, so every doctor-list consumer can show one honest badge.
        const schedules = await doctorScheduleModel
            .find({ doctorId: { $in: doctors.map((d) => d._id) } })
            .lean()
        const scheduleMap = new Map(
            schedules.map((s) => [`${s.doctorId}:${s.hospitalId || ""}`, s])
        )

        const now = nowIST()
        const todayKey = `${now.getUTCDate()}_${now.getUTCMonth() + 1}_${now.getUTCFullYear()}`

        const doctorsWithAvailability = doctors.map((doc) => {
            const obj = doc.toObject()
            const scheduleKey = `${doc._id}:${doc.hospitalId?._id || doc.hospitalId || ""}`
            const schedule = scheduleMap.get(scheduleKey) || null
            const bookedToday = doc.slots_booked?.[todayKey] || []
            // Left as a plain count (not collapsed into one boolean) so
            // consumers can distinguish "toggled off" from "toggled on but
            // no slots left today" — same 3-state distinction Appointments.jsx
            // already draws for the profile-page badge.
            obj.todaySlotCount = computeAvailableSlots(schedule, now, bookedToday, now).length
            return obj
        })

        res.json({ success: true, doctors: doctorsWithAvailability })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Login Doctor
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body

        const doctor = await doctorModel.findOne({ email })
        if (!doctor) {
            await logAction({
                req,
                actorType: "doctor",
                actorLabel: email || "",
                action: AUDIT_ACTIONS.LOGIN,
                status: "failure",
                reason: "Invalid credentials",
            })
            return res.json({ success: false, message: "Invalid Credentials" })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (!isMatch) {
            await logAction({
                req,
                actorType: "doctor",
                actorId: doctor._id,
                actorLabel: doctor.email,
                action: AUDIT_ACTIONS.LOGIN,
                status: "failure",
                reason: "Invalid credentials",
            })
            return res.json({ success: false, message: "Invalid Credentials" })
        }

        const rememberMe = req.body.rememberMe === true || req.body.rememberMe === "true"
        await issueSession({
            req,
            res,
            actorType: "doctor",
            actorId: doctor._id,
            actorLabel: doctor.email,
            rememberMe,
        })
        const token = signAccessToken({ id: doctor._id.toString() })

        await logAction({
            req,
            actorType: "doctor",
            actorId: doctor._id,
            actorLabel: doctor.email,
            action: AUDIT_ACTIONS.LOGIN,
            status: "success",
        })

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Logout Doctor — revokes the refresh-token session and clears its cookie
const logoutDoctor = async (req, res) => {
    try {
        await revokeSession({ req, res, actorType: "doctor" })
        const doctor = await doctorModel.findById(req.docId).select("email")
        await logAction({
            req,
            actorType: "doctor",
            actorId: req.docId,
            actorLabel: doctor?.email || "",
            action: AUDIT_ACTIONS.LOGOUT,
            status: "success",
        })
        res.json({ success: true, message: "Logged out" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Doctor Appointments
const appointmentsDoctor = async (req, res) => {
    try {
        const docId = req.docId

        const appointments = await appointmentModel.find({ docId })
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Complete Appointment
const appointmentComplete = async (req, res) => {
    try {
        const docId = req.docId
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId).select('docId')

        if (!appointmentData || appointmentData.docId.toString() !== docId) {
            return res.json({ success: false, message: 'Mark Failed' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })

        await logAction({
            req,
            actorType: "doctor",
            actorId: docId,
            action: AUDIT_ACTIONS.APPOINTMENT_UPDATED,
            target: { type: "appointment", id: appointmentId, label: "isCompleted -> true" },
            status: "success",
        })

        res.json({ success: true, message: 'Appointment Completed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Cancel Appointment
const appointmentCancel = async (req, res) => {
    try {
        const docId = req.docId
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId).select('docId slotDate slotTime')

        if (!appointmentData || appointmentData.docId.toString() !== docId) {
            return res.json({ success: false, message: 'Cancelled Failed' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        // Release the slot — previously only the appointment was marked
        // cancelled and the slot stayed permanently booked when a doctor
        // (rather than the patient) cancelled it.
        await doctorModel.findByIdAndUpdate(docId, {
            $pull: { [`slots_booked.${appointmentData.slotDate}`]: appointmentData.slotTime },
        })

        await logAction({
            req,
            actorType: "doctor",
            actorId: docId,
            action: AUDIT_ACTIONS.APPOINTMENT_UPDATED,
            target: { type: "appointment", id: appointmentId, label: "cancelled -> true" },
            status: "success",
        })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Dashboard
const doctorDashboard = async (req, res) => {
    try {
        const docId = req.docId

        const appointments = await appointmentModel.find({ docId })

        let earnings = 0
        const patientSet = new Set()

        for (const item of appointments) {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
            patientSet.add(item.userId.toString())
        }

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patientSet.size,
            latestAppointments: [...appointments].reverse().slice(0, 5)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Doctor Profile
const doctorProfile = async (req, res) => {
    try {
        const docId = req.docId

        const profileData = await doctorModel.findById(docId, { password: 0 })
        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update Profile
const updateDoctorProffile = async (req, res) => {
    try {
        const docId = req.docId
        const {
            name, phone, about, degree, licenseNumber, experience, speciality,
            workingHours, languages, fees, address, available
        } = req.body

        const updateData = {}

        if (name !== undefined) {
            if (!isSafeName(name)) {
                return res.json({ success: false, message: 'Please enter a valid name' })
            }
            updateData.name = sanitizeText(name, { maxLength: 80 })
        }
        if (phone !== undefined) updateData.phone = sanitizeText(phone, { maxLength: 20 })
        if (about !== undefined) updateData.about = sanitizeText(about, { maxLength: 2000 })
        if (degree !== undefined) updateData.degree = sanitizeText(degree, { maxLength: 200 })
        if (licenseNumber !== undefined) updateData.licenseNumber = sanitizeText(licenseNumber, { maxLength: 100 })
        if (experience !== undefined) updateData.experience = sanitizeText(experience, { maxLength: 40 })
        if (speciality !== undefined) updateData.speciality = sanitizeText(speciality, { maxLength: 100 })
        if (workingHours !== undefined) updateData.workingHours = sanitizeText(workingHours, { maxLength: 200 })
        if (languages !== undefined) {
            try {
                const parsed = typeof languages === 'string' ? JSON.parse(languages) : languages
                if (Array.isArray(parsed)) {
                    updateData.languages = parsed
                        .map((l) => sanitizeText(String(l), { maxLength: 40 }))
                        .filter(Boolean)
                        .slice(0, 20)
                }
            } catch (e) {
                // ignore malformed languages payload, leave unchanged
            }
        }
        if (fees !== undefined) updateData.fees = fees
        if (address !== undefined) updateData.address = typeof address === 'string' ? JSON.parse(address) : address
        if (available !== undefined) updateData.available = available

        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' })
            updateData.image = imageUpload.secure_url
        }

        await doctorModel.findByIdAndUpdate(docId, updateData)

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Upload / replace the doctor's signature — a distinct image from the
// profile photo, used only on finalized prescription PDFs. authDoctor runs
// before this (see doctorRoute.js), so req.docId is always the signature's
// own owner.
const uploadDoctorSignature = async (req, res) => {
    try {
        const docId = req.docId

        if (!req.file) {
            return res.json({ success: false, message: 'No signature image provided' })
        }

        const signatureUpload = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' })
        await doctorModel.findByIdAndUpdate(docId, { signature: signatureUpload.secure_url })

        res.json({ success: true, message: 'Signature updated', signature: signatureUpload.secure_url })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Remove the doctor's stored signature. Prescription PDFs fall back to the
// existing honest digital-issuance wording when none is set.
const removeDoctorSignature = async (req, res) => {
    try {
        const docId = req.docId
        await doctorModel.findByIdAndUpdate(docId, { signature: '' })
        res.json({ success: true, message: 'Signature removed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    changeAvailability,
    doctorList,
    loginDoctor,
    logoutDoctor,
    appointmentsDoctor,
    appointmentCancel,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProffile,
    uploadDoctorSignature,
    removeDoctorSignature
}