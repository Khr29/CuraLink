import jwt from 'jsonwebtoken'
import pharmacyModel from '../models/pharmacyModel.js'

// pharmacy authentication middleware — mirrors authHospital.js exactly
const authPharmacy = async (req, res, next) => {
  try {
    const { ptoken } = req.headers

    if (!ptoken) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, login again"
      })
    }

    const decoded = jwt.verify(ptoken, process.env.JWT_SECRET)

    if (!decoded?.id) {
      return res.status(403).json({
        success: false,
        message: "Invalid token"
      })
    }

    const pharmacy = await pharmacyModel.findById(decoded.id).select('active passwordChangedAt')
    if (!pharmacy) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, login again"
      })
    }
    if (!pharmacy.active) {
      return res.status(403).json({
        success: false,
        message: "This pharmacy account has been deactivated"
      })
    }
    if (pharmacy.passwordChangedAt && decoded.iat * 1000 < pharmacy.passwordChangedAt.getTime()) {
      return res.status(401).json({
        success: false,
        message: "Session expired, please login again"
      })
    }

    req.pharmacyId = decoded.id

    next()

  } catch (error) {
    console.error("Pharmacy Auth Error:", error.message)

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    })
  }
}

export default authPharmacy
