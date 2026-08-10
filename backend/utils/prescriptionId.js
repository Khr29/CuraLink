import crypto from "crypto";
import counterModel from "../models/counterModel.js";

// Public-facing prescription ID — sequential and human-readable, but *not*
// itself a capability (it never grants access to anything; see
// verificationToken below for the thing that actually does). Format:
// RX-2026-000142. Never derived from patientId/doctorId/appointmentId.
export const generatePrescriptionId = async () => {
  const year = new Date().getFullYear();
  const counter = await counterModel.findOneAndUpdate(
    { _id: `prescription-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `RX-${year}-${String(counter.seq).padStart(6, "0")}`;
};

// High-entropy, cryptographically random, non-guessable — this is the
// actual QR/verification capability. 24 bytes -> 48 hex chars, comparable
// to the refresh-token entropy used elsewhere in this app.
export const generateVerificationToken = () => crypto.randomBytes(24).toString("hex");
