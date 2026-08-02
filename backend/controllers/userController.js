import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModels.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import appointmentModel from '../models/appointmentModel.js'
import doctorModel from "../models/doctorModel.js";
import razorpay from 'razorpay'
import { sendEmail } from "../utils/email.js";
// api to register user 

const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body

        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing Details" })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a Valid email" })

        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a Strong password" })
        }

        //hasing
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

          // ✅ EMAIL SEND (ADDED)
        try {
            await sendEmail(
                email,
                "Welcome to MediLink 🎉",
                `
                <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px;">
                  
                  <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <div style="background:#1976d2; color:white; padding:20px; text-align:center;">
                      <h2 style="margin:0;">MediLink</h2>
                      <p style="margin:5px 0 0;">Welcome 🎉</p>
                    </div>

                    <!-- Body -->
                    <div style="padding:20px;">
                      
                      <p style="font-size:16px;">Hi <b>${name}</b>,</p>
                      
                      <p style="color:#555;">
                        Welcome to <b>MediLink</b>! 🎉 Your account has been successfully created.
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
                      © 2026 MediLink. All rights reserved.
                    </div>

                  </div>
                </div>
                `
            )
        } catch (e) {
            console.log("Welcome Email failed:", e.message)
        }

        //create token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api for user login

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid Credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

//api to get user profile data 

const getProfie = async (req, res) => {
    try {
        // const { userId } = req.body
        const userId = req.userId
        const userData = await userModel.findById(userId).select('-password')
        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api to update user profile

const updateProfile = async (req, res) => {
    try {
        const userId = req.userId
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file
        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }
        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {
            //ulload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' })
            const imageUrl = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageUrl })
        }
        res.json({ success: true, message: "Profile Updated" })
    } catch (error) {

    }
}

//api to book appointment

const bookAppointment = async (req, res) => {
    try {
        //const {userId, docId, slotDate, slotTime} = req.body
        const { docId, slotDate, slotTime } = req.body
        const userId = req.userId

        const docData = await doctorModel.findById(docId).select('-password')

        if (!docData.available) {
            return res.json({ success: false, message: "Doctor not available" })
        }
        let slots_booked = docData.slots_booked

        //CHECK FOR SLOT AVAILABILTY

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: "Slot not available" })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        }
        else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')
        delete docData.slots_booked
        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

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
              <h2 style="margin:0;">MediLink</h2>
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
              © 2026 MediLink. All rights reserved.
            </div>

          </div>
        </div>
        `
            )

        } catch (e) {
            console.log("Email failed but appointment booked")
        }

        //save new slots data in docData 
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        res.json({ success: true, message: 'Appointment Booked' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api to get user appointment for frontend my-appoingmntpage

const listAppointment = async (req, res) => {
    try {

        const userId = req.userId

        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//aapt to cancel appointmet 

const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body

        const userId = req.userId
        const appointmentData = await appointmentModel.findById(appointmentId)

        //verify appointment user
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized Action" })
        }
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
        //releasing doct slot

        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)
        let slots_booked = doctorData.slots_booked
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
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
                      — Team MediLink
                    </p>
                  </div>
                </div>
                `
            )
        } catch (e) {
            console.log("Cancel Email failed:", e.message)
        }
        res.json({ success: true, message: "Appointment cancelled" })
    } catch (error) {

        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

//API FOR RAZORPAAY

const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment Cancelled or not found" })
        }

        //create option 

        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }
        //creation of an order
        const order = await razorpayInstance.orders.create(options)
        res.json({ success: true, order })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

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
        const { razorpay_order_id } = req.body

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === "paid") {

            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })

            // ✅ GET APPOINTMENT DATA (for email)
            const appointment = await appointmentModel.findById(orderInfo.receipt)

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
              <h2 style="margin:0;">MediLink</h2>
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
              © 2026 MediLink. All rights reserved.
            </div>

          </div>
        </div>
        `
                )
            } catch (e) {
                console.log("Email failed but payment successful")
            }

            res.json({ success: true, message: "Payment Successful" })

        } else {
            res.json({ success: false, message: "Payment failed" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



export { registerUser, loginUser, getProfie, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay }