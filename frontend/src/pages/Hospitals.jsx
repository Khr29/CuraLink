import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const HospitalCard = ({ item }) => {
  const navigate = useNavigate();

  const handleView = (e) => {
    e.stopPropagation();
    navigate(`/hospital/${item._id}`);
  };

  return (
    <div
      onClick={() => navigate(`/hospital/${item._id}`)}
      className="doc-card group cursor-pointer"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/5] bg-gradient-card overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="doc-img w-full h-full object-cover"
        />

        {/* Rating */}
        <div className="absolute top-3 left-3">
          <span className="badge badge-green">
            ⭐ {item.rating?.toFixed(1) || "0.0"}
          </span>
        </div>

        {/* Hospital Type */}
        <div className="absolute top-3 right-3">
          <span className="badge badge-slate">
            {item.hospitalType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">

        <h3 className="text-sm font-bold text-text-primary">
          {item.name}
        </h3>

        <p className="text-xs text-text-muted mt-1">
          📍 {item.address?.city}, {item.address?.state}
        </p>

        <p className="text-xs text-text-muted mt-2">
          🩺 {item.departments?.length || 0} Departments
        </p>

        {/* Bottom */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">

          <span
            className={`text-xs font-semibold ${
              item.active
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {item.active ? "🟢 Open" : "🔴 Closed"}
          </span>

          <button
            onClick={handleView}
            className="btn btn-primary btn-sm"
          >
            View Details
          </button>

        </div>

      </div>
    </div>
  );
};

const Hospitals = () => {
  const { hospitals } = useContext(AppContext);

  return (
    <div className="py-8 animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">
          Hospitals
        </h1>

        <p className="text-text-muted mt-2">
          {hospitals.length} hospital
          {hospitals.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Empty State */}
      {hospitals.length === 0 ? (
        <div className="text-center py-20">

          <h2 className="text-2xl font-semibold">
            No Hospitals Found
          </h2>

          <p className="text-gray-500 mt-2">
            There are currently no hospitals available.
          </p>

        </div>
      ) : (

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {hospitals.map((hospital) => (
            <HospitalCard
              key={hospital._id}
              item={hospital}
            />
          ))}

        </div>

      )}

    </div>
  );
};

export default Hospitals;