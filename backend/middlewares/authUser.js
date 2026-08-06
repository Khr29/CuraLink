import jwt from 'jsonwebtoken'
import userModel from '../models/userModels.js'

// user authentication
const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized Login again" })
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        if (!token_decode?.id) {
            return res.status(401).json({ success: false, message: "Invalid token" })
        }

        const user = await userModel.findById(token_decode.id).select('isActive passwordChangedAt')
        if (!user) {
            return res.status(401).json({ success: false, message: "Not authorized Login again" })
        }
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "This account has been suspended" })
        }
        // Any access token issued before the last password change is stale —
        // forces re-login everywhere once the password changes ("Invalidate
        // old sessions after password change").
        if (user.passwordChangedAt && token_decode.iat * 1000 < user.passwordChangedAt.getTime()) {
            return res.status(401).json({ success: false, message: "Session expired, please login again" })
        }

        req.userId = token_decode.id
        next()

    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token" })
    }

}
export default authUser
