import refreshTokenModel from "../models/refreshTokenModel.js";
import {
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} from "./tokens.js";
import { REFRESH_COOKIE_NAMES, refreshCookieOptions, clearCookieOptions } from "./cookies.js";

const requestMeta = (req) => ({
  userAgent: req.headers["user-agent"] || "",
  ip:
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    "",
});

// Creates a new refresh-token session row and sets its httpOnly cookie.
// Called on login/register. Returns nothing — callers sign their own access
// token immediately after (payload shape differs per actor type).
export const issueSession = async ({
  req,
  res,
  actorType,
  actorId,
  actorLabel,
  rememberMe = false,
}) => {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiry(rememberMe);
  const { userAgent, ip } = requestMeta(req);

  await refreshTokenModel.create({
    actorType,
    actorId: actorId || null,
    actorLabel,
    tokenHash,
    rememberMe,
    userAgent,
    ip,
    expiresAt,
  });

  res.cookie(
    REFRESH_COOKIE_NAMES[actorType],
    `${actorType}:${refreshToken}`,
    refreshCookieOptions(rememberMe)
  );
};

const readCookieToken = (req, actorType) => {
  const raw = req.cookies?.[REFRESH_COOKIE_NAMES[actorType]];
  if (!raw) return null;
  const separatorIndex = raw.indexOf(":");
  if (separatorIndex === -1) return null;
  const type = raw.slice(0, separatorIndex);
  const token = raw.slice(separatorIndex + 1);
  if (type !== actorType || !token) return null;
  return token;
};

// Validates the refresh cookie, rotates it (old row revoked, new row +
// cookie issued), and returns the session record — or null if the cookie is
// missing/invalid/expired/revoked, meaning the caller must log in again.
export const rotateSession = async ({ req, res, actorType }) => {
  const refreshToken = readCookieToken(req, actorType);
  if (!refreshToken) return null;

  const tokenHash = hashToken(refreshToken);
  const session = await refreshTokenModel.findOne({ tokenHash, actorType });
  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }

  session.revokedAt = new Date();
  await session.save();

  const newRefreshToken = generateRefreshToken();
  const { userAgent, ip } = requestMeta(req);
  const expiresAt = getRefreshTokenExpiry(session.rememberMe);

  await refreshTokenModel.create({
    actorType,
    actorId: session.actorId,
    actorLabel: session.actorLabel,
    tokenHash: hashToken(newRefreshToken),
    rememberMe: session.rememberMe,
    userAgent,
    ip,
    expiresAt,
  });

  res.cookie(
    REFRESH_COOKIE_NAMES[actorType],
    `${actorType}:${newRefreshToken}`,
    refreshCookieOptions(session.rememberMe)
  );

  return session;
};

// Secure logout: revokes the current session (if any) and clears the cookie
// regardless, so logout always leaves the browser with no usable cookie.
export const revokeSession = async ({ req, res, actorType }) => {
  res.clearCookie(REFRESH_COOKIE_NAMES[actorType], clearCookieOptions());
  const refreshToken = readCookieToken(req, actorType);
  if (!refreshToken) return;
  await refreshTokenModel.updateOne(
    { tokenHash: hashToken(refreshToken), actorType },
    { revokedAt: new Date() }
  );
};

// "Logout all sessions" / forced re-auth after a password change.
export const revokeAllSessions = async ({ actorType, actorId }) => {
  await refreshTokenModel.updateMany(
    { actorType, actorId, revokedAt: null },
    { revokedAt: new Date() }
  );
};
