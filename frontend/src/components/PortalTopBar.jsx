import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

// Application-style top bar for the authenticated Patient Portal — replaces
// the public marketing Navbar (see App.jsx) so the portal reads as its own
// product, the same way the Doctor/Hospital/Pharmacy admin apps' Navbar
// works: brand + role badge + a single avatar/name control, no public nav
// links, no footer below it.
//
// Deliberately NOT a dropdown menu. Clicking the avatar/name goes straight
// to My Profile — PortalSidebar is the one and only navigation surface for
// the portal, so this bar doesn't duplicate it. Settings already lives in
// the sidebar; Logout lives in the sidebar footer (see PortalSidebar.jsx).
const PortalTopBar = () => {
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);

  return (
    <header className="sticky top-0 z-50 h-16 flex items-center bg-white/90 backdrop-blur-xl border-b border-slate-200">
      <div className="w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2.5 focus:outline-none"
          aria-label="Go to dashboard"
        >
          <img src={assets.logo} alt="CuraLink" className="h-8 w-8 object-contain" />
          <span
            className="text-xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(90deg,#2563EB,#14B8A6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CuraLink
          </span>
          <span className="badge badge-teal text-[10px] hidden sm:inline-flex">Patient</span>
        </button>

        <button
          onClick={() => navigate("/my-profile")}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-primary hover:bg-primary-light transition-all duration-200"
          aria-label="Open my profile"
        >
          <img
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
            src={userData?.image}
            alt={userData?.name || "Profile"}
          />
          <span className="text-sm font-medium text-text-secondary hidden sm:block max-w-[140px] truncate">
            {userData?.name}
          </span>
          <ChevronDown size={14} className="text-text-muted" />
        </button>
      </div>
    </header>
  );
};

export default React.memo(PortalTopBar);
