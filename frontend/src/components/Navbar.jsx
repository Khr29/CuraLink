import React, { useContext, useState, useCallback, useEffect } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "All Doctors", path: "/doctors" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || "https://doctor-appointment-8lnn.vercel.app";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { token, setToken, userData } = useContext(AppContext);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  const logout = useCallback(() => {
    setToken(false);
    localStorage.removeItem("token");
  }, [setToken]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_0_#E2E8F0]"
          : "bg-white/80 backdrop-blur-md"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
            aria-label="Go to homepage"
          >
            <img src={assets.logo} alt="Medilink" className="h-8 w-auto" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? "text-primary bg-primary-light"
                    : "text-text-secondary hover:text-text-primary hover:bg-slate-100"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.href = ADMIN_URL)}
              className="hidden md:inline-flex btn btn-ghost btn-sm text-xs"
            >
              Admin Panel
            </button>

            {token && userData ? (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-primary hover:bg-primary-light transition-all duration-200"
                  aria-label="User menu"
                >
                  <img
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/20"
                    src={userData.image}
                    alt={userData.name || "User"}
                  />
                  <span className="text-sm font-medium text-text-secondary hidden sm:block max-w-[100px] truncate">
                    {userData.name?.split(" ")[0]}
                  </span>
                  <svg className="w-3.5 h-3.5 text-text-muted" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                  </svg>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full pt-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                  <div className="w-52 bg-white rounded-2xl shadow-card-lg border border-slate-100 p-2 overflow-hidden">
                    <div className="px-3 py-2 mb-1 border-b border-slate-100">
                      <p className="text-xs text-text-muted font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-text-primary truncate">{userData.name}</p>
                    </div>
                    {[
                      { label: "My Profile", path: "/my-profile", icon: "👤" },
                      { label: "My Appointments", path: "/my-appointments", icon: "📅" },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:bg-slate-50 hover:text-text-primary rounded-lg transition-colors duration-150"
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-lg transition-colors duration-150"
                    >
                      <span>🚪</span>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden md:inline-flex btn btn-primary btn-sm shine"
              >
                Get Started
              </button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setShowMenu(true)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-72 z-[70] bg-white shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${showMenu ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <img src={assets.logo} alt="Medilink" className="h-7 w-auto" />
          <button
            onClick={() => setShowMenu(false)}
            className="p-2 rounded-lg hover:bg-slate-100 text-text-secondary transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {token && userData && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-gradient-card flex items-center gap-3">
            <img className="w-10 h-10 rounded-full object-cover" src={userData.image} alt={userData.name} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{userData.name}</p>
              <p className="text-xs text-text-muted truncate">{userData.email}</p>
            </div>
          </div>
        )}

        <nav className="p-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                  ? "bg-primary-light text-primary"
                  : "text-text-secondary hover:bg-slate-50 hover:text-text-primary"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {token && userData ? (
            <>
              <div className="my-2 border-t border-slate-100" />
              <NavLink to="/my-profile" className="block px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-slate-50">
                👤 My Profile
              </NavLink>
              <NavLink to="/my-appointments" className="block px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-slate-50">
                📅 My Appointments
              </NavLink>
              <div className="my-2 border-t border-slate-100" />
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-red-50"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <div className="my-2 border-t border-slate-100" />
              <button
                onClick={() => navigate("/login")}
                className="btn btn-primary w-full justify-center mt-2"
              >
                Get Started
              </button>
            </>
          )}

          <button
            onClick={() => (window.location.href = ADMIN_URL)}
            className="btn btn-ghost w-full justify-center mt-2 text-sm"
          >
            Admin Panel
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Navbar;