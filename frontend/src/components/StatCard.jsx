import React from "react";
import useCountUp from "../hooks/useCountUp";

// Reusable "count up from 0" metric tile — white card, soft shadow, subtle
// hover lift. Used by the Platform Numbers homepage section (and safe to
// reuse anywhere else a live number needs the same treatment).
const StatCard = ({ icon, value, suffix = "", label, decimals = 0, active }) => {
  const count = useCountUp(value, active, { decimals });
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card px-6 py-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card-md">
      <div className="text-2xl mb-2" aria-hidden="true">{icon}</div>
      <p className="text-3xl font-extrabold text-text-primary leading-tight">
        {decimals ? count.toFixed(decimals) : count}
        {suffix}
      </p>
      <p className="text-sm text-text-muted mt-1.5 font-medium">{label}</p>
    </div>
  );
};

export default React.memo(StatCard);
