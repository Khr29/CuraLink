import { v2 as cloudinary } from 'cloudinary'
import { resolveCloudinaryConfig } from './cloudinaryConfig.js'

const sdkUpload = cloudinary.uploader.upload

const connectCloudinary = async () => {
    const { mode, configured, config } = resolveCloudinaryConfig()
    cloudinary.config(config)
    // Every upload call site reports error.message to the client, so when not
    // configured replace the SDK's raw "Must supply api_key" with a clear, safe one.
    cloudinary.uploader.upload = configured
        ? sdkUpload
        : async () => {
            throw new Error('Image uploads are not configured on this server')
        }
    if (mode === 'development' && !configured) {
        console.warn(
            '[CONFIG] Cloudinary is DISABLED for local development: set CLOUDINARY_DEV_NAME, ' +
            'CLOUDINARY_DEV_API_KEY and CLOUDINARY_DEV_SECRET_KEY (a dedicated dev account) in ' +
            'backend/.env.local to enable image uploads. Production credentials are never used locally.'
        )
    }
}

export default connectCloudinary
