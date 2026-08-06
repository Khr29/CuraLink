import jwt from 'jsonwebtoken'

const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers

        // ❌ no token
        if (!atoken) {
            return res.status(401).json({ success: false, message: "Not authorized Login again" })
        }

        // ✅ verify
        const decoded = jwt.verify(atoken, process.env.JWT_SECRET)

        // ✅ check email
        if (decoded.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ success: false, message: "Not Authorized Login Again" })
        }

        req.adminEmail = decoded.email

        next()

    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token" })
    }
}

export default authAdmin
