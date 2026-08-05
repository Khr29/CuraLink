import React, { useCallback, useMemo } from "react";
import { specialityData } from "../assets/assets";
import { Link } from "react-router-dom";

/* ─── Outline icon set ───────────────────────────────────────
   Consistent stroke width (1.8), no photos/avatars — matches
   the WhyChooseUs feature-card icon language. Any speciality
   not explicitly mapped falls back to a generic medical-cross
   icon, so this never breaks if specialityData changes. ───── */
const ICONS = {
  "General physician": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 10.5v3a3.75 3.75 0 007.5 0v-3M6 6.75h12M6 6.75a2.25 2.25 0 01-2.25-2.25V4.5h16.5v0A2.25 2.25 0 0118 6.75M6 6.75v3.75a6 6 0 0012 0V6.75M12 15.75V18m0 0h-2.25M12 18h2.25" />
    </svg>
  ),
  "Gynecologist": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a4.5 4.5 0 00-4.5 4.5c0 2.5 4.5 8 4.5 8s4.5-5.5 4.5-8A4.5 4.5 0 0012 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5V21m-3-2.5h6" />
    </svg>
  ),
  "Dermatologist": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75c0-1.657 1.007-3 2.25-3s2.25 1.343 2.25 3-1.007 3-2.25 3-2.25-1.343-2.25-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75c0-2.9 3.36-5.25 7.5-5.25s7.5 2.35 7.5 5.25c0 1.243-1.007 2.25-2.25 2.25-1.036 0-1.909-.7-2.166-1.65a3.001 3.001 0 00-5.667 0c-.257.95-1.13 1.65-2.167 1.65-1.243 0-2.25-1.007-2.25-2.25z" />
    </svg>
  ),
  "Pediatricians": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM15.75 9a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15.75c0 1.243 1.343 2.25 3 2.25s3-1.007 3-2.25" />
    </svg>
  ),
  "Neurologist": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 4.5a3 3 0 00-3 3v.375c-1.243.243-2.25 1.331-2.25 2.625 0 .627.234 1.2.62 1.636A2.624 2.624 0 004.5 14.25c0 1.243.9 2.28 2.084 2.483C6.79 18.03 8.03 19.5 9.75 19.5H12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 4.5a3 3 0 013 3v.375c1.243.243 2.25 1.331 2.25 2.625 0 .627-.234 1.2-.62 1.636.377.464.62 1.06.62 1.114 0 1.243-.9 2.28-2.084 2.483C17.21 18.03 15.97 19.5 14.25 19.5H12M12 4.5v15" />
    </svg>
  ),
  "Gastroenterologist": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6a3 3 0 013-3c1.657 0 3 1.28 3 3.375 0 1.06-.5 1.86-1.125 2.625M8.25 6c0 2.25 1.5 3.375 1.5 5.25 0 2.485-2.015 4.5-4.5 4.5S.75 13.735.75 11.25c0-1.283.6-2.4 1.5-3.15" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.125 6c1.593 0 2.625 1.007 2.625 2.625 0 3.375-3.375 3.375-3.375 6.75a3.375 3.375 0 006.75 0c0-1.5-.75-2.25-.75-3.75" />
    </svg>
  ),
};

const FALLBACK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.611L5 14.5" />
  </svg>
);

/* Restrained 3-tone rotation — matches WhyChooseUs, no random hues */
const COLORS = [
  { bg: "bg-primary-light", ring: "ring-blue-100", icon: "text-primary" },
  { bg: "bg-teal-50", ring: "ring-teal-100", icon: "text-teal-600" },
  { bg: "bg-sky-50", ring: "ring-sky-100", icon: "text-sky-600" },
  { bg: "bg-emerald-50", ring: "ring-emerald-100", icon: "text-emerald-600" },
];

const SpecialityMenu = () => {
  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const cards = useMemo(() =>
    specialityData.map((item, idx) => {
      const color = COLORS[idx % COLORS.length];
      const icon = ICONS[item.speciality] || FALLBACK_ICON;
      return (
        <Link
          key={item.speciality}
          to={`/doctors/${item.speciality}`}
          onClick={handleScrollTop}
          className="group flex flex-col items-center text-center gap-4 min-w-[168px] sm:min-w-[188px]
                     flex-shrink-0 bg-white border border-slate-100 rounded-2xl px-5 py-8
                     shadow-[0_4px_16px_rgba(15,23,42,0.05)]
                     hover:shadow-[0_18px_44px_rgba(37,99,235,0.12)]
                     hover:border-blue-100 hover:-translate-y-1.5
                     transition-all duration-300 animate-slide-up"
          style={{ animationDelay: `${idx * 0.06}s` }}
          aria-label={`Browse ${item.speciality} doctors`}
        >
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${color.bg} ring-1 ${color.ring}
                        flex items-center justify-center transition-transform duration-300
                        group-hover:scale-105`}
          >
            <span className={`w-10 h-10 sm:w-12 sm:h-12 ${color.icon}`}>
              {icon}
            </span>
          </div>

          <p className="text-sm sm:text-base font-bold text-text-primary leading-tight transition-colors duration-200 group-hover:text-primary">
            {item.speciality}
          </p>
        </Link>
      );
    }),
  [handleScrollTop]);

  return (
    <section id="speciality" className="py-20 md:py-24 px-4">
      {/* Heading */}
      <div className="text-center mb-12">
        <span className="section-tag">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Browse by Speciality
        </span>
        <h2 className="section-title">Find the Right Specialist</h2>
        <p className="section-subtitle mx-auto">
          Browse our network of expert doctors across 30+ specialities. Book an appointment in minutes.
        </p>
      </div>

      {/* Scrollable cards */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex sm:justify-center gap-6 sm:gap-7 pb-4 min-w-max sm:min-w-0 sm:flex-wrap">
          {cards}
        </div>
      </div>
    </section>
  );
};

export default React.memo(SpecialityMenu);