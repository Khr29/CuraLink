import ProtectedRoute from './components/ProtectedRoute'
import React, { useContext, Suspense, lazy } from 'react'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import { ToastContainer } from 'react-toastify'
import { AdminContext } from './context/AdminContext'
import { DoctorContext } from './context/DoctorContext'
import { HospitalContext } from './context/HospitalContext'
import { PharmacyContext } from './context/PharmacyContext'
import PanelLayout from './components/PanelLayout'
import { Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy loaded Admin Pages
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AllAppointments = lazy(() => import('./pages/Admin/AllAppointments'))
const AddDoctor = lazy(() => import('./pages/Admin/AddDoctor'))
const DoctorsList = lazy(() => import('./pages/Admin/DoctorsList'))

const HospitalsList = lazy(() => import('./pages/Admin/HospitalsList'))
const UsersList = lazy(() => import('./pages/Admin/UsersList'))
const AdminDoctorRequests = lazy(() => import('./pages/Admin/DoctorRequests'))
const AddHospital = lazy(() => import('./pages/Admin/AddHospital'))
const DoctorReviews = lazy(() => import('./pages/Admin/DoctorReviews'))
const HospitalReviews = lazy(() => import('./pages/Admin/HospitalReviews'))
const AuditLogs = lazy(() => import('./pages/Admin/AuditLogs'))
const AdminPrescriptions = lazy(() => import('./pages/Admin/Prescriptions'))

// Lazy loaded Doctor Pages
const DoctorDashboard = lazy(() => import('./pages/Doctor/DoctorDashboard'))
const DoctorAppointment = lazy(() => import('./pages/Doctor/DoctorAppointment'))
const DoctorProfile = lazy(() => import('./pages/Doctor/DoctorProfile'))
const DoctorSchedule = lazy(() => import('./pages/Doctor/DoctorSchedule'))
const DoctorHospitalAffiliation = lazy(() => import('./pages/Doctor/HospitalAffiliation'))

// Lazy loaded Hospital Portal Pages
const HospitalDashboard = lazy(() => import('./pages/Hospital/HospitalDashboard'))
const HospitalDoctors = lazy(() => import('./pages/Hospital/HospitalDoctors'))
const HospitalPatients = lazy(() => import('./pages/Hospital/HospitalPatients'))
const HospitalPatientDetail = lazy(() => import('./pages/Hospital/HospitalPatientDetail'))
const HospitalDoctorRequests = lazy(() => import('./pages/Hospital/DoctorRequests'))
const HospitalAddDoctor = lazy(() => import('./pages/Hospital/HospitalAddDoctor'))
const HospitalEditDoctor = lazy(() => import('./pages/Hospital/HospitalEditDoctor'))
const HospitalDoctorSchedule = lazy(() => import('./pages/Hospital/HospitalDoctorSchedule'))
const HospitalDepartments = lazy(() => import('./pages/Hospital/HospitalDepartments'))
const HospitalAppointments = lazy(() => import('./pages/Hospital/HospitalAppointments'))
const HospitalMyReviews = lazy(() => import('./pages/Hospital/MyReviews'))
const HospitalGallery = lazy(() => import('./pages/Hospital/HospitalGallery'))
const HospitalProfile = lazy(() => import('./pages/Hospital/HospitalProfile'))
const HospitalSettings = lazy(() => import('./pages/Hospital/HospitalSettings'))

// Lazy loaded Pharmacy Portal Pages — a first-class role, not part of the
// Hospital Portal (own token/context/routes, same as Doctor/Hospital).
const PharmacyDashboard = lazy(() => import('./pages/Pharmacy/PharmacyDashboard'))
const PharmacyScan = lazy(() => import('./pages/Pharmacy/PharmacyScan'))
const PharmacyHistory = lazy(() => import('./pages/Pharmacy/PharmacyHistory'))
const PharmacyProfile = lazy(() => import('./pages/Pharmacy/PharmacyProfile'))
const PharmacySettings = lazy(() => import('./pages/Pharmacy/PharmacySettings'))

// Loading fallback component
const PageLoader = () => (
  <div className="flex justify-center items-center h-full min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB]"></div>
  </div>
);

const App = () => {

  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  const { hToken } = useContext(HospitalContext)
  const { pToken } = useContext(PharmacyContext)

  const isAdmin = !!aToken
  const isDoctor = !!dToken
  const isLoggedIn = isAdmin || isDoctor

  return (
  <div className='min-h-screen bg-gradient-to-br from-[#f8f9fd] to-[#eef1ff]'>
    <ToastContainer />

    <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
    <Routes>

      {/* Login */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin */}
      <Route path="/admin-dashboard" element={
        <ProtectedRoute token={aToken}><PanelLayout><Dashboard /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/all-appointments" element={
        <ProtectedRoute token={aToken}><PanelLayout><AllAppointments /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/add-doctor" element={
        <ProtectedRoute token={aToken}><PanelLayout><AddDoctor /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/doctor-list" element={
        <ProtectedRoute token={aToken}><PanelLayout><DoctorsList /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/add-hospital" element={
        <ProtectedRoute token={aToken}><PanelLayout><AddHospital /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-list" element={
        <ProtectedRoute token={aToken}><PanelLayout><HospitalsList /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/doctor-reviews" element={
        <ProtectedRoute token={aToken}><PanelLayout><DoctorReviews /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-reviews" element={
        <ProtectedRoute token={aToken}><PanelLayout><HospitalReviews /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/doctor-requests" element={
        <ProtectedRoute token={aToken}><PanelLayout><AdminDoctorRequests /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/user-list" element={
        <ProtectedRoute token={aToken}><PanelLayout><UsersList /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/admin-prescriptions" element={
        <ProtectedRoute token={aToken}><PanelLayout><AdminPrescriptions /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/audit-logs" element={
        <ProtectedRoute token={aToken}><PanelLayout><AuditLogs /></PanelLayout></ProtectedRoute>
      } />

      {/* Doctor */}
      <Route path="/doctor-dashboard" element={
        <ProtectedRoute token={dToken}><PanelLayout><DoctorDashboard /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/doctor-appointments" element={
        <ProtectedRoute token={dToken}><PanelLayout><DoctorAppointment /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/doctor-profile" element={
        <ProtectedRoute token={dToken}><PanelLayout><DoctorProfile /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/doctor-schedule" element={
        <ProtectedRoute token={dToken}><PanelLayout><DoctorSchedule /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/doctor-hospital-affiliation" element={
        <ProtectedRoute token={dToken}><PanelLayout><DoctorHospitalAffiliation /></PanelLayout></ProtectedRoute>
      } />

      {/* Hospital Portal */}
      <Route path="/hospital-dashboard" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalDashboard /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-my-doctors" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalDoctors /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-patients" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalPatients /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-patients/:patientId" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalPatientDetail /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-doctor-requests" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalDoctorRequests /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-add-doctor" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalAddDoctor /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-edit-doctor/:doctorId" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalEditDoctor /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-doctor-schedule/:doctorId" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalDoctorSchedule /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-departments" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalDepartments /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-appointments" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalAppointments /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-my-reviews" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalMyReviews /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-gallery" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalGallery /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-profile" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalProfile /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/hospital-settings" element={
        <ProtectedRoute token={hToken}><PanelLayout><HospitalSettings /></PanelLayout></ProtectedRoute>
      } />

      {/* Pharmacy Portal — first-class role, own token/context, not nested under Hospital */}
      <Route path="/pharmacy-dashboard" element={
        <ProtectedRoute token={pToken}><PanelLayout><PharmacyDashboard /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/pharmacy-scan" element={
        <ProtectedRoute token={pToken}><PanelLayout><PharmacyScan /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/pharmacy-history" element={
        <ProtectedRoute token={pToken}><PanelLayout><PharmacyHistory /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/pharmacy-profile" element={
        <ProtectedRoute token={pToken}><PanelLayout><PharmacyProfile /></PanelLayout></ProtectedRoute>
      } />

      <Route path="/pharmacy-settings" element={
        <ProtectedRoute token={pToken}><PanelLayout><PharmacySettings /></PanelLayout></ProtectedRoute>
      } />

    </Routes>
    </Suspense>
    </ErrorBoundary>
  </div>
)
}

export default App

