import React, { useCallback, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const HospitalCard = React.memo(({ item, onClick }) => {
  const deptCount = Array.isArray(item.departments)
    ? item.departments.length
    : (item.departments ?? item.departmentsCount ?? 0);

  return (
    <div
      onClick={() => onClick(item._id)}
      className="doc-card group"
      role="button"
      tabIndex={0}
      aria-label={`View ${item.name}`}
      onKeyDown={(e) => e.key === "Enter" && onClick(item._id)}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-gradient-card overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="doc-img w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Open / Closed badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${item.isOpen ? "badge-green" : "badge-slate"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${item.isOpen ? "bg-accent" : "bg-slate-400"}`} />
            {item.isOpen ? "Open Now" : "Closed"}
          </span>
        </div>

        {/* Hospital type badge */}
        {item.type && (
          <div className="absolute top-3 right-3">
            <span className="badge badge-blue">{item.type}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors duration-200 leading-tight">
          {item.name}
        </h3>
        {item.city && (
          <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {item.city}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-text-secondary">
              {item.rating ?? "4.7"}
            </span>
          </div>

          {deptCount > 0 && (
            <span className="text-[11px] text-text-muted">
              {deptCount} Dept{deptCount !== 1 ? "s" : ""}
            </span>
          )}

          <button className="text-[11px] font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full hover:bg-primary hover:text-white transition-all duration-200">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
});
HospitalCard.displayName = "HospitalCard";

const FeaturedHospitals = () => {
  const navigate = useNavigate();
  const { hospitals } = useContext(AppContext);
  const featured = useMemo(() => hospitals.slice(0, 8), [hospitals]);

  const handleNavigate = useCallback(
    (id) => { navigate(`/hospitals/${id}`); },
    [navigate]
  );

  const handleMoreHospitals = useCallback(() => {
    navigate("/hospitals");
    window.scrollTo(0, 0);
  }, [navigate]);

  // Nothing to show yet — don't render an empty/broken section
  if (!featured.length) return null;

  return (
    <section className="py-16 px-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="section-tag">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            Featured Hospitals
          </span>
          <h2 className="section-title">Trusted Hospitals Near You</h2>
          <p className="section-subtitle">
            Compare top-rated hospitals by speciality, ratings, and location.
          </p>
        </div>
        <button onClick={handleMoreHospitals} className="btn btn-secondary flex-shrink-0">
          Explore Hospitals
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featured.map((item) => (
          <HospitalCard key={item._id} item={item} onClick={handleNavigate} />
        ))}
      </div>
    </section>
  );
};

export default React.memo(FeaturedHospitals);