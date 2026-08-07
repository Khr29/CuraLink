import express from 'express'
import { appointmentCancel, appointmentComplete, appointmentsDoctor, doctorDashboard, doctorList, doctorProfile, loginDoctor, logoutDoctor, updateDoctorProffile } from '../controllers/doctorController.js'
import {
  requestHospital,
  leaveHospital,
  getMyHospitalRequests,
  cancelMyHospitalRequest,
  respondToInvite,
} from '../controllers/hospitalRequestController.js'
import authDoctor from '../middlewares/authDoctor.js'
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
import { loginLimiter, forgotPasswordLimiter, otpVerifyLimiter } from '../middlewares/rateLimiters.js'

const doctorRouter = express.Router()
const getDocId = (req) => req.docId

doctorRouter.get('/list',doctorList)
doctorRouter.post('/login', loginLimiter, loginDoctor)
doctorRouter.post('/logout',authDoctor,logoutDoctor)
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
doctorRouter.get('/dashboard',authDoctor,doctorDashboard)
doctorRouter.get('/profile',authDoctor,doctorProfile)
doctorRouter.post('/update-profile',upload.single('image'),authDoctor,updateDoctorProffile)

// Hospital affiliation lifecycle
doctorRouter.post('/request-hospital',authDoctor,requestHospital)
doctorRouter.post('/leave-hospital',authDoctor,leaveHospital)
doctorRouter.get('/hospital-requests',authDoctor,getMyHospitalRequests)
doctorRouter.delete('/hospital-requests/:id',authDoctor,cancelMyHospitalRequest)
doctorRouter.patch('/hospital-requests/:id/respond',authDoctor,respondToInvite)

// =====================================
// Session / Token Management
// =====================================
doctorRouter.post('/refresh-token', makeRefreshTokenHandler('doctor'))
doctorRouter.post('/logout-all', authDoctor, makeLogoutAllHandler('doctor', getDocId))
doctorRouter.get('/sessions', authDoctor, makeListSessionsHandler('doctor', getDocId))
doctorRouter.delete('/sessions/:sessionId', authDoctor, makeRevokeSessionHandler('doctor', getDocId))

// =====================================
// Password Security
// =====================================
doctorRouter.post('/change-password', authDoctor, makeChangePasswordHandler('doctor', getDocId))
doctorRouter.post('/forgot-password', forgotPasswordLimiter, makeForgotPasswordHandler('doctor'))
doctorRouter.post('/reset-password', otpVerifyLimiter, makeResetPasswordHandler('doctor'))

// =====================================
// Email Verification
// =====================================
doctorRouter.post('/send-verification-otp', authDoctor, forgotPasswordLimiter, makeSendVerificationOtpHandler('doctor', getDocId))
doctorRouter.post('/verify-email', authDoctor, otpVerifyLimiter, makeVerifyEmailHandler('doctor', getDocId))

export default doctorRouter
