import React, { Suspense, lazy, useContext } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PortalTopBar from "./components/PortalTopBar";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppContext } from "./context/AppContext";

// Authenticated Patient Portal routes (every page wrapped in PortalLayout —
// see components/PortalLayout.jsx) get their own application-style shell
// instead of the public marketing site's Navbar+Footer, so the portal reads
// as its own product (same idea as the Doctor/Hospital/Pharmacy admin app
// shells) rather than a dashboard bolted onto the public website. Public
// pages (Home, Doctors, Hospitals, About, Contact, auth, the public /verify
// page) are completely untouched.
const PORTAL_PATH_PREFIXES = [
  "/dashboard",
  "/my-profile",
  "/medical-records",
  "/prescriptions",
  "/my-appointments",
  "/reviews",
  "/notifications",
  "/settings",
];

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
const PrescriptionsPage = lazy(() => import("./pages/Portal/PrescriptionsPage"));
const ReviewsPage = lazy(() => import("./pages/Portal/ReviewsPage"));
const NotificationsPage = lazy(() => import("./pages/Portal/NotificationsPage"));
const SettingsPage = lazy(() => import("./pages/Portal/SettingsPage"));
const VerifyPrescription = lazy(() => import("./pages/VerifyPrescription"));

// Loading Spinner
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  const location = useLocation();
  const { token } = useContext(AppContext);
  const isPortalRoute = PORTAL_PATH_PREFIXES.some((p) => location.pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen">

      <ToastContainer />

      {/* Navbar spans the full browser width (like Footer) — it has its own
          internal max-w-7xl centering, so marketing pages look identical,
          but this is what lets its left edge line up with the Patient
          Portal's full-bleed sidebar (see PortalLayout.jsx) instead of
          leaving a mismatched notch in the top-left/top-right corners.
          Portal routes get PortalTopBar instead — no public nav links, no
          duplicate "account menu" navigation (PortalSidebar is the one
          navigation surface there). */}
      {isPortalRoute ? <PortalTopBar /> : <Navbar />}

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

                {/* User Portal — every route requires a token, so an expired/
                    missing session redirects to /login immediately instead of
                    rendering a page that spins or blanks forever waiting on
                    data that will never arrive. */}
                <Route path="/dashboard" element={<ProtectedRoute token={token}><Dashboard /></ProtectedRoute>} />
                <Route path="/my-profile" element={<ProtectedRoute token={token}><MyProfile /></ProtectedRoute>} />
                <Route path="/medical-records" element={<ProtectedRoute token={token}><MedicalRecordsPage /></ProtectedRoute>} />
                <Route path="/prescriptions" element={<ProtectedRoute token={token}><PrescriptionsPage /></ProtectedRoute>} />
                <Route path="/my-appointments" element={<ProtectedRoute token={token}><MyAppointments /></ProtectedRoute>} />
                <Route path="/reviews" element={<ProtectedRoute token={token}><ReviewsPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute token={token}><NotificationsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute token={token}><SettingsPage /></ProtectedRoute>} />

                {/* Public prescription verification */}
                <Route path="/verify/:token" element={<VerifyPrescription />} />

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

      {!isPortalRoute && <Footer />}

    </div>
  );
};

export default App;