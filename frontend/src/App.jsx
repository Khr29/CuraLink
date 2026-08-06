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

      {/* Navbar spans the full browser width (like Footer) — it has its own
          internal max-w-7xl centering, so marketing pages look identical,
          but this is what lets its left edge line up with the Patient
          Portal's full-bleed sidebar (see PortalLayout.jsx) instead of
          leaving a mismatched notch in the top-left/top-right corners. */}
      <Navbar />

      {/* Automatically scroll to top on every page change */}
      <ScrollToTop />

      {/* Routed pages keep the marketing site's original constrained width;
          portal pages break back out to full-bleed themselves via
          PortalLayout. */}
      <div className="mx-4 sm:mx-[10%] flex flex-col flex-1">
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