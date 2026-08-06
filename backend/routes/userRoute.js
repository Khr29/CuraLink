import express from 'express'

import { bookAppointment, getProfie, loginUser, logoutUser, registerUser, updateProfile,listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay } from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'
import {
  makeRefreshTokenHandler,
  makeLogoutAllHandler,
  makeListSessionsHandler,
  makeRevokeSessionHandler,
  makeChangePasswordHandler,
  makeForgotPasswordHandler,
  makeResetPasswordHandler,
  makeSendVerificationOtpHandler,
  makeVerifyEmailHandler,
} from '../controllers/authSharedController.js'
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  otpVerifyLimiter,
  bookingLimiter,
} from '../middlewares/rateLimiters.js'

const userRouter = express.Router()
const getUserId = (req) => req.userId

userRouter.post('/register', registerLimiter, upload.single('image'), registerUser)
userRouter.post('/login', loginLimiter, loginUser)
userRouter.post('/logout',authUser,logoutUser)
userRouter.get('/get-profile',authUser , getProfie)
userRouter.post('/update-profile',upload.single('image'),authUser ,updateProfile)
userRouter.post('/book-appointment', bookingLimiter, authUser, bookAppointment)
userRouter.get('/appointments',authUser,listAppointment)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post('/payment-razorpay',authUser,paymentRazorpay)
userRouter.post('/verifyRazorpay',authUser,verifyRazorpay)

// =====================================
// Session / Token Management
// =====================================
userRouter.post('/refresh-token', makeRefreshTokenHandler('user'))
userRouter.post('/logout-all', authUser, makeLogoutAllHandler('user', getUserId))
userRouter.get('/sessions', authUser, makeListSessionsHandler('user', getUserId))
userRouter.delete('/sessions/:sessionId', authUser, makeRevokeSessionHandler('user', getUserId))

// =====================================
// Password Security
// =====================================
userRouter.post('/change-password', authUser, makeChangePasswordHandler('user', getUserId))
userRouter.post('/forgot-password', forgotPasswordLimiter, makeForgotPasswordHandler('user'))
userRouter.post('/reset-password', otpVerifyLimiter, makeResetPasswordHandler('user'))

// =====================================
// Email Verification
// =====================================
userRouter.post('/send-verification-otp', authUser, forgotPasswordLimiter, makeSendVerificationOtpHandler('user', getUserId))
userRouter.post('/verify-email', authUser, otpVerifyLimiter, makeVerifyEmailHandler('user', getUserId))

export default userRouter
