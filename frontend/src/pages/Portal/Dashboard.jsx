import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  MessageSquare,
  Bell,
  ArrowRight,
  Clock,
  UserCircle,
  Stethoscope,
  Building2,
  Star,
  Lock,
  History,
  HeartPulse,
} from "lucide-react";
import { AppContext } from "../../context/AppContext";
import PortalLayout from "../../components/PortalLayout";
import PortalStatCard from "../../components/PortalStatCard";
import EmptyState from "../../components/EmptyState";
import StarRating from "../../components/StarRating";
import { deriveNotifications } from "../../utils/deriveNotifications";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatSlotDate = (slotDate) => {
  if (!slotDate) return "";
  const [d, m, y] = slotDate.split("_");
  return `${d} ${months[Number(m)]} ${y}`;
};

// Pixel-matches the Doctor/Hospital dashboards' section-card chrome (24px
// radius, #E2E8F0 border, same shadow, same header treatment) so every
// dashboard in the product reads as one system.
const SectionCard = ({ icon: Icon, iconColor = "#2563EB", title, action, children }) => (
  <div style={{ background: "#FFFFFF", borderRadius: 24, border: "1px solid #E2E8F0", boxShadow: "0 8px 24px rgba(15,23,42,0.04)", overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#F8FAFC" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon size={17} color={iconColor} />
        <p style={{ fontWeight: 700, color: "#0F172A", fontSize: 15, margin: 0 }}>{title}</p>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const ViewAllLink = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "#2563EB", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
  >
    View All <ArrowRight size={13} />
  </button>
);

// Lightweight completeness score — not a stored field, just how many of the
// optional profile sections (see MyProfile.jsx) the patient has actually
// filled in, so the hero can nudge them toward a fuller health profile.
const computeProfileCompletion = (userData) => {
  if (!userData) return 0;
  const checks = [
    !!userData.phone && userData.phone !== "000000000",
    !!userData.dob && userData.dob !== "Not Selected",
    !!userData.gender && userData.gender !== "Not Selected",
    !!userData.address?.line1,
    !!userData.bloodGroup,
    !!userData.emergencyContact?.name,
    !!(userData.medical?.allergies || userData.medical?.chronicDiseases || userData.medical?.medications),
    !!userData.insurance?.provider,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
};

const QuickLink = ({ icon: Icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-white hover:border-primary/30 hover:bg-primary-light/30 transition-all duration-200 text-left"
  >
    <span className="w-9 h-9 rounded-lg bg-gradient-card flex items-center justify-center flex-shrink-0">
      <Icon size={16} className="text-primary" />
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-semibold text-text-primary">{label}</span>
      <span className="block text-xs text-text-muted truncate">{description}</span>
    </span>
  </button>
);

const Dashboard = () => {
  const { backendUrl, token, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [apptRes, recordRes, reviewRes] = await Promise.all([
          axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } }),
          axios.get(`${backendUrl}/api/medical-records/mine`, { headers: { token } }),
          axios.get(`${backendUrl}/api/review/my-reviews`, { headers: { token } }),
        ]);
        if (apptRes.data.success) setAppointments(apptRes.data.appointments);
        if (recordRes.data.success) setRecords(recordRes.data.records);
        if (reviewRes.data.success) setReviews(reviewRes.data.reviews);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [backendUrl, token]);

  const upcoming = useMemo(
    () => appointments.filter((a) => !a.cancelled && !a.isCompleted).reverse(),
    [appointments]
  );
  const nextAppointment = upcoming[0];
  const completed = useMemo(() => appointments.filter((a) => a.isCompleted), [appointments]);
  const completedCount = completed.length;
  const lastCompleted = completed[completed.length - 1];
  const profileCompletion = useMemo(() => computeProfileCompletion(userData), [userData]);
  const notifications = useMemo(
    () => deriveNotifications({ appointments, records, reviews }),
    [appointments, records, reviews]
  );

  if (!userData) return null;

  return (
    <PortalLayout>
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-3xl p-7 sm:p-9 mb-7"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 75%, #14B8A6 100%)",
          boxShadow: "0 24px 60px rgba(15,23,42,0.28)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, rgba(20,184,166,0.20) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(37,99,235,0.20) 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 flex flex-wrap items-center gap-5">
          <img
            src={userData.image}
            alt={userData.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white/85 shadow-lg flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {userData.name?.split(" ")[0]}
            </h1>
            <p className="text-white/70 text-sm mt-1.5 max-w-md">
              {completedCount} completed appointment{completedCount !== 1 ? "s" : ""} · {records.length} medical record{records.length !== 1 ? "s" : ""} on file
            </p>
          </div>
        </div>

        {/* Health Profile Completion */}
        <div className="relative z-10 mt-6 max-w-sm">
          <div className="flex items-center justify-between text-xs text-white/65 mb-1.5">
            <span className="font-semibold">Health Profile Completion</span>
            <span className="font-bold text-white">{profileCompletion}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${profileCompletion}%`, background: "linear-gradient(90deg, #5EEAD4, #7DD3FC)" }}
            />
          </div>
          {profileCompletion < 100 && (
            <button
              onClick={() => navigate("/my-profile")}
              className="text-[11px] font-bold text-white/70 hover:text-white mt-1.5 flex items-center gap-1"
            >
              Complete your profile <ArrowRight size={10} />
            </button>
          )}
        </div>

        {/* Next appointment / last completed appointment */}
        {(nextAppointment || lastCompleted) && (
          <div className="relative z-10 mt-6 pt-5 border-t border-white/15 grid sm:grid-cols-2 gap-4">
            {nextAppointment && (
              <div className="flex items-center gap-3.5">
                <img
                  src={nextAppointment.docData?.image}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover border-2 border-white/60 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-white/55 text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock size={10} /> Next Appointment
                  </p>
                  <p className="text-white text-sm font-semibold mt-0.5 truncate">
                    {nextAppointment.docData?.name} · {formatSlotDate(nextAppointment.slotDate)}
                  </p>
                </div>
              </div>
            )}
            {lastCompleted && (
              <div className="flex items-center gap-3.5">
                <img
                  src={lastCompleted.docData?.image}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover border-2 border-white/60 flex-shrink-0 opacity-90"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-white/55 text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <History size={10} /> Last Completed
                  </p>
                  <p className="text-white text-sm font-semibold mt-0.5 truncate">
                    {lastCompleted.docData?.name} · {formatSlotDate(lastCompleted.slotDate)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-7">
        <PortalStatCard
          icon={CalendarDays}
          label="Upcoming"
          value={loading ? "…" : upcoming.length}
          accent={{ bg: "#EFF6FF", color: "#2563EB" }}
          onClick={() => navigate("/my-appointments")}
        />
        <PortalStatCard
          icon={CheckCircle2}
          label="Completed"
          value={loading ? "…" : completedCount}
          accent={{ bg: "#F0FDF4", color: "#16A34A" }}
          onClick={() => navigate("/my-appointments")}
        />
        <PortalStatCard
          icon={FileText}
          label="Medical Records"
          value={loading ? "…" : records.length}
          accent={{ bg: "#F0FDFA", color: "#0D9488" }}
          onClick={() => navigate("/medical-records")}
        />
        <PortalStatCard
          icon={MessageSquare}
          label="Reviews Written"
          value={loading ? "…" : reviews.length}
          accent={{ bg: "#FFFBEB", color: "#D97706" }}
          onClick={() => navigate("/reviews")}
        />
        <PortalStatCard
          icon={Bell}
          label="Notifications"
          value={loading ? "…" : notifications.length}
          accent={{ bg: "#FDF4FF", color: "#A21CAF" }}
          onClick={() => navigate("/notifications")}
        />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 mb-6 items-start">
        {/* Upcoming appointments */}
        <SectionCard icon={Clock} iconColor="#2563EB" title="Upcoming Appointments" action={<ViewAllLink onClick={() => navigate("/my-appointments")} />}>
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState compact icon={CalendarDays} title="No upcoming appointments" subtitle="Book a doctor and it'll show up here." />
          ) : (
            <div className="max-h-[380px] overflow-y-auto">
              {upcoming.slice(0, 6).map((item) => (
                <div key={item._id} className="flex items-center gap-3 px-6 py-3.5 border-b border-slate-50 last:border-b-0">
                  <img src={item.docData?.image} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{item.docData?.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{formatSlotDate(item.slotDate)} · {item.slotTime}</p>
                  </div>
                  <Badge variant="blue" className="text-[10px] flex-shrink-0">Upcoming</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Quick actions */}
        <div style={{ background: "#FFFFFF", borderRadius: 24, border: "1px solid #E2E8F0", boxShadow: "0 8px 24px rgba(15,23,42,0.04)", padding: 22 }}>
          <div className="flex items-center gap-2.5 mb-4">
            <Stethoscope size={17} className="text-primary" />
            <p style={{ fontWeight: 700, color: "#0F172A", fontSize: 15, margin: 0 }}>Quick Actions</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <QuickLink icon={UserCircle} label="View Profile" description="View & edit your information" onClick={() => navigate("/my-profile")} />
            <QuickLink icon={CalendarDays} label="Book Appointment" description="Schedule a new consultation" onClick={() => navigate("/doctors")} />
            <QuickLink icon={FileText} label="View Medical Records" description="Diagnoses, prescriptions & history" onClick={() => navigate("/medical-records")} />
            <QuickLink icon={Stethoscope} label="Find Doctors" description="Browse by speciality" onClick={() => navigate("/doctors")} />
            <QuickLink icon={Building2} label="Find Hospitals" description="Explore hospitals near you" onClick={() => navigate("/hospitals")} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6 items-start">
        {/* Medical records preview */}
        <SectionCard icon={FileText} iconColor="#0D9488" title="Recent Medical Records" action={<ViewAllLink onClick={() => navigate("/medical-records")} />}>
          {loading ? (
            <div className="p-6 animate-pulse space-y-3">
              <div className="h-14 bg-slate-100 rounded-xl" />
            </div>
          ) : records.length === 0 ? (
            <EmptyState compact icon={FileText} title="No records yet" subtitle="Records from completed appointments appear here." />
          ) : (
            <div>
              {records.slice(0, 3).map((record) => (
                <div key={record._id} className="flex items-center gap-3 px-6 py-3.5 border-b border-slate-50 last:border-b-0">
                  <span className="w-9 h-9 rounded-lg bg-gradient-card flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-primary" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{record.doctorId?.name}</p>
                    <p className="text-xs text-text-muted mt-0.5 truncate">{record.diagnosis || "No diagnosis recorded"}</p>
                  </div>
                  {record.status === "finalized" && <Lock size={13} className="text-amber-500 flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Notifications preview */}
        <SectionCard icon={Bell} iconColor="#A21CAF" title="Recent Notifications" action={<ViewAllLink onClick={() => navigate("/notifications")} />}>
          {loading ? (
            <div className="p-6 animate-pulse space-y-3">
              <div className="h-14 bg-slate-100 rounded-xl" />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState compact icon={Bell} title="You're all caught up" subtitle="New activity will show up here." />
          ) : (
            <div>
              {notifications.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-6 py-3.5 border-b border-slate-50 last:border-b-0">
                  <span className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Bell size={14} className="text-fuchsia-600" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{item.title}</p>
                    <p className="text-xs text-text-muted mt-0.5 truncate">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Health summary */}
      <div className="mb-6">
        <SectionCard icon={HeartPulse} iconColor="#DC2626" title="Health Summary" action={<ViewAllLink onClick={() => navigate("/my-profile")} />}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: "#F1F5F9" }}>
            {[
              { label: "Blood Group", value: userData.bloodGroup },
              { label: "Height / Weight", value: userData.medical?.height || userData.medical?.weight ? `${userData.medical?.height || "—"} / ${userData.medical?.weight || "—"}` : "" },
              { label: "Allergies", value: userData.medical?.allergies },
              { label: "Chronic Conditions", value: userData.medical?.chronicDiseases },
            ].map((f) => (
              <div key={f.label} style={{ background: "#FFFFFF", padding: "16px 20px" }}>
                <p className="text-[10.5px] font-bold text-text-muted uppercase tracking-wider mb-1">{f.label}</p>
                <p className="text-sm font-semibold text-text-primary truncate">{f.value || <span className="text-slate-300 font-normal">Not provided</span>}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Reviews preview */}
      <SectionCard icon={Star} iconColor="#D97706" title="My Reviews" action={<ViewAllLink onClick={() => navigate("/reviews")} />}>
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-14 rounded-xl" />
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState compact icon={MessageSquare} title="No reviews yet" subtitle="Reviews you write for doctors and hospitals show up here." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 1, background: "#F1F5F9" }}>
            {reviews.slice(0, 3).map((review) => {
              const target = review.doctorId || review.hospitalId;
              return (
                <div key={review._id} style={{ background: "#FFFFFF", padding: 20 }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-text-primary truncate">{target?.name || "Unknown"}</p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">{review.comment}</p>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </PortalLayout>
  );
};

export default Dashboard;
