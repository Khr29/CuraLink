import React, { useState } from "react";
import { Link } from "react-router-dom";

/* ══════════════════════════════════════════════════════════════
   RECONSTRUCTED FROM SCREENSHOTS — no source file was provided.
   Routes below are best-guesses matching paths used elsewhere in
   this app (/doctors, /hospitals). If your real Footer.jsx has
   different routes, props, or a real newsletter API call, send
   that file and this will be merged into your actual logic
   instead of this rebuild.
   ══════════════════════════════════════════════════════════════ */

const COMPANY_LINKS = [
  { label: "Home", to: "/" },
  { label: "All Doctors", to: "/doctors" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy" },
];

const LEGAL_LINKS = [
  { label: "Terms", to: "/terms" },
  { label: "Privacy", to: "/privacy" },
  { label: "Cookies", to: "/cookies" },
];

const SOCIALS = [
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.92a8.19 8.19 0 01-2.36.65 4.12 4.12 0 001.8-2.27 8.22 8.22 0 01-2.6 1 4.1 4.1 0 00-7 3.74A11.65 11.65 0 013 4.9a4.1 4.1 0 001.27 5.47A4.07 4.07 0 012.8 9.7v.05a4.1 4.1 0 003.29 4.02 4.1 4.1 0 01-1.85.07 4.1 4.1 0 003.83 2.85A8.23 8.23 0 012 18.4a11.62 11.62 0 006.29 1.84c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.36-.01-.53A8.35 8.35 0 0022 5.92z"/></svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 8.98h4V21H3V8.98zM9 8.98h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21H9V8.98z"/></svg>
    ),
  },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Placeholder — wire this up to your real newsletter endpoint.
    setEmail("");
  };

  return (
    <footer
      className="relative overflow-hidden mt-16"
      style={{
        // Same blue-forward gradient as Banner, for a consistent close to the page.
        background: "linear-gradient(135deg, #0B1120 0%, #1E3A8A 55%, #0F766E 100%)"
      }}
    >
      {/* Mesh overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          radial-gradient(circle at 10% 10%, rgba(20,184,166,0.14) 0%, transparent 50%),
          radial-gradient(circle at 90% 90%, rgba(14,165,233,0.14) 0%, transparent 50%)
        `
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg viewBox="0 0 40 40" style={{ width: 34, height: 34 }}>
                <circle cx="20" cy="20" r="18" fill="none" stroke="#5EEAD4" strokeWidth="2.5" />
                <path d="M8 20h6l3-8 4 16 3-8h8" fill="none" stroke="#5EEAD4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF" }}>CuraLink</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.62)", fontSize: "0.875rem", lineHeight: 1.7, maxWidth: 340 }}>
              CuraLink connects patients with trusted, verified doctors and hospitals across India. Book appointments online in minutes, anytime, anywhere.
            </p>
            <div className="flex gap-2 mt-5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#E2F8F5", transition: "background .2s ease"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.16)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                >
                  <span style={{ width: 16, height: 16 }}>{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <p style={{ color: "#FFFFFF", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 18 }}>
              COMPANY
            </p>
            <div className="flex flex-col gap-3">
              {COMPANY_LINKS.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem", transition: "color .2s ease" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#5EEAD4"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Get in touch */}
          <div>
            <p style={{ color: "#FFFFFF", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 18 }}>
              GET IN TOUCH
            </p>

            <div className="flex items-start gap-3 mb-4">
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg style={{ width: 16, height: 16, color: "#5EEAD4" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem" }}>Phone</p>
                <a href="tel:+919592383952" style={{ color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 600 }}>
                  +91 9592383952
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 mb-6">
              <div style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg style={{ width: 16, height: 16, color: "#5EEAD4" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem" }}>Email</p>
                <a href="mailto:aneeshy1508cse@gmail.com" style={{ color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 600, wordBreak: "break-all" }}>
                  aneeshy1508cse@gmail.com
                </a>
              </div>
            </div>

            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem", marginBottom: 8 }}>
              Get health tips in your inbox
            </p>
            <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                style={{
                  flex: 1, minWidth: 0,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 10, padding: "9px 12px",
                  fontSize: "0.8rem", color: "#FFFFFF", outline: "none"
                }}
              />
              <button
                type="submit"
                aria-label="Subscribe"
                style={{
                  flexShrink: 0, width: 38, borderRadius: 10,
                  background: "linear-gradient(135deg, #14B8A6, #0EA5E9)",
                  border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <svg style={{ width: 16, height: 16, color: "#FFFFFF" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-14 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.10)" }}
        >
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: "0.8rem" }}>
            © 2026 CuraLink. All rights reserved.
          </p>
          <div className="flex gap-6">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.8rem" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);