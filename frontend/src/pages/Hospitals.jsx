import React, { useContext, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Building2 } from "lucide-react";
import StarRating from "../components/StarRating";
import EmptyState from "../components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const departments = [
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Oncology",
  "Dermatology",
  "General Medicine",
  "ENT",
  "Urology",
  "Ophthalmology",
  "Gastroenterology",
  "Pulmonology",
];

const HospitalCard = ({ item }) => {
  const navigate = useNavigate();

  const handleView = (e) => {
    e.stopPropagation();
    navigate(`/hospital/${item._id}`);
  };

  return (
    <div
      onClick={() => navigate(`/hospital/${item._id}`)}
      className="doc-card group cursor-pointer flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/5] bg-gradient-card overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="doc-img w-full h-full object-cover"
        />


        <div className="absolute top-3 left-3">
          <Badge variant={item.active ? "green" : "slate"} className="px-4 py-2 h-auto text-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${item.active ? "bg-green-500" : "bg-gray-400"}`} />
            {item.active ? "OPEN" : "CLOSED"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">

        <h3 className="text-sm font-bold text-text-primary truncate">
          {item.name}
        </h3>

        <p className="text-xs text-text-muted mt-1 truncate">
          📍 {item.address?.city}, {item.address?.state}
        </p>

        <p className="text-xs text-text-muted mt-2">
          🩺 {item.departments?.length || 0} Departments
        </p>

        <div className="flex-1" />

        {/* Bottom */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">




          <div className="flex items-center gap-1.5">

            <StarRating rating={item.averageRating} size="sm" />

            <span className="text-sm font-semibold text-text-secondary">
              {item.totalReviews > 0 ? item.averageRating.toFixed(1) : "New"}
            </span>

          </div>

          <Button onClick={handleView} variant="gradient" size="sm">
            View Details
          </Button>

        </div>

      </div>
    </div>
  );
};

const Hospitals = () => {

  const { hospitals } = useContext(AppContext);

  const [showFilter, setShowFilter] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState("");

  const filteredHospitals = useMemo(() => {

  if (!selectedDepartment) return hospitals;

  return hospitals.filter((hospital) =>
    hospital.departments?.includes(selectedDepartment)
  );

}, [hospitals, selectedDepartment]);

  const toggleFilter = useCallback(() => {
    setShowFilter((prev) => !prev);
  }, []);

  return (

    <div className="py-8 animate-fade-in">

      {/* Header */}

      <div className="mb-8">

        <h1 className="section-title">

          All Hospitals

        </h1>

        <p className="text-text-muted mt-2">

          {filteredHospitals.length} hospital
          {filteredHospitals.length !== 1 ? "s" : ""} available

        </p>

      </div>

      <div className="flex flex-col sm:flex-row gap-6">

        {/* Sidebar */}

        <aside className="sm:w-56 flex-shrink-0">

          <Button
            onClick={toggleFilter}
            variant={showFilter ? "gradient" : "brand-ghost"}
            size="sm"
            className="sm:hidden mb-4"
          >
            {showFilter ? "Hide" : "Show"} Filters
          </Button>

          <div
            className={`${
              showFilter ? "flex" : "hidden sm:flex"
            } flex-col gap-1`}
          >

            <div className="profile-section mb-2">

              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">

                Departments

              </p>

              <div className="flex flex-col gap-1.5">

                <button
                  onClick={() => setSelectedDepartment("")}
                  className={`filter-pill ${
                    selectedDepartment === "" ? "active" : ""
                  }`}
                >
                  All Hospitals
                </button>

                {departments.map((department) => (

                  <button
                    key={department}
                    onClick={() => setSelectedDepartment(department)}
                    className={`filter-pill ${
                      selectedDepartment === department ? "active" : ""
                    }`}
                  >
                    {department}
                  </button>

                ))}

              </div>

            </div>

          </div>

        </aside>

        {/* Hospital Grid */}

        <main className="flex-1 min-w-0">

          {filteredHospitals.length === 0 ? (

            <div className="flex flex-col items-center justify-center text-center">

            <EmptyState
              icon={Building2}
              title="No Hospitals Found"
              subtitle={<>We couldn't find any hospitals for{" "}<strong>{selectedDepartment}</strong>. Try a different departments.</>}
            />

            <Button onClick={() => setSelectedDepartment("")} variant="gradient" className="mt-2">
              View All Hospitals
            </Button>

          </div>

          ) : (

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

              {filteredHospitals.map((hospital) => (

                <HospitalCard
                  key={hospital._id}
                  item={hospital}
                />

              ))}

            </div>

          )}

        </main>

      </div>

    </div>

  );

};

export default Hospitals;