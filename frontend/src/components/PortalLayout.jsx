import React from "react";
import PortalSidebar from "./PortalSidebar";

// Shared shell for every patient portal page (Dashboard, Profile, Medical
// Records, Appointments, Reviews, Notifications, Settings). Purely a
// visual wrapper — mirrors the Doctor/Hospital dashboards' app-shell:
// the sidebar sits flush against the true browser edge (not centered
// inside a max-width column) while the content column gets its own gutter
// + 1320px cap within the remaining space, exactly like PanelLayout's
// SideBar + <main> split in the admin app.
//
// It breaks out of the marketing site's `mx-4 sm:mx-[10%]` shell (see
// App.jsx) via the standard viewport-relative full-bleed technique — vw
// units ignore parent width/margin, so this works regardless of how deep
// this renders inside <main>. Navbar above and Footer below are untouched.
const PortalLayout = ({ children }) => (
  <div
    style={{
      position: "relative",
      left: "50%",
      right: "50%",
      marginLeft: "-50vw",
      marginRight: "-50vw",
      width: "100vw",
      background: "linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)",
    }}
  >
    <div className="grid md:grid-cols-[240px_1fr] items-stretch">
      <PortalSidebar />
      <div className="min-w-0 px-4 sm:px-6 lg:px-10 py-8 pb-16">
        <div className="max-w-[1320px] mx-auto animate-fade-in">{children}</div>
      </div>
    </div>
  </div>
);

export default PortalLayout;
