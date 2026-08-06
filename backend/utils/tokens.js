import jwt from "jsonwebtoken";
import crypto from "crypto";

// Access tokens are intentionally short-lived — the refresh-token flow
// (see utils/session.js) is what keeps the user signed in beyond this.
export const ACCESS_TOKEN_TTL = "15m";

const REFRESH_TOKEN_TTL_DEFAULT_MS = 24 * 60 * 60 * 1000; // 1 day
const REFRESH_TOKEN_TTL_REMEMBER_MS = 30 * 24 * 60 * 60 * 1000; // 30 days ("Remember Me")

export const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

// Refresh tokens are opaque random strings, never JWTs — only their SHA-256
// hash is stored, so a leaked DB never reveals a usable token, and
// revocation is a plain DB update rather than a JWT-blacklist scheme.
export const generateRefreshToken = () => crypto.randomBytes(40).toString("hex");

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const getRefreshTokenExpiry = (rememberMe) =>
  new Date(
    Date.now() +
      (rememberMe ? REFRESH_TOKEN_TTL_REMEMBER_MS : REFRESH_TOKEN_TTL_DEFAULT_MS)
  );
