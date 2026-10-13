// Explicit field whitelists for UNAUTHENTICATED doctor/hospital endpoints
// (GET /api/doctor/list, /api/hospital/list, /api/hospital/:id).
//
// A whitelist (not a "-password" blacklist) is deliberate: any field added to
// these models later stays private until someone consciously lists it here.
// Never add credentials/hash history (password, previousPasswords,
// passwordChangedAt), personal contact data (emails, doctor phone, licenseNumber), verification
// internals (verifiedBy, verifiedAt, emailVerified), signatures, or booked
// slots. Admin/hospital/doctor-authenticated endpoints use their own queries.

export const PUBLIC_DOCTOR_FIELDS =
  "name image speciality degree experience about fees available address hospitalId " +
  "languages workingHours averageRating totalReviews verificationStatus";

export const PUBLIC_HOSPITAL_FIELDS =
  "name image logo banner gallery description website address location " +
  "hospitalType openingHours emergency beds insuranceAccepted departments " +
  "specialties facilities averageRating totalReviews active verificationStatus " +
  "phone";

// What the PATIENT's appointment screens render about the doctor (name, photo,
// speciality, clinic address). The stored appointment.docData snapshot is a
// full copy of the doctor document (email, phone, licenseNumber, signature,
// verification fields...) that doctor/admin/hospital views still read, so it
// is trimmed here, at the patient-facing response, rather than in storage.
// _id is kept as a stable identifier. Everything else is dropped by default.
export const PATIENT_APPOINTMENT_DOCTOR_FIELDS = ["name", "image", "speciality", "address"];

export const toPatientAppointmentView = (appointment) => {
  const plain = typeof appointment.toObject === "function" ? appointment.toObject() : { ...appointment };
  const source = plain.docData && typeof plain.docData === "object" ? plain.docData : {};
  const docData = {};
  if (source._id !== undefined) docData._id = source._id;
  for (const field of PATIENT_APPOINTMENT_DOCTOR_FIELDS) {
    if (source[field] !== undefined) docData[field] = source[field];
  }
  return { ...plain, docData };
};
