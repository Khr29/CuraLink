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
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Register = lazy(() => import("./pages/Register"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const MyAppointments = lazy(() => import("./pages/MyAppointments"));
const Dashboard = lazy(() => import("./pages/Portal/Dashboard"));
const MedicalRecordsPage = lazy(() => import("./pages/Portal/MedicalRecordsPage"));
const ReviewsPage = lazy(() => import("./pages/Portal/ReviewsPage"));
const NotificationsPage = lazy(() => import("./pages/Portal/NotificationsPage"));
const SettingsPage = lazy(() => import("./pages/Portal/SettingsPage"));

// Loading Spinner
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">

      <ToastContainer />

      {/* Site chrome (Navbar + routed pages) keeps its original constrained
          width; only the Footer breaks out to full browser width below —
          see Footer.jsx / the "detached footer" fix. */}
      <div className="mx-4 sm:mx-[10%] flex flex-col flex-1">
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

                {/* User Portal */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-profile" element={<MyProfile />} />
                <Route path="/medical-records" element={<MedicalRecordsPage />} />
                <Route path="/my-appointments" element={<MyAppointments />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Other */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

              </Routes>

            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <Footer />

    </div>
  );
};

export default App;