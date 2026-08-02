// import validator from "validator"
// import bcrypt from 'bcrypt'
// import { v2 as cloudinary } from 'cloudinary'
// import doctorModel from "../models/doctorModel.js"
// import jwt from "jsonwebtoken";
// import appointmentModel from "../models/appointmentModel.js";
// import userModel from "../models/userModels.js";
// //api for adding doctors

// const addDoctor = async (req,res) => {
//     try {
//         const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
//         const imageFile = req.file

//         //checking for all data to ADD doctor

//         if(!name || !email|| !password || !speciality || !degree || !experience || !about || !fees|| !address ){
//             return res.json({success: false, message: "Missing Details"})
//         }
//         //validate email format

//         if(!validator.isEmail(email)){
//             return res.json({success:false, message:"Please enter valid email"})
//         }
//         //valid strong password
//         if(password.length < 8){
//             return res.json({success:false, message:"Please enter strong password"})
//         }

//         //hasing doctor password
//         const salt = await bcrypt.genSalt(10)
//         const hashedPassword = await bcrypt.hash(password, salt)

//         //upload image to cloudinary

//         const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type:"image"})
//         const imageUrl = imageUpload.secure_url

//         const doctorData = {
//             name,
//             email,
//             image:imageUrl,
//             password:hashedPassword,
//             speciality,
//             degree,
//             experience,
//             about,
//             fees,
//             address:JSON.parse(address),
//             date:Date.now()
//         }

//         const newDoctor = new doctorModel(doctorData)
//         await newDoctor.save()
//         res.json({success:true, message:"Doctor Added"})

//     } catch (error) {
//         console.log(error)
//         res.json({success:false, message:error.message})

//     }
// }

// //api for admin login

// const loginAdmin = async (req,res) => {
//     try {
//         const {email,password} = req.body
//         if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD ){
//             const token = jwt.sign(email+password, process.env.JWT_SECRET)
//             res.json({success:true, token})
//         }else{
//             res.json({success:false, message:"Invalid Creadentials"})
//         }
//     } catch (error) {
//         console.log(error)
//         res.json({success:false, message: error.message})

//     }
// }

// //API TO GET ALL DOCTORS IN ADMIN PANEL

// const allDoctors = async (req,res) => {
//     try {
//         const doctors = await doctorModel.find({}).select('-password')
//         res.json({success:true, doctors})

//     } catch (error) {
//      console.log(error)
//      res.json({success: false, message:error.message})
//     }
// }

// //api to get all appointment listr

// const appointmentsAdmin = async (req,res) => {
//     try {
//         const appointments = await appointmentModel.find({})
//         res.json({success:true,appointments})
//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// //api for cancel by admin
// const appointmentCancel = async (req, res) => {
//     try {
//         const { appointmentId } = req.body
//         const appointmentData = await appointmentModel.findById(appointmentId)

//         await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
//         //releasing doct slot

//         const {docId, slotDate,slotTime} = appointmentData
//         const doctorData = await doctorModel.findById(docId)
//         let slots_booked = doctorData.slots_booked
//         slots_booked[slotDate] = slots_booked[slotDate].filter(e=>e !== slotTime)

//         await doctorModel.findByIdAndUpdate(docId, {slots_booked})
//         res.json({success:true, message:"Appointment cancelled"})
//     } catch (error) {

//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }
// // api to get dashboard data for admin panel

// const adminDashboard = async(req,res) => {
//     try {
//         const doctors = await doctorModel.find({})
//         const users =   await userModel.find({})
//         const appointments = await appointmentModel.find({})

//         const dashData = {
//             doctors : doctors.length,
//             appointments : appointments.length,
//             patients: users.length,
//             latestAppointments : appointments.reverse().slice(0,5)

//         }
//         res.json({success:true, dashData})

//     } catch (error) {
//          console.log(error)
//         res.json({ success: false, message: error.message })
//     }
// }

// export {addDoctor,loginAdmin, allDoctors,appointmentsAdmin,appointmentCancel,adminDashboard}

import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModels.js";

// ✅ ADD DOCTOR (optimized)
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
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
      !address
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

    // 🔥 parallel: hash + upload
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
      date: Date.now(),
    };

    await doctorModel.create(doctorData);

    res.json({ success: true, message: "Doctor Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ LOGIN ADMIN (minor improvement)
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ GET ALL DOCTORS (lean for speed)
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password").lean();
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ GET ALL APPOINTMENTS (lean)
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({}).lean();
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ CANCEL APPOINTMENT (optimized DB calls)
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);
    if (!doctorData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    let slots_booked = doctorData.slots_booked || {};

    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (e) => e !== slotTime,
      );
    }

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ✅ DASHBOARD (BIG PERFORMANCE BOOST 🚀)
const adminDashboard = async (req, res) => {
  try {
    // 🔥 parallel queries
    const [doctorCount, userCount, appointmentCount, latestAppointments] =
      await Promise.all([
        doctorModel.countDocuments(),
        userModel.countDocuments(),
        appointmentModel.countDocuments(),
        appointmentModel.find({}).sort({ date: -1 }).limit(5).lean(),
      ]);

    const dashData = {
      doctors: doctorCount,
      appointments: appointmentCount,
      patients: userCount,
      latestAppointments,
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
};
