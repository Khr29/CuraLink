// import jwt from 'jsonwebtoken'

// //user authenctiaction

// const authDoctor = async (req, res, next) => {
//     try {

//         const { dtoken} = req.headers
//         if(!dtoken) {
//             return res.json({success:false, message:"Not authorized Login again"})
//         }
//         const token_decode = jwt.verify(dtoken,process.env.JWT_SECRET)

//          //req.body.userId = token_decode.id
//           req.docId = token_decode.id  
//         next()

//     } catch (error) {
//         console.log(error)
//         res.json({ success: false, message: error.message })
//     }

// }
// export default authDoctor

import jwt from 'jsonwebtoken'

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

    // 3. attach doctor id to request
    req.docId = decoded?.id

    if (!req.docId) {
      return res.status(403).json({
        success: false,
        message: "Invalid token"
      })
    }

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