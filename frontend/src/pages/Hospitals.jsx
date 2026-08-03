import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const HospitalCard = ({ item }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/hospital/${item._id}`)}
      className="doc-card group cursor-pointer"
    >
      <div className="relative w-full aspect-[4/5] bg-gradient-card overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="doc-img w-full h-full object-cover"
        />

        <div className="absolute top-3 left-3">
          <span className="badge badge-green">
            ⭐ {item.rating?.toFixed(1) || "0.0"}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="badge badge-slate">
            {item.hospitalType}
          </span>
        </div>
      </div>

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

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">

          <span className="text-xs text-green-600 font-semibold">
            {item.active ? "Open" : "Closed"}
          </span>

          <button className="btn btn-primary btn-sm">
            View
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

      <div className="mb-8">
        <h1 className="section-title">
          Hospitals
        </h1>

        <p className="text-text-muted mt-2">
          {hospitals.length} hospitals available
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {hospitals.map((hospital) => (
          <HospitalCard
            key={hospital._id}
            item={hospital}
          />
        ))}

      </div>

    </div>
  );
};

export default Hospitals;