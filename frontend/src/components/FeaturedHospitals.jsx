import React, { useCallback, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import StarRating from "./StarRating";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURED_COUNT = 6;

const HospitalCard = React.memo(({ item, onClick, doctorCount }) => {
  const city = item.address?.city;
  const departments = Array.isArray(item.departments) ? item.departments : [];

  return (
    <div
      onClick={() => onClick(item._id)}
      className="doc-card group flex flex-col h-full"
      role="button"
      tabIndex={0}
      aria-label={`View ${item.name}`}
      onKeyDown={(e) => e.key === "Enter" && onClick(item._id)}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-gradient-card overflow-hidden">
        <img
          src={item.logo || item.image}
          alt={item.name}
          loading="lazy"
          className="doc-img w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Hospital type badge */}
        {item.hospitalType && (
          <div className="absolute top-3 right-3">
            <Badge variant="blue">{item.hospitalType}</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors duration-200 leading-tight truncate">
          {item.name}
        </h3>
        <p className="text-xs text-text-muted mt-1 flex items-center gap-1 truncate min-h-[16px]">
          {city && (
            <>
              <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="truncate">{city}</span>
            </>
          )}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3 min-h-[26px]">
          {departments.slice(0, 3).map((d) => (
            <Badge key={d} variant="teal">{d}</Badge>
          ))}
          {departments.length > 3 && (
            <span className="text-[11px] text-text-muted self-center">+{departments.length - 3} more</span>
          )}
        </div>

        {/* Flexible spacer — absorbs leftover height so the footer below
            always sits flush against the bottom of the (equal-height) card. */}
        <div className="flex-1" />

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <StarRating rating={item.averageRating} size="sm" />
            <span className="text-xs font-semibold text-text-secondary">
              {item.totalReviews > 0 ? item.averageRating.toFixed(1) : "New"}
            </span>
          </div>

          {doctorCount > 0 && (
            <span className="text-[11px] text-text-muted">
              {doctorCount} Doctor{doctorCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <Button variant="gradient" size="sm" className="w-full mt-3">
          View Hospital
        </Button>
      </div>
    </div>
  );
});
HospitalCard.displayName = "HospitalCard";

const FeaturedHospitals = () => {
  const navigate = useNavigate();
  const { hospitals, doctors } = useContext(AppContext);

  // How many doctors are on staff at each hospital — derived client-side
  // from the already-loaded doctors list, no extra request needed.
  const doctorCountByHospital = useMemo(() => {
    const counts = {};
    doctors.forEach((d) => {
      const hospitalId = d.hospitalId?._id || d.hospitalId;
      if (!hospitalId) return;
      counts[hospitalId] = (counts[hospitalId] || 0) + 1;
    });
    return counts;
  }, [doctors]);

  // Highest-rated first (ties broken by review count), capped to a small
  // featured set.
  const featured = useMemo(() => (
    [...hospitals]
      .sort((a, b) => (b.averageRating - a.averageRating) || (b.totalReviews - a.totalReviews))
      .slice(0, FEATURED_COUNT)
  ), [hospitals]);

  const handleNavigate = useCallback(
    (id) => { navigate(`/hospital/${id}`); },
    [navigate]
  );

  const handleMoreHospitals = useCallback(() => {
    navigate("/hospitals");
    window.scrollTo(0, 0);
  }, [navigate]);

  // Nothing to show yet — don't render an empty/broken section
  if (!featured.length) return null;

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="section-tag">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            Top Rated Hospitals
          </span>
          <h2 className="section-title">Trusted Hospitals Near You</h2>
          <p className="section-subtitle">
            Our highest-rated hospitals by speciality, ratings, and location.
          </p>
        </div>
        <Button onClick={handleMoreHospitals} variant="brand-outline" className="flex-shrink-0">
          Explore Hospitals
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {featured.map((item) => (
          <HospitalCard
            key={item._id}
            item={item}
            onClick={handleNavigate}
            doctorCount={doctorCountByHospital[item._id] || 0}
          />
        ))}
      </div>
    </section>
  );
};

export default React.memo(FeaturedHospitals);
