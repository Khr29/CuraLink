import React, { useContext, useEffect } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const VALUES = [
  {
    icon: "🔍",
    bg: "bg-teal-50 text-teal-700",
    title: "SMART DISCOVERY",
    desc: "Search doctors and hospitals by speciality, location, and rating, then book a verified slot in minutes.",
  },
  {
    icon: "🛡️",
    bg: "bg-sky-50 text-sky-700",
    title: "VERIFIED PROVIDERS",
    desc: "Every doctor and hospital on CuraLink goes through a verification review before appearing publicly.",
  },
  {
    icon: "🔒",
    bg: "bg-blue-50 text-blue-700",
    title: "SECURE BY DESIGN",
    desc: "Encrypted credentials, role-based access, and a full audit trail keep your medical records private.",
  },
];

const formatStat = (value, suffix = "") => {
  if (value === undefined || value === null) return "—";
  return `${value}${suffix}`;
};

const About = () => {
  const { platformStats, getPlatformStats } = useContext(AppContext);

  useEffect(() => {
    if (!platformStats) getPlatformStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    { value: formatStat(platformStats?.totalPatients), label: "Registered Patients" },
    { value: formatStat(platformStats?.totalVerifiedDoctors), label: "Verified Doctors" },
    { value: formatStat(platformStats?.totalActiveHospitals), label: "Active Hospitals" },
    { value: formatStat(platformStats?.totalSpecialties), label: "Specialities" },
    { value: formatStat(platformStats?.totalAppointments), label: "Appointments Booked" },
    { value: formatStat(platformStats?.totalReviews), label: "Patient Reviews" },
  ];

  return (
    <div className="py-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-14">
        <span className="section-tag">About Us</span>
        <h1 className="section-title">
          Healthcare, Simplified
          <span className="block gradient-text">and Always Within Reach</span>
        </h1>
        <p className="section-subtitle mx-auto mt-3">
          CuraLink is a digital healthcare platform connecting patients with verified doctors and hospitals — bringing appointment booking, provider discovery, and electronic medical records into one secure place.
        </p>
      </div>

      {/* Main section */}
      <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
        {/* Image */}
        <div className="w-full md:w-2/5 flex-shrink-0">
          <div className="relative rounded-3xl overflow-hidden shadow-card-lg">
            <img
              src={assets.about_image}
              alt="About CuraLink"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            {/* Floating badge — live count, not a fixed claim */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 shadow-card-md">
                <div className="w-12 h-12 bg-gradient-teal rounded-xl flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">
                  C
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">CuraLink Platform</p>
                  <p className="text-xs text-text-muted">
                    {formatStat(platformStats?.totalVerifiedDoctors)} verified doctors across {formatStat(platformStats?.totalActiveHospitals)} hospitals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="space-y-5 text-text-secondary text-sm leading-relaxed mb-8">
            <p>
              <strong className="text-text-primary">CuraLink's mission</strong> is to make quality healthcare accessible to everyone — removing the friction of phone-tag scheduling, paper records, and unverified providers that keep people from getting timely care.
            </p>
            <p>
              Our <strong className="text-text-primary">smart appointment booking</strong> shows real-time doctor availability so you book an actual open slot, not a request that waits on a callback. Every listed doctor and hospital has been through our{" "}
              <strong className="text-text-primary">provider verification</strong> workflow, and our{" "}
              <strong className="text-text-primary">hospital discovery</strong> tools let you compare facilities by speciality, department, and patient rating before you choose.
            </p>
            <p>
              Once you're a patient, your{" "}
              <strong className="text-text-primary">electronic medical records</strong> — diagnoses, prescriptions, and doctor's notes — stay attached to your account, viewable anytime, never re-entered from scratch at your next visit.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-gradient-card rounded-2xl p-6 border border-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-text-primary">A Secure Healthcare Platform</h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Every account is protected with encrypted passwords, short-lived sessions, and role-based access — patients see only their own records, doctors see only their own patients, and hospitals see only their own staff and data. It's the same modern digital-healthcare technology standard we'd want for our own families' records.
            </p>
          </div>

          {/* Stats — live, pulled from the platform's own data */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-extrabold gradient-text">{s.value}</p>
                <p className="text-xs text-text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <span className="section-tag">Our Values</span>
          <h2 className="section-title">Why Choose CuraLink?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map((v, i) => (
            <div key={v.title} className="feature-card text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`inline-flex w-14 h-14 rounded-2xl ${v.bg} text-2xl items-center justify-center mb-4`}>
                {v.icon}
              </div>
              <h3 className="text-base font-extrabold text-text-primary mb-2 tracking-wide">{v.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(About);
