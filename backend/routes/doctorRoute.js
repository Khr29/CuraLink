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

const doctorRouter = express.Router()

doctorRouter.get('/list',doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.post('/logout',authDoctor,logoutDoctor)
doctorRouter.get('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/complete-appointment',authDoctor,appointmentComplete)
doctorRouter.post('/cancel-appointment',authDoctor,appointmentCancel)
doctorRouter.get('/dashboard',authDoctor,doctorDashboard)
doctorRouter.get('/profile',authDoctor,doctorProfile)
doctorRouter.post('/update-profile',authDoctor,updateDoctorProffile)

// Hospital affiliation lifecycle
doctorRouter.post('/request-hospital',authDoctor,requestHospital)
doctorRouter.post('/leave-hospital',authDoctor,leaveHospital)
doctorRouter.get('/hospital-requests',authDoctor,getMyHospitalRequests)
doctorRouter.delete('/hospital-requests/:id',authDoctor,cancelMyHospitalRequest)
doctorRouter.patch('/hospital-requests/:id/respond',authDoctor,respondToInvite)

export default doctorRouter