import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  FileText,
  CalendarDays,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";

// Patient portal's own in-section navigation — deliberately matches the
// Doctor/Hospital dashboards' sidebar: flush against the true left edge of
// the browser (a grid column, not a centered floating card), continuous
// navy background from top to bottom, zero border-radius, sticky so it
// tracks scroll but naturally releases once the content column ends
// (never overlaps the footer). Reimplemented with frontend's own Tailwind
// classes since the two apps don't share a component tree.
const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "My Profile", path: "/my-profile", icon: UserCircle },
  { name: "Medical Records", path: "/medical-records", icon: FileText },
  { name: "Appointments", path: "/my-appointments", icon: CalendarDays },
  { name: "Reviews", path: "/reviews", icon: MessageSquare },
  { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Settings", path: "/settings", icon: Settings },
];

const PortalSidebar = () => {
  const items = useMemo(() => menuItems, []);

  return (
    <>
      {/* Desktop — full-height, edge-to-edge, continuous panel */}
      <aside
        className="hidden md:flex flex-col sticky top-16 h-full"
        style={{
          background: "linear-gradient(180deg, #0F172A 0%, #134E4A 65%, #0C4A6E 100%)",
          boxShadow: "4px 0 24px rgba(15,23,42,0.10)",
        }}
      >
        <div className="px-6 py-6 border-b border-white/10">
          <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Patient Portal</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-secondary/25 to-primary/20 text-white font-semibold border border-primary/30"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, #2563EB, #14B8A6)"
                        : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <item.icon size={15} color={isActive ? "#FFFFFF" : "#94A3B8"} />
                  </span>
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile — horizontal scrollable pill bar */}
      <nav className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide px-4 pt-4 pb-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `filter-pill flex-shrink-0 w-auto inline-flex items-center gap-1.5 ${isActive ? "active" : ""}`
            }
          >
            <item.icon size={14} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default React.memo(PortalSidebar);
