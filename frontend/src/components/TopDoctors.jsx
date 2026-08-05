import React, { useCallback, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import StarRating from "./StarRating";

const FEATURED_COUNT = 6;

const DoctorCard = React.memo(({ item, onClick }) => (
  <div
    onClick={() => onClick(item._id)}
    className="doc-card group"
    role="button"
    tabIndex={0}
    aria-label={`View profile for ${item.name}`}
    onKeyDown={(e) => e.key === "Enter" && onClick(item._id)}
  >
    {/* Image */}
    <div className="relative w-full aspect-[16/10] bg-gradient-card overflow-hidden">
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
      {item.hospitalId?.name && (
        <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1 truncate">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15" />
          </svg>
          <span className="truncate">{item.hospitalId.name}</span>
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <StarRating rating={item.averageRating} size="sm" />
          <span className="text-xs font-semibold text-text-secondary">
            {item.totalReviews > 0 ? item.averageRating.toFixed(1) : "New"}
          </span>
        </div>
        {item.experience && (
          <span className="text-[11px] text-text-muted">{item.experience}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <span className="text-sm font-bold text-text-primary">
          ${item.fees}
          <span className="text-[11px] font-medium text-text-muted"> /visit</span>
        </span>
        <button className="text-[11px] font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full hover:bg-primary hover:text-white transition-all duration-200">
          View Profile
        </button>
      </div>
    </div>
  </div>
));
DoctorCard.displayName = "DoctorCard";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors } = useContext(AppContext);

  // Highest-rated first (ties broken by review count), capped to a small
  // featured set rather than the whole list.
  const topDoctors = useMemo(() => (
    [...doctors]
      .sort((a, b) => (b.averageRating - a.averageRating) || (b.totalReviews - a.totalReviews))
      .slice(0, FEATURED_COUNT)
  ), [doctors]);

  const handleNavigate = useCallback(
    (id) => { navigate(`/appointment/${id}`); },
    [navigate]
  );

  const handleMoreDoctors = useCallback(() => {
    navigate("/doctors");
    window.scrollTo(0, 0);
  }, [navigate]);

  if (!topDoctors.length) return null;

  return (
    <section className="py-16 md:py-20 px-4">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="section-tag">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            Featured Doctors
          </span>
          <h2 className="section-title">Meet Our Best Doctors</h2>
          <p className="section-subtitle">
            Our highest-rated, verified specialists — ready to help you.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {topDoctors.map((item) => (
          <DoctorCard key={item._id} item={item} onClick={handleNavigate} />
        ))}
      </div>
    </section>
  );
};

export default React.memo(TopDoctors);
