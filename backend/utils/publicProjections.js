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
