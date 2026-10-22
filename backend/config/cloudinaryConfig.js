import { isDeployedEnvironment } from "./dbSafety.js";

// Cloudinary credentials, fail-closed outside production.
//
// backend/.env carries the PRODUCTION Cloudinary account, so a local process
// must never inherit it (every image upload would write to the live account).
// In a deployed environment (NODE_ENV=production or RENDER=true) the regular
// CLOUDINARY_NAME / CLOUDINARY_API_KEY / CLOUDINARY_SECRET_KEY are used,
// unchanged. Anywhere else only a dedicated development account is used:
//
//   CLOUDINARY_DEV_NAME, CLOUDINARY_DEV_API_KEY, CLOUDINARY_DEV_SECRET_KEY
//
// If any of the three is missing, Cloudinary is left unconfigured and uploads
// fail locally (no credentials, no network write). Values are never logged.
export const resolveCloudinaryConfig = (env = process.env) => {
  if (isDeployedEnvironment(env)) {
    // "configured" only when all three are set: with any missing the SDK would
    // fail every upload with a raw "Must supply api_key" style message.
    return {
      mode: "production",
      configured: Boolean(env.CLOUDINARY_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_SECRET_KEY),
      config: {
        cloud_name: env.CLOUDINARY_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_SECRET_KEY,
      },
    };
  }
  const cloud_name = env.CLOUDINARY_DEV_NAME;
  const api_key = env.CLOUDINARY_DEV_API_KEY;
  const api_secret = env.CLOUDINARY_DEV_SECRET_KEY;
  const configured = Boolean(cloud_name && api_key && api_secret);
  return {
    mode: "development",
    configured,
    // Explicit undefined (not the production values) so nothing is inherited,
    // including from a CLOUDINARY_URL the SDK may have read at import time.
    config: configured
      ? { cloud_name, api_key, api_secret }
      : { cloud_name: undefined, api_key: undefined, api_secret: undefined },
  };
};
