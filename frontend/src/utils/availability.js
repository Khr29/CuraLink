// Single source of truth for the "Available Today" badge shown on doctor
// cards and the doctor profile page. `available` is a manual on/off toggle
// (see backend changeAvailability) and says nothing about whether TODAY
// specifically has open slots; `todaySlotCount` is the real, schedule-derived
// count (backend/utils/slotGenerator.js) — the same source the booking page
// uses. Folding both together here is what prevents a doctor card claiming
// "Available" while the booking page directly underneath says "No Slots
// Available" for the same doctor/day.
export const getAvailabilityBadge = (doc) => {
  if (!doc?.available) {
    return { label: "Unavailable", className: "badge-slate", dotClassName: "bg-slate-400" };
  }
  // null/undefined = not yet computed (older cached doctor object) — fall
  // back to the plain toggle rather than claiming "no slots".
  if (doc.todaySlotCount === 0) {
    return { label: "No Slots Today", className: "badge-amber", dotClassName: "bg-amber-500" };
  }
  return { label: "Available Today", className: "badge-green", dotClassName: "bg-accent animate-pulse" };
};
