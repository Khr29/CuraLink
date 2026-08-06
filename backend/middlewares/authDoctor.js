import jwt from 'jsonwebtoken'
import doctorModel from '../models/doctorModel.js'

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers

    // 1. token check
    if (!dtoken) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, login again"
      })
    }

    // 2. verify token
    const decoded = jwt.verify(dtoken, process.env.JWT_SECRET)

    if (!decoded?.id) {
      return res.status(403).json({
        success: false,
        message: "Invalid token"
      })
    }

    const doctor = await doctorModel.findById(decoded.id).select('passwordChangedAt verificationStatus')
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, login again"
      })
    }
    if (doctor.verificationStatus === "rejected") {
      return res.status(403).json({
        success: false,
        message: "This account is not authorized to access the doctor portal"
      })
    }
    // Any access token issued before the last password change is stale.
    if (doctor.passwordChangedAt && decoded.iat * 1000 < doctor.passwordChangedAt.getTime()) {
      return res.status(401).json({
        success: false,
        message: "Session expired, please login again"
      })
    }

    // 3. attach doctor id to request
    req.docId = decoded.id

    // 4. move to next
    next()

  } catch (error) {
    console.error("Doctor Auth Error:", error.message)

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    })
  }
}

export default authDoctor
