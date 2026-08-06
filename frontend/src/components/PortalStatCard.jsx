import React, { useState } from "react";

// Premium summary card for the patient portal dashboard — pixel-matches
// the Doctor/Hospital dashboards' StatCard (same 20px radius, same shadow
// formula, same hover lift) so the two feel like one product. Kept under
// its own name so it doesn't collide with the existing homepage StatCard,
// which is a "count up from 0" animated metric tile with a different prop
// shape and a lighter (16px) marketing-card treatment.
const PortalStatCard = ({ icon: Icon, label, value, accent, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFFFF",
        borderRadius: 20,
        padding: "20px 22px",
        border: "1px solid #E2E8F0",
        boxShadow: hovered ? "0 12px 32px rgba(15,23,42,0.08)" : "0 8px 24px rgba(15,23,42,0.04)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        style={{
          width: 42, height: 42, borderRadius: 12, marginBottom: 14,
          background: accent?.bg || "#F0FDFA", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Icon size={20} color={accent?.color || "#14B8A6"} />
      </div>
      <p style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", lineHeight: 1, margin: 0, letterSpacing: "-0.01em" }}>{value}</p>
      <p style={{ fontSize: 12.5, color: "#64748B", marginTop: 6, fontWeight: 500 }}>{label}</p>
    </div>
  );
};

export default PortalStatCard;
