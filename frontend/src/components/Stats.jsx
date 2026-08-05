import React, { useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import useInView from "../hooks/useInView";
import StatCard from "./StatCard";

// "Platform Numbers" — live counts pulled from the shared platformStats
// context value (fetched once in AppContext, no extra request here).
// Cards count up the first time the section scrolls into view.
const Stats = () => {
  const { platformStats } = useContext(AppContext);
  const [sectionRef, inView] = useInView(0.3);
  const active = inView && Boolean(platformStats);

  const stats = useMemo(() => ([
    { key: "patients", icon: "👥", value: platformStats?.totalPatients ?? 0, suffix: "+", label: "Registered Patients" },
    { key: "doctors", icon: "👨‍⚕️", value: platformStats?.totalDoctors ?? 0, suffix: "+", label: "Doctors" },
    { key: "hospitals", icon: "🏥", value: platformStats?.totalHospitals ?? 0, suffix: "+", label: "Hospitals" },
    { key: "appointments", icon: "📅", value: platformStats?.totalAppointments ?? 0, suffix: "+", label: "Appointments" },
    { key: "reviews", icon: "⭐", value: platformStats?.totalReviews ?? 0, suffix: "+", label: "Reviews" },
  ]), [platformStats]);

  return (
    <section ref={sectionRef} className="py-20 md:py-24 px-4 bg-gradient-section">
      <div className="text-center mb-14">
        <span className="section-tag">Platform Numbers</span>
        <h2 className="section-title">Growing Every Day</h2>
        <p className="section-subtitle mx-auto">
          Real numbers from the CuraLink platform, updated live.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 max-w-5xl mx-auto">
        {stats.map((s, i) => (
          <div key={s.key} className="animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <StatCard icon={s.icon} value={s.value} suffix={s.suffix} label={s.label} active={active} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(Stats);
