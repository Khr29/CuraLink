import { v2 as cloudinary } from 'cloudinary'
import { resolveCloudinaryConfig } from './cloudinaryConfig.js'

const connectCloudinary = async () => {
    const { mode, configured, config } = resolveCloudinaryConfig()
    cloudinary.config(config)
    if (mode === 'development' && !configured) {
        console.warn(
            '[CONFIG] Cloudinary is DISABLED for local development: set CLOUDINARY_DEV_NAME, ' +
            'CLOUDINARY_DEV_API_KEY and CLOUDINARY_DEV_SECRET_KEY (a dedicated dev account) in ' +
            'backend/.env.local to enable image uploads. Production credentials are never used locally.'
        )
    }
}

export default connectCloudinary
