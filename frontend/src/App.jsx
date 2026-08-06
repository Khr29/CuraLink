import React, { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";

// Lazy loaded pages
const Home = lazy(() => import("./pages/Home"));
const Doctors = lazy(() => import("./pages/Doctors"));
const Hospitals = lazy(() => import("./pages/Hospitals"));
const HospitalDetails = lazy(() => import("./pages/HospitalDetails"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const MyAppointments = lazy(() => import("./pages/MyAppointments"));

// Loading Spinner
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  return (
    <div className="mx-4 sm:mx-[10%] flex flex-col min-h-screen">

      <ToastContainer />

      <Navbar />

      {/* Automatically scroll to top on every page change */}
      <ScrollToTop />

      <main className="flex-grow">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>

            <Routes>

              {/* Home */}
              <Route path="/" element={<Home />} />

              {/* Doctors */}
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/doctors/:speciality" element={<Doctors />} />
              <Route path="/appointment/:docId" element={<Appointments />} />

              {/* Hospitals */}
              <Route path="/hospitals" element={<Hospitals />} />
              <Route
                path="/hospital/:hospitalId"
                element={<HospitalDetails />}
              />

              {/* User */}
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/my-appointments" element={<MyAppointments />} />

              {/* Other */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

            </Routes>

          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />

    </div>
  );
};

export default App;