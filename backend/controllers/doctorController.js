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
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"

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
        const doctors = await doctorModel.find({}, { password: 0, email: 0 })
        res.json({ success: true, doctors })
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
            return res.json({ success: false, message: "Invalid Credentials" })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" })
        }

        const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })

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

        const appointmentData = await appointmentModel.findById(appointmentId).select('docId')

        if (!appointmentData || appointmentData.docId.toString() !== docId) {
            return res.json({ success: false, message: 'Cancelled Failed' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

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
        const { fees, address, available } = req.body

        await doctorModel.findByIdAndUpdate(docId, { fees, address, available })

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    changeAvailability,
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentCancel,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProffile
}