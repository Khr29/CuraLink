import crypto from "crypto";
import otpModel from "../models/otpModel.js";
import { hashOtp, OTP_MAX_ATTEMPTS } from "./otp.js";

// Per-ACCOUNT cap on how many codes may be issued per window. The route
// limiters are per-IP only; without this, rotating IPs (or just waiting out a
// window) gives unlimited fresh codes, each with its own 5 guesses.
export const OTP_ISSUE_WINDOW_MS = 60 * 60 * 1000;
export const OTP_MAX_ISSUED_PER_WINDOW = 5;

export const canIssueOtp = async ({ actorType, actorId, purpose }, now = new Date()) => {
  const recent = await otpModel.countDocuments({
    actorType,
    actorId,
    purpose,
    createdAt: { $gt: new Date(now.getTime() - OTP_ISSUE_WINDOW_MS) },
  });
  return recent < OTP_MAX_ISSUED_PER_WINDOW;
};

const codesMatch = (submitted, codeHash) => {
  const a = Buffer.from(hashOtp(submitted), "hex");
  const b = Buffer.from(String(codeHash), "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Verifies a submitted code against the newest unconsumed OTP matching
// `filter`, safely under concurrency:
//
//  1. An attempt is RESERVED with one atomic conditional $inc BEFORE the code
//     is compared. Every guess — right or wrong, however many arrive at once —
//     consumes exactly one of the OTP_MAX_ATTEMPTS slots, so N parallel guesses
//     can never exceed the limit (a read-check-then-save would let all N through).
//  2. A correct code is consumed with another atomic conditional update, so two
//     parallel requests holding the same correct code cannot both succeed.
//
// Returns { ok: true, record } or { ok: false, reason } where reason is one of
// "missing_or_expired" | "locked" | "invalid" | "already_used".
export const verifyOtp = async ({ filter, code }, now = new Date()) => {
  if (typeof code !== "string" && typeof code !== "number") return { ok: false, reason: "invalid" };

  const latest = await otpModel.findOne({ ...filter, consumedAt: null }).sort({ createdAt: -1 });
  if (!latest || latest.expiresAt <= now) return { ok: false, reason: "missing_or_expired" };

  const reserved = await otpModel.findOneAndUpdate(
    { _id: latest._id, consumedAt: null, expiresAt: { $gt: now }, attempts: { $lt: OTP_MAX_ATTEMPTS } },
    { $inc: { attempts: 1 } },
    { returnDocument: "after" }
  );
  if (!reserved) return { ok: false, reason: "locked" };

  if (!codesMatch(String(code), reserved.codeHash)) return { ok: false, reason: "invalid" };

  const consumed = await otpModel.findOneAndUpdate(
    { _id: reserved._id, consumedAt: null },
    { consumedAt: now },
    { returnDocument: "after" }
  );
  if (!consumed) return { ok: false, reason: "already_used" };
  return { ok: true, record: consumed };
};

// Gives a correctly-verified code back (e.g. the new password was rejected for
// being reused), so the legitimate holder doesn't have to request another one.
export const releaseOtp = (record) =>
  otpModel.updateOne({ _id: record._id }, { consumedAt: null });
