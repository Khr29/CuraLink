import React, { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loaded components
const Home = lazy(() => import('./pages/Home'))
const Doctors = lazy(() => import('./pages/Doctors'))
const Login = lazy(() => import('./pages/Login'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const MyProfile = lazy(() => import('./pages/MyProfile'))
const MyAppointments = lazy(() => import('./pages/MyAppointments'))
const Appointments = lazy(() => import('./pages/Appointments'))

// Loading fallback component
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%] flex flex-col min-h-screen'>
      <ToastContainer />
      <Navbar />

      <main className='flex-grow'>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/doctors' element={<Doctors />} />
              <Route path='/doctors/:speciality' element={<Doctors />} />   
              <Route path='/login' element={<Login />} />
              <Route path='/about' element={<About />} />
              <Route path='/contact' element={<Contact />} />
              <Route path='/my-profile' element={<MyProfile />} />
              <Route path='/my-appointments' element={<MyAppointments />} />
              <Route path='/appointment/:docId' element={<Appointments />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  )
}

export default App