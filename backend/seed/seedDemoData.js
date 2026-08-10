// One-shot, idempotent demo-data seed script.
//
// Populates ONE complete, realistic hospital (Apollo Hospitals —
// Bannerghatta Main Road) with matching doctors, a patient, appointments,
// a medical record, and a review, so the full CuraLink workflow can be
// demonstrated end-to-end. Every write is an upsert keyed by a stable
// identifier (email for accounts, appointmentId for records/reviews), so
// running this script again updates the same demo data in place instead
// of creating duplicates — safe to re-run any time.
//
// Usage:  node seed/seedDemoData.js
//
// Does NOT touch any other existing data (real patients, other hospitals,
// admin, audit logs, etc).

import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "../config/mongodb.js";
import hospitalModel from "../models/hospitalModel.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModels.js";
import appointmentModel from "../models/appointmentModel.js";
import medicalRecordModel from "../models/medicalRecordModel.js";
import reviewModel from "../models/reviewModel.js";

const DEMO_PASSWORD = "Demo@12345";

const HOSPITAL_EMAIL = "info@apollohospitals.com";
const DOCTOR_1_EMAIL = "rohan.mehta@apollohospitals.com"; // cardiologist — already exists, reused/enriched
const DOCTOR_2_EMAIL = "ananya.reddy@apollohospitals.com"; // dermatologist — new
const PATIENT_EMAIL = "demo.patient@curalink.com";

const slotDateFor = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`;
};

// Mirrors reviewController.updateAverageRating so demo reviews are
// reflected in the doctor's displayed rating, same as a real review would be.
const recomputeDoctorRating = async (doctorId) => {
  const reviews = await reviewModel.find({ doctorId, isVisible: true });
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;
  await doctorModel.findByIdAndUpdate(doctorId, { averageRating, totalReviews });
};

async function main() {
  await connectDB();
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ─────────────────────────────────────────────────────────────
  // 1. Hospital — Apollo Hospitals, Bannerghatta Main Road, Bengaluru
  // ─────────────────────────────────────────────────────────────
  const hospital = await hospitalModel.findOneAndUpdate(
    { email: HOSPITAL_EMAIL },
    {
      $setOnInsert: {
        email: HOSPITAL_EMAIL,
        image: "https://placehold.co/1200x700/0F172A/FFFFFF?text=Apollo+Hospitals",
        gallery: [
          "https://placehold.co/800x600/2563EB/FFFFFF?text=Reception",
          "https://placehold.co/800x600/14B8A6/FFFFFF?text=ICU+Ward",
        ],
      },
      $set: {
        name: "Apollo Hospitals",
        logo: "https://placehold.co/200x200/2563EB/FFFFFF?text=A",
        banner: "https://placehold.co/1600x400/0F172A/5EEAD4?text=Apollo+Hospitals+%E2%80%94+Bannerghatta+Main+Road",
        description:
          "Apollo Hospitals, Bannerghatta Main Road, Bengaluru is a leading 350-bed multi-speciality hospital providing world-class healthcare services. The hospital offers advanced medical treatments across cardiology, neurology, oncology, orthopedics, gastroenterology, emergency medicine, and critical care. Equipped with modern diagnostic technology, experienced specialists, and 24/7 emergency services, Apollo is committed to delivering high-quality, patient-centered healthcare with clinical excellence and innovation.",
        password: hashedPassword,
        passwordChangedAt: new Date(),
        phone: "+91 80 6904 9765",
        website: "https://www.apollohospitals.com/hospitals/apollo-hospitals-bannerghatta-road",
        address: {
          line1: "IIM, 154/11, Bannerghatta Road",
          line2: "Opposite Krishnaraju Layout",
          city: "Bengaluru",
          state: "Karnataka",
          country: "India",
          pincode: "560076",
        },
        location: {
          latitude: 12.896128,
          longitude: 77.598535,
          mapsUrl: "https://maps.google.com/?q=12.896128,77.598535",
        },
        hospitalType: "Private",
        openingHours: "24 Hours",
        emergency: true,
        beds: 350,
        insuranceAccepted: true,
        departments: [
          "Cardiology", "Pediatrics", "General Medicine", "Ophthalmology",
          "Gastroenterology", "ENT", "Oncology", "Neurology",
          "Orthopedics", "Dermatology", "Urology", "Pulmonology",
        ],
        specialties: ["Cardiology", "Pediatrics", "Dermatology"],
        facilities: [
          "ICU", "CT Scan", "Pharmacy", "Parking", "Wheelchair Access",
          "Blood Bank", "X-Ray", "Emergency", "MRI", "Laboratory",
          "Ambulance", "Cafeteria",
        ],
        verificationStatus: "approved",
        active: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Hospital ready: ${hospital.name} (${hospital._id})`);

  // ─────────────────────────────────────────────────────────────
  // 2. Doctors
  // ─────────────────────────────────────────────────────────────
  const doctor1 = await doctorModel.findOneAndUpdate(
    { email: DOCTOR_1_EMAIL },
    {
      $set: {
        name: "Dr. Rohan Mehta",
        password: hashedPassword,
        image: "https://ui-avatars.com/api/?name=Rohan+Mehta&background=2563EB&color=fff&size=400",
        speciality: "Cardiologist",
        degree: "MBBS, MD (General Medicine), DM (Cardiology)",
        experience: "12 Years",
        about:
          "Dr. Rohan Mehta is a Senior Consultant Cardiologist with over 12 years of experience diagnosing and treating complex cardiovascular diseases. He specializes in preventive cardiology, coronary artery disease, hypertension management, heart failure, angioplasty, and cardiac rehabilitation, and is known for his patient-centered, evidence-based approach.",
        fees: 1050,
        available: true,
        address: {
          line1: "Apollo Hospitals, Bannerghatta Main Road",
          line2: "Jayanagar 9th Block, Bengaluru, Karnataka",
        },
        hospitalId: hospital._id,
        employmentType: "hospital",
        verificationStatus: "verified",
      },
      $setOnInsert: { date: Date.now() },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const doctor2 = await doctorModel.findOneAndUpdate(
    { email: DOCTOR_2_EMAIL },
    {
      $set: {
        name: "Dr. Ananya Reddy",
        password: hashedPassword,
        image: "https://ui-avatars.com/api/?name=Ananya+Reddy&background=14B8A6&color=fff&size=400",
        speciality: "Dermatologist",
        degree: "MBBS, MD (Dermatology, Venereology & Leprosy)",
        experience: "8 Years",
        about:
          "Dr. Ananya Reddy is a consultant dermatologist with 8 years of experience in medical and cosmetic dermatology. She specializes in acne management, eczema, psoriasis, pigmentation disorders, and skin allergies, with a focus on personalized, evidence-based treatment plans.",
        fees: 800,
        available: true,
        address: {
          line1: "Apollo Hospitals, Bannerghatta Main Road",
          line2: "Jayanagar 9th Block, Bengaluru, Karnataka",
        },
        hospitalId: hospital._id,
        employmentType: "hospital",
        verificationStatus: "verified",
      },
      $setOnInsert: { date: Date.now() },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Doctors ready: ${doctor1.name} (${doctor1._id}), ${doctor2.name} (${doctor2._id})`);

  // ─────────────────────────────────────────────────────────────
  // 3. Patient
  // ─────────────────────────────────────────────────────────────
  const patient = await userModel.findOneAndUpdate(
    { email: PATIENT_EMAIL },
    {
      $set: {
        name: "Aarav Kumar",
        password: hashedPassword,
        image: "https://ui-avatars.com/api/?name=Aarav+Kumar&background=0EA5E9&color=fff&size=400",
        phone: "+91 98765 43210",
        dob: "1994-03-15",
        gender: "Male",
        bloodGroup: "O+",
        address: {
          line1: "42, 5th Cross, Koramangala 4th Block",
          line2: "",
          city: "Bengaluru",
          state: "Karnataka",
          country: "India",
          pincode: "560034",
        },
        emergencyContact: { name: "Priya Kumar", phone: "+91 98765 11223" },
        medical: {
          height: "175 cm",
          weight: "72 kg",
          allergies: "Penicillin",
          chronicDiseases: "None",
          medications: "None",
        },
        insurance: {
          provider: "Star Health Insurance",
          policyNumber: "SH-2024-887744",
          validTill: "2027-03-31",
        },
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Patient ready: ${patient.name} (${patient._id})`);

  // ─────────────────────────────────────────────────────────────
  // 4. Appointments — one upcoming, one completed
  // ─────────────────────────────────────────────────────────────
  const userSnapshot = (await userModel.findById(patient._id).select("-password")).toObject();
  const doc1Snapshot = (await doctorModel.findById(doctor1._id).select("-password")).toObject();
  const doc2Snapshot = (await doctorModel.findById(doctor2._id).select("-password")).toObject();

  const upcomingSlotDate = slotDateFor(3);
  const upcomingAppointment = await appointmentModel.findOneAndUpdate(
    { userId: patient._id, docId: doctor2._id, slotDate: upcomingSlotDate },
    {
      $set: {
        hospitalId: hospital._id,
        userData: userSnapshot,
        docData: doc2Snapshot,
        amount: doctor2.fees,
        slotTime: "11:30 AM",
        cancelled: false,
        payment: true,
        isCompleted: false,
      },
      $setOnInsert: { date: Date.now() },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const completedSlotDate = slotDateFor(-3);
  const completedAppointment = await appointmentModel.findOneAndUpdate(
    { userId: patient._id, docId: doctor1._id, slotDate: completedSlotDate },
    {
      $set: {
        hospitalId: hospital._id,
        userData: userSnapshot,
        docData: doc1Snapshot,
        amount: doctor1.fees,
        slotTime: "10:00 AM",
        cancelled: false,
        payment: true,
        isCompleted: true,
      },
      $setOnInsert: { date: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(
    `Appointments ready: upcoming ${upcomingAppointment._id} (${upcomingSlotDate}), completed ${completedAppointment._id} (${completedSlotDate})`
  );

  // ─────────────────────────────────────────────────────────────
  // 5. Medical record for the completed appointment
  // ─────────────────────────────────────────────────────────────
  const record = await medicalRecordModel.findOneAndUpdate(
    { appointmentId: completedAppointment._id },
    {
      $set: {
        patientId: patient._id,
        doctorId: doctor1._id,
        hospitalId: hospital._id,
        diagnosis: "Mild Hypertension (Stage 1)",
        notes:
          "Patient presented with intermittent headaches and elevated blood pressure readings (142/90 mmHg) over the past two weeks. No chest pain, palpitations, or shortness of breath. ECG within normal limits. Advised lifestyle modification — reduced sodium intake, regular aerobic exercise, and home BP monitoring twice daily. Follow-up in 4 weeks to reassess.",
        prescription: [
          {
            medicine: "Amlodipine 5mg",
            dosage: "1 tablet once daily",
            duration: "30 days",
            instructions: "Take in the morning, preferably at the same time each day",
            // Numeric leading quantity so the Pharmacy portal's partial-
            // dispensing math has something real to demonstrate against.
            // This script writes the model directly (bypassing the
            // controller's sanitizePrescription, which normally derives
            // quantityPrescribed from `quantity` automatically) so both are
            // set explicitly here, consistently, by hand.
            quantity: "30 tablets",
            quantityPrescribed: 30,
            dispensedQuantity: 0,
          },
        ],
        status: "finalized",
        finalizedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Medical record ready: ${record._id} (finalized)`);

  // ─────────────────────────────────────────────────────────────
  // 6. Review for the completed appointment
  // ─────────────────────────────────────────────────────────────
  const review = await reviewModel.findOneAndUpdate(
    { appointmentId: completedAppointment._id, doctorId: doctor1._id },
    {
      $set: {
        userId: patient._id,
        rating: 5,
        title: "Thorough, attentive, and reassuring",
        comment:
          "Dr. Mehta took the time to explain my blood pressure readings and what they meant, rather than just handing me a prescription. He answered every question patiently and the follow-up plan felt genuinely tailored to me. Highly recommend.",
        verifiedPatient: true,
        isVisible: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await recomputeDoctorRating(doctor1._id);
  console.log(`Review ready: ${review._id}`);

  // ─────────────────────────────────────────────────────────────
  // Credentials
  // ─────────────────────────────────────────────────────────────
  console.log("\n================ DEMO LOGIN CREDENTIALS ================\n");
  console.log("Admin");
  console.log(`Email: ${process.env.ADMIN_EMAIL}`);
  console.log(`Password: (unchanged — set in backend/.env, not modified by this script)`);
  console.log("");
  console.log("Doctor");
  console.log(`Email: ${DOCTOR_1_EMAIL}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log(`(second doctor: ${DOCTOR_2_EMAIL} — same password)`);
  console.log("");
  console.log("Hospital");
  console.log(`Email: ${HOSPITAL_EMAIL}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log("");
  console.log("Patient");
  console.log(`Email: ${PATIENT_EMAIL}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log("\n==========================================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
