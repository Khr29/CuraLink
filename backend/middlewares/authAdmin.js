// import jwt from 'jsonwebtoken'

// //admin authenctiaction

// const authAdmin = async (req, res, next) => {
//     try {

//         const { atoken} = req.headers // token to headers se lega 
//         console.log(atoken)
//         if(!atoken) {
//             return res.json({success:false, message:"Not authorized Login again"})
//         }
//         const token_decode = jwt.verify(atoken,process.env.JWT_SECRET) // to verify jwt secret

//         if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
//             return res.json({success:false, message:"Not Authorized Login Again"})
//         }
//         next()

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }

// }
// export default authAdmin

import jwt from 'jsonwebtoken'

const authAdmin = async (req, res, next) => {
    try {
        const { atoken } = req.headers

        // ❌ no token
        if (!atoken) {
            return res.json({ success: false, message: "Not authorized Login again" })
        }

        // ✅ verify
        const decoded = jwt.verify(atoken, process.env.JWT_SECRET)

        // ✅ check email
        if (decoded.email !== process.env.ADMIN_EMAIL) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }

        next()

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export default authAdmin

