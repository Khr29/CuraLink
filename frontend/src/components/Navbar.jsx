import React, { useContext, useState, useCallback, useEffect } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import {
  LayoutDashboard,
  UserCircle,
  FileText,
  CalendarDays,
  MessageSquare,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  Menu as MenuIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "All Doctors", path: "/doctors" },
  { name: "Hospitals", path: "/hospitals" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

// Single source of truth for the account dropdown items, shared by the
// desktop dropdown and the mobile drawer so they never drift apart.
// Mirrors the Patient Portal sidebar (components/PortalSidebar.jsx).
const accountMenuItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Profile", path: "/my-profile", icon: UserCircle },
  { label: "Medical Records", path: "/medical-records", icon: FileText },
  { label: "My Appointments", path: "/my-appointments", icon: CalendarDays },
  { label: "Reviews", path: "/reviews", icon: MessageSquare },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "Settings", path: "/settings", icon: Settings },
];

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
          className="flex items-center gap-3 focus:outline-none"
          aria-label="Go to homepage"
        >
          <img
            src={assets.logo}
            alt="CuraLink"
            className="h-10 w-10 object-contain"
          />

          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(90deg,#2563EB,#14B8A6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CuraLink
          </h1>
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
            {token && userData ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-primary hover:bg-primary-light transition-all duration-200"
                      aria-label="User menu"
                    />
                  }
                >
                  <Avatar className="w-7 h-7 ring-2 ring-primary/20">
                    <AvatarImage src={userData.image} alt={userData.name || "User"} />
                    <AvatarFallback>{userData.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-text-secondary hidden sm:block max-w-[100px] truncate">
                    {userData.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 p-2">
                  <div className="px-2 py-1.5 mb-1 border-b border-border">
                    <p className="text-xs text-text-muted font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-text-primary truncate">{userData.name}</p>
                  </div>
                  {accountMenuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="gap-3 px-3 py-2 text-sm text-text-secondary"
                    >
                      <item.icon size={15} />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={logout}
                    className="gap-3 px-3 py-2 text-sm"
                  >
                    <LogOut size={15} />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                pill
                className="hidden md:inline-flex shine"
                onClick={() => navigate("/login")}
              >
                Get Started
              </Button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setShowMenu(true)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <Sheet open={showMenu} onOpenChange={setShowMenu}>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 space-y-0">
            <img src={assets.logo} alt="CuraLink" className="h-7 w-auto" />
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          </SheetHeader>

          {token && userData && (
            <div className="mx-4 mt-2 p-3 rounded-xl bg-gradient-card flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={userData.image} alt={userData.name} />
                <AvatarFallback>{userData.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{userData.name}</p>
                <p className="text-xs text-text-muted truncate">{userData.email}</p>
              </div>
            </div>
          )}

          <nav className="p-4 flex flex-col gap-1 overflow-y-auto">
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
                {accountMenuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-slate-50"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                ))}
                <div className="my-2 border-t border-slate-100" />
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="my-2 border-t border-slate-100" />
                <Button
                  variant="gradient"
                  className="w-full mt-2"
                  onClick={() => navigate("/login")}
                >
                  Get Started
                </Button>
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Navbar;
