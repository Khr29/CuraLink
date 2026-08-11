// Single source of truth for structured prescription vocabulary — imported
// by the Mongoose schema (medicalRecordModel.js), the write-path sanitizer
// (medicalRecordController.js), and exposed read-only via
// GET /api/medical-records/prescription-options so both the admin app and
// frontend app fetch the same list instead of hardcoding a second copy.

export const DRUG_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream",
  "Ointment",
  "Drops",
  "Inhaler",
  "Powder",
  "Other",
];

export const FREQUENCIES = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "As needed (PRN)",
  "Other",
];

export const ROUTES = [
  "Oral",
  "Topical",
  "Injection",
  "Inhalation",
  "Sublingual",
  "Rectal",
  "Ophthalmic",
  "Otic",
  "Nasal",
  "Other",
];

export const TIMING_OPTIONS = [
  "Before Food",
  "After Food",
  "With Food",
  "Empty Stomach",
  "Anytime",
];

// A finalized prescription is no longer valid for pharmacy dispensing this
// many days after finalizedAt. Computed on read (medicalRecordController.js)
// rather than a stored status, since it changes purely with the passage of
// time — no background job needed to keep it correct.
export const PRESCRIPTION_EXPIRY_DAYS = 30;
