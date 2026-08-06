import jwt from 'jsonwebtoken'
import hospitalModel from '../models/hospitalModel.js'

// hospital authentication middleware
const authHospital = async (req, res, next) => {
  try {
    const { htoken } = req.headers

    if (!htoken) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, login again"
      })
    }

    const decoded = jwt.verify(htoken, process.env.JWT_SECRET)

    if (!decoded?.id) {
      return res.status(403).json({
        success: false,
        message: "Invalid token"
      })
    }

    const hospital = await hospitalModel.findById(decoded.id).select('active passwordChangedAt')
    if (!hospital) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, login again"
      })
    }
    if (!hospital.active) {
      return res.status(403).json({
        success: false,
        message: "This hospital account has been deactivated"
      })
    }
    if (hospital.passwordChangedAt && decoded.iat * 1000 < hospital.passwordChangedAt.getTime()) {
      return res.status(401).json({
        success: false,
        message: "Session expired, please login again"
      })
    }

    req.hospitalId = decoded.id

    next()

  } catch (error) {
    console.error("Hospital Auth Error:", error.message)

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    })
  }
}

export default authHospital
