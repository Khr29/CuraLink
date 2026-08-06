// import React from 'react'
// import Login from './pages/Login'
// import { ToastContainer, toast } from 'react-toastify';
// import { useContext } from 'react';
// import { AdminContext } from './context/AdminContext';
// import Navbar from './components/Navbar';
// import SideBar from './components/SideBar';
// import { Route, Routes } from 'react-router-dom';
// import Dashboard from './pages/Admin/Dashboard';
// import AllAppointments from './pages/Admin/AllAppointments';
// import AddDoctor from './pages/Admin/AddDoctor';
// import DoctorsList from './pages/Admin/DoctorsList';
// import { DoctorContext } from './context/DoctorContext';
// import DoctorDashboard from './pages/Doctor/DoctorDashboard';
// import DoctorAppointment from './pages/Doctor/DoctorAppointment';
// import DoctorProfile from './pages/Doctor/DoctorProfile';

// const App = () => {

//   const { aToken } = useContext(AdminContext)

//   const { dToken } = useContext(DoctorContext)

//   return aToken || dToken ? (
//     <div className='bg-[#F8F9FD]'>
//       <ToastContainer />
//       <Navbar />
//       <div className='flex items-start'>
//         <SideBar />
//         {/* admin route  */}
//         <Routes>
//           <Route path='/' element={<></>} />
//           <Route path='/admin-dashboard' element={<Dashboard />} />
//           <Route path='/all-appointments' element={<AllAppointments />} />
//           <Route path='/add-doctor' element={<AddDoctor />} />
//           <Route path='/doctor-list' element={<DoctorsList />} />

//           {/* doctor Route  */}
//           <Route path='/doctor-dashboard' element={<DoctorDashboard />}/>
//           <Route path='/doctor-appointments' element={<DoctorAppointment />}/>
//           <Route path='/doctor-profile' element={<DoctorProfile />}/>
          

//         </Routes>
//       </div>
//     </div>
//   ) : (
//     <>
//       <Login />
//       <ToastContainer />
//     </>

//   )
// }

// export default App


import ProtectedRoute from './components/ProtectedRoute'
import React, { useContext, Suspense, lazy } from 'react'
import Login from './pages/Login'
import { ToastContainer } from 'react-toastify'
import { AdminContext } from './context/AdminContext'
import { DoctorContext } from './context/DoctorContext'
import { HospitalContext } from './context/HospitalContext'
import Navbar from './components/Navbar'
import SideBar from './components/SideBar'
import { Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'

// Lazy loaded Admin Pages
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'))
const AllAppointments = lazy(() => import('./pages/Admin/AllAppointments'))
const AddDoctor = lazy(() => import('./pages/Admin/AddDoctor'))
const DoctorsList = lazy(() => import('./pages/Admin/DoctorsList'))

const HospitalsList = lazy(() => import('./pages/Admin/HospitalsList'))
const AddHospital = lazy(() => import('./pages/Admin/AddHospital'))
const DoctorReviews = lazy(() => import('./pages/Admin/DoctorReviews'))
const HospitalReviews = lazy(() => import('./pages/Admin/HospitalReviews'))
const AuditLogs = lazy(() => import('./pages/Admin/AuditLogs'))

// Lazy loaded Doctor Pages
const DoctorDashboard = lazy(() => import('./pages/Doctor/DoctorDashboard'))
const DoctorAppointment = lazy(() => import('./pages/Doctor/DoctorAppointment'))
const DoctorProfile = lazy(() => import('./pages/Doctor/DoctorProfile'))

// Lazy loaded Hospital Portal Pages
const HospitalDashboard = lazy(() => import('./pages/Hospital/HospitalDashboard'))
const HospitalDoctors = lazy(() => import('./pages/Hospital/HospitalDoctors'))
const HospitalAddDoctor = lazy(() => import('./pages/Hospital/HospitalAddDoctor'))
const HospitalEditDoctor = lazy(() => import('./pages/Hospital/HospitalEditDoctor'))
const HospitalDepartments = lazy(() => import('./pages/Hospital/HospitalDepartments'))
const HospitalAppointments = lazy(() => import('./pages/Hospital/HospitalAppointments'))
const HospitalMyReviews = lazy(() => import('./pages/Hospital/MyReviews'))
const HospitalGallery = lazy(() => import('./pages/Hospital/HospitalGallery'))
const HospitalProfile = lazy(() => import('./pages/Hospital/HospitalProfile'))
const HospitalSettings = lazy(() => import('./pages/Hospital/HospitalSettings'))

// Loading fallback component
const PageLoader = () => (
  <div className="flex justify-center items-center h-full min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5F6FFF]"></div>
  </div>
);

const App = () => {

  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  const { hToken } = useContext(HospitalContext)

  const isAdmin = !!aToken
  const isDoctor = !!dToken
  const isLoggedIn = isAdmin || isDoctor

  return (
  <div className='min-h-screen bg-gradient-to-br from-[#f8f9fd] to-[#eef1ff]'>
    <ToastContainer />

    <Routes>

      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Admin */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute token={aToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto h-[calc(100vh-70px)]">
                  <Dashboard />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/all-appointments"
        element={
          <ProtectedRoute token={aToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <AllAppointments />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-doctor"
        element={
          <ProtectedRoute token={aToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <AddDoctor />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor-list"
        element={
          <ProtectedRoute token={aToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <DoctorsList />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
  path="/add-hospital"
  element={
    <ProtectedRoute token={aToken}>
      <>
        <Navbar />
        <div className="flex">
          <SideBar />
          <div className="flex-1 p-4 sm:p-6 md:p-8">
            <AddHospital />
          </div>
        </div>
      </>
    </ProtectedRoute>
  }
/>

<Route
  path="/hospital-list"
  element={
    <ProtectedRoute token={aToken}>
      <>
        <Navbar />
        <div className="flex">
          <SideBar />
          <div className="flex-1 p-4 sm:p-6 md:p-8">
            <HospitalsList />
          </div>
        </div>
      </>
    </ProtectedRoute>
  }
/>

<Route
  path="/doctor-reviews"
  element={
    <ProtectedRoute token={aToken}>
      <>
        <Navbar />
        <div className="flex">
          <SideBar />
          <div className="flex-1 p-4 sm:p-6 md:p-8">
            <DoctorReviews />
          </div>
        </div>
      </>
    </ProtectedRoute>
  }
/>

<Route
  path="/hospital-reviews"
  element={
    <ProtectedRoute token={aToken}>
      <>
        <Navbar />
        <div className="flex">
          <SideBar />
          <div className="flex-1 p-4 sm:p-6 md:p-8">
            <HospitalReviews />
          </div>
        </div>
      </>
    </ProtectedRoute>
  }
/>

<Route
  path="/audit-logs"
  element={
    <ProtectedRoute token={aToken}>
      <>
        <Navbar />
        <div className="flex">
          <SideBar />
          <div className="flex-1 p-4 sm:p-6 md:p-8">
            <AuditLogs />
          </div>
        </div>
      </>
    </ProtectedRoute>
  }
/>

      {/* Doctor */}
      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute token={dToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto h-[calc(100vh-70px)]">
                  <DoctorDashboard />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor-appointments"
        element={
          <ProtectedRoute token={dToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <DoctorAppointment />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor-profile"
        element={
          <ProtectedRoute token={dToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <DoctorProfile />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      {/* Hospital Portal */}
      <Route
        path="/hospital-dashboard"
        element={
          <ProtectedRoute token={hToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto h-[calc(100vh-70px)]">
                  <HospitalDashboard />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital-my-doctors"
        element={
          <ProtectedRoute token={hToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <HospitalDoctors />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital-add-doctor"
        element={
          <ProtectedRoute token={hToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <HospitalAddDoctor />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital-edit-doctor/:doctorId"
        element={
          <ProtectedRoute token={hToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <HospitalEditDoctor />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital-departments"
        element={
          <ProtectedRoute token={hToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <HospitalDepartments />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital-appointments"
        element={
          <ProtectedRoute token={hToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <HospitalAppointments />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital-my-reviews"
        element={
          <ProtectedRoute token={hToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <HospitalMyReviews />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital-gallery"
        element={
          <ProtectedRoute token={hToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <HospitalGallery />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital-profile"
        element={
          <ProtectedRoute token={hToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <HospitalProfile />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital-settings"
        element={
          <ProtectedRoute token={hToken}>
            <>
              <Navbar />
              <div className="flex">
                <SideBar />
                <div className="flex-1 p-4 sm:p-6 md:p-8">
                  <HospitalSettings />
                </div>
              </div>
            </>
          </ProtectedRoute>
        }
      />

    </Routes>
  </div>
)
}

export default App