import jwt from 'jsonwebtoken'

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

    req.hospitalId = decoded?.id

    if (!req.hospitalId) {
      return res.status(403).json({
        success: false,
        message: "Invalid token"
      })
    }

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
