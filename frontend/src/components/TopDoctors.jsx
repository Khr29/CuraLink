import React, { useCallback, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const DoctorCard = React.memo(({ item, onClick }) => (
  <div
    onClick={() => onClick(item._id)}
    className="doc-card group"
    role="button"
    tabIndex={0}
    aria-label={`Book appointment with ${item.name}`}
    onKeyDown={(e) => e.key === "Enter" && onClick(item._id)}
  >
    {/* Image */}
    <div className="relative w-full aspect-[4/5] bg-gradient-card overflow-hidden">
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        className="doc-img w-full h-full object-cover"
      />
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      {/* Availability badge */}
      <div className="absolute top-3 left-3">
        <span className={`badge ${item.available ? "badge-green" : "badge-slate"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${item.available ? "bg-accent" : "bg-slate-400"}`} />
          {item.available ? "Available" : "Unavailable"}
        </span>
      </div>
    </div>

    {/* Content */}
    <div className="p-4">
      <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors duration-200 leading-tight">
        {item.name}
      </h3>
      <p className="text-xs text-text-muted mt-1">{item.speciality}</p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-semibold text-text-secondary">4.8</span>
        </div>
        <button className="text-[11px] font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full hover:bg-primary hover:text-white transition-all duration-200">
          Book Now
        </button>
      </div>
    </div>
  </div>
));
DoctorCard.displayName = "DoctorCard";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);
  const topDoctors = useMemo(() => doctors.slice(0, 10), [doctors]);

  const handleNavigate = useCallback(
    (id) => { navigate(`/appointment/${id}`); },
    [navigate]
  );

  const handleMoreDoctors = useCallback(() => {
    navigate("/doctors");
    window.scrollTo(0, 0);
  }, [navigate]);

  return (
    <section className="py-16 px-4">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="section-tag">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            Top Rated Doctors
          </span>
          <h2 className="section-title">Meet Our Best Doctors</h2>
          <p className="section-subtitle">
            Verified specialists with years of experience, ready to help you.
          </p>
        </div>
        <button
          onClick={handleMoreDoctors}
          className="btn btn-secondary flex-shrink-0"
        >
          View All Doctors
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
        {topDoctors.map((item) => (
          <DoctorCard key={item._id} item={item} onClick={handleNavigate} />
        ))}
      </div>
    </section>
  );
};

export default React.memo(TopDoctors);