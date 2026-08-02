import React, { useCallback, useMemo } from "react";
import { specialityData } from "../assets/assets";
import { Link } from "react-router-dom";

const ICONS = {
  "General physician": "🩺",
  "Gynecologist": "👩‍⚕️",
  "Dermatologist": "🧴",
  "Pediatricians": "👶",
  "Neurologist": "🧠",
  "Gastroenterologist": "🫁",
};

const COLORS = [
  { bg: "bg-teal-50", ring: "ring-teal-200", icon: "text-teal-600", hover: "group-hover:bg-teal-100" },
  { bg: "bg-sky-50", ring: "ring-sky-200", icon: "text-sky-600", hover: "group-hover:bg-sky-100" },
  { bg: "bg-violet-50", ring: "ring-violet-200", icon: "text-violet-600", hover: "group-hover:bg-violet-100" },
  { bg: "bg-pink-50", ring: "ring-pink-200", icon: "text-pink-600", hover: "group-hover:bg-pink-100" },
  { bg: "bg-amber-50", ring: "ring-amber-200", icon: "text-amber-600", hover: "group-hover:bg-amber-100" },
  { bg: "bg-green-50", ring: "ring-green-200", icon: "text-green-600", hover: "group-hover:bg-green-100" },
];

const SpecialityMenu = () => {
  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const cards = useMemo(() =>
    specialityData.map((item, idx) => {
      const color = COLORS[idx % COLORS.length];
      return (
        <Link
          key={item.speciality}
          to={`/doctors/${item.speciality}`}
          onClick={handleScrollTop}
          className="group flex flex-col items-center gap-3 min-w-[130px] sm:min-w-[150px] cursor-pointer flex-shrink-0 animate-slide-up"
          style={{ animationDelay: `${idx * 0.07}s` }}
          aria-label={`Browse ${item.speciality} doctors`}
        >
          {/* Icon circle */}
          <div
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${color.bg} ring-2 ${color.ring} ring-offset-1
            flex items-center justify-center transition-all duration-300
            group-hover:scale-110 group-hover:shadow-card-md group-hover:ring-offset-2`}
          >
            {/* emoji fallback if image fails */}
            <img
              src={item.image}
              alt={item.speciality}
              loading="lazy"
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <span
              className={`hidden text-3xl w-full h-full items-center justify-center ${color.icon}`}
            >
              {ICONS[item.speciality] || "🏥"}
            </span>

            {/* hover glow */}
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${color.hover}`} />
          </div>

          {/* Label */}
          <p className="text-xs sm:text-sm font-semibold text-text-secondary text-center leading-tight transition-colors duration-200 group-hover:text-primary">
            {item.speciality}
          </p>
        </Link>
      );
    }),
  [handleScrollTop]);

  return (
    <section id="speciality" className="py-16 px-4">
      {/* Heading */}
      <div className="text-center mb-10">
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
        <div className="flex sm:justify-center gap-5 sm:gap-6 pb-4 min-w-max sm:min-w-0 sm:flex-wrap">
          {cards}
        </div>
      </div>
    </section>
  );
};

export default React.memo(SpecialityMenu);