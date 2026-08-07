import React, { useContext, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { SearchX, ShieldCheck, SlidersHorizontal } from "lucide-react";
import StarRating from "../components/StarRating";
import EmptyState from "../components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const specialities = [
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist",
];

const DoctorCard = React.memo(({ item, onClick }) => (
  <div
    onClick={() => onClick(item._id)}
    className="doc-card group flex flex-col h-full"
    role="button"
    tabIndex={0}
    aria-label={`Book appointment with ${item.name}`}
    onKeyDown={(e) => e.key === "Enter" && onClick(item._id)}
  >
    <div className="relative w-full aspect-[4/5] bg-gradient-card overflow-hidden">
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        className="doc-img w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-3 left-3">
        <Badge variant={item.available ? "green" : "slate"}>
          <span className={`w-1.5 h-1.5 rounded-full ${item.available ? "bg-accent" : "bg-slate-400"}`} />
          {item.available ? "Available" : "Unavailable"}
        </Badge>
      </div>
    </div>
    <div className="p-4 flex flex-col flex-1">
      <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors leading-tight truncate flex items-center gap-1">
        {item.name}
        {item.verificationStatus === "verified" && (
          <ShieldCheck size={13} className="text-primary flex-shrink-0" aria-label="Verified doctor" />
        )}
      </h3>
      <p className="text-xs text-text-muted mt-1 truncate">{item.speciality}</p>
      <div className="flex-1" />
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <StarRating rating={item.averageRating} size="sm" />
          <span className="text-xs font-semibold text-text-secondary">
            {item.totalReviews > 0 ? item.averageRating.toFixed(1) : "New"}
          </span>
        </div>
        <Button variant="gradient" size="sm">
          View Profile
        </Button>
      </div>
    </div>
  </div>
));
DoctorCard.displayName = "DoctorCard";

const Doctors = () => {
  const { speciality } = useParams();
  const { doctors } = useContext(AppContext);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  const filteredDoctors = useMemo(() => {
    if (!speciality) return doctors;
    return doctors.filter((doc) => doc.speciality === speciality);
  }, [doctors, speciality]);

  const toggleFilter = useCallback(() => setShowFilter((p) => !p), []);

  const handleFilter = useCallback(
    (spec) => {
      if (spec === speciality) navigate("/doctors");
      else navigate(`/doctors/${spec}`);
      window.scrollTo(0, 0);
    },
    [navigate, speciality]
  );

  return (
    <div className="py-8 animate-fade-in">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="section-title">
          {speciality ? speciality : "All Doctors"}
        </h1>
        <p className="text-text-muted mt-2">
          {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""} available
          {speciality ? ` for ${speciality}` : ""}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar */}
        <aside className="sm:w-56 flex-shrink-0">
          {/* Mobile toggle */}
          <Button
            onClick={toggleFilter}
            variant={showFilter ? "gradient" : "brand-ghost"}
            size="sm"
            className="sm:hidden mb-4"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilter ? "Hide" : "Show"} Filters
          </Button>

          <div className={`flex-col gap-1 ${showFilter ? "flex" : "hidden sm:flex"}`}>
            <div className="profile-section mb-2">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Speciality</p>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => navigate("/doctors")}
                  className={`filter-pill ${!speciality ? "active" : ""}`}
                >
                  All Doctors
                </button>
                {specialities.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => handleFilter(spec)}
                    className={`filter-pill ${speciality === spec ? "active" : ""}`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Doctor grid */}
        <main className="flex-1 min-w-0">
          {filteredDoctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center">
              <EmptyState
                icon={SearchX}
                title="No Doctors Found"
                subtitle={<>We couldn't find any doctors for <strong>{speciality}</strong>. Try a different speciality.</>}
              />
              <Button onClick={() => navigate("/doctors")} variant="gradient" className="mt-2">
                View All Doctors
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDoctors.map((item) => (
                <DoctorCard
                  key={item._id}
                  item={item}
                  onClick={(id) => navigate(`/appointment/${id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default React.memo(Doctors);
