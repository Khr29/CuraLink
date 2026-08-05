import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const TRUST = [
  {
    text: "Verified Doctors",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    text: "Trusted Hospitals",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15" />
      </svg>
    ),
  },
  {
    text: "Instant Booking",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    text: "24/7 Support",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
];

const Header = () => {
  const navigate = useNavigate();
  const { group_profiles } = assets;
  const { doctors, hospitals } = useContext(AppContext);

  // Real counts from the existing context/API data — not hardcoded.
  // "Patients Served" and "Average Rating" stay as labeled placeholders
  // since there's no backend field for those yet.
  const STATS = useMemo(() => [
    { value: "50K+", label: "Patients Served", isPlaceholder: true },
    { value: doctors.length ? `${doctors.length}+` : "—", label: "Expert Doctors" },
    { value: hospitals.length ? `${hospitals.length}+` : "—", label: "Partner Hospitals" },
    { value: "4.9★", label: "Average Rating", isPlaceholder: true },
  ], [doctors.length, hospitals.length]);

  return (
    <section className="relative rounded-2xl overflow-hidden" style={{
      // Deep navy-forward gradient — distinct mood from Banner/Footer's
      // blue-forward gradient. Still same brand family (navy → blue → teal),
      // just a different lean so the three dark sections don't look identical.
      background: "linear-gradient(135deg, #020617 0%, #0F2547 45%, #155E75 80%, #0F766E 100%)"
    }}>

      {/* Mesh overlays */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(20,184,166,0.18) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(14,165,233,0.18) 0%, transparent 50%)
        `
      }} />

      {/* Decorative blobs */}
      <div style={{
        position: "absolute", top: -80, right: -80, width: 320, height: 320,
        background: "rgba(20,184,166,0.12)", borderRadius: "50%",
        filter: "blur(60px)", pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: -80, left: -80, width: 280, height: 280,
        background: "rgba(14,165,233,0.10)", borderRadius: "50%",
        filter: "blur(60px)", pointerEvents: "none"
      }} />

      {/* Main grid */}
      <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center px-8 md:px-12 lg:px-16 pt-12 md:pt-16">

        {/* ── Left ── */}
        <div className="pb-12 md:pb-16">

          {/* Badge */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#E2F8F5",
            fontSize: "0.75rem", fontWeight: 600,
            padding: "6px 16px", borderRadius: 99,
            marginBottom: 24, backdropFilter: "blur(8px)",
            letterSpacing: "0.04em"
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#5EEAD4", display: "inline-block",
              animation: "pulse 2s infinite"
            }} />
            Doctors, hospitals & records — one platform
          </span>

          {/* Heading */}
          <h1 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1.2,
            marginBottom: 16
          }}>
            Healthcare Made
            <span style={{
              display: "block",
              marginTop: 4,
              background: "linear-gradient(90deg, #5EEAD4, #BAE6FD)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              Smarter, Together
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            color: "rgba(255,255,255,0.72)",
            fontSize: "1rem", lineHeight: 1.7,
            marginBottom: 24, maxWidth: 480
          }}>
            Find the right doctor, compare trusted hospitals, and manage your health records — all from one secure platform.
          </p>

          {/* Trust pills — outline icons, no emoji */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
            {TRUST.map((t) => (
              <span key={t.text} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: "0.8rem", color: "rgba(255,255,255,0.85)",
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                padding: "6px 14px", borderRadius: 99,
                backdropFilter: "blur(6px)"
              }}>
                <span style={{ width: 14, height: 14, color: "#5EEAD4", flexShrink: 0 }}>{t.icon}</span>
                <span>{t.text}</span>
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
            <a
              href="#speciality"
              className="btn btn-lg shine"
              style={{
                background: "linear-gradient(135deg, #14B8A6, #0EA5E9)",
                color: "#FFFFFF",
                boxShadow: "0 4px 20px rgba(20,184,166,0.45)",
                border: "none",
                borderRadius: 12,
                fontWeight: 600
              }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("speciality")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Find Doctors
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>

            <button
              onClick={() => navigate("/hospitals")}
              style={{
                background: "rgba(255,255,255,0.10)",
                color: "#FFFFFF",
                border: "1.5px solid rgba(255,255,255,0.28)",
                borderRadius: 99,
                padding: "10px 22px",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
                backdropFilter: "blur(6px)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.10)"}
            >
              Explore Hospitals
            </button>
          </div>

          {/* Social proof — avatars + stars */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 32 }}>
            <img src={group_profiles} alt="Happy patients" style={{ height: 40 }} loading="lazy" />
            <div>
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <svg key={i} style={{ width: 14, height: 14, color: "#FCD34D" }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem", marginTop: 3 }}>
                4.9/5 from 12,000+ reviews
              </p>
            </div>
          </div>
        </div>

        {/* ── Right — floating UI-card composition (replaces stock photo) ── */}
        <div className="hidden md:flex relative justify-center items-center min-h-[380px]">

          {/* faint heartbeat line, purely decorative */}
          <svg
            viewBox="0 0 400 100"
            style={{ position: "absolute", width: "90%", opacity: 0.12, pointerEvents: "none" }}
          >
            <path
              d="M0 50 H130 L150 20 L170 80 L190 50 H400"
              fill="none" stroke="#5EEAD4" strokeWidth="2.5"
            />
          </svg>

          {/* Main card — upcoming appointment */}
          <div
            style={{
              position: "relative", zIndex: 10,
              background: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(10px)",
              borderRadius: 18,
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              padding: 20,
              width: 268,
              transform: "rotate(-2deg)",
              transition: "transform .4s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "rotate(0deg)"}
            onMouseLeave={e => e.currentTarget.style.transform = "rotate(-2deg)"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "linear-gradient(135deg, #2563EB, #14B8A6)",
                color: "#fff", fontWeight: 700, fontSize: "0.8rem",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                DR
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A" }}>Dr. Ayesha Khan</p>
                <p style={{ fontSize: "0.72rem", color: "#64748B" }}>Cardiologist</p>
              </div>
              <span className="badge badge-green" style={{ flexShrink: 0 }}>Confirmed</span>
            </div>

            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", color: "#475569" }}>
                <svg style={{ width: 14, height: 14, color: "#0EA5E9", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Today, 4:30 PM
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", color: "#475569" }}>
                <svg style={{ width: 14, height: 14, color: "#0EA5E9", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                CityCare Hospital, Bengaluru
              </div>
            </div>
          </div>

          {/* Floating hospital-rating mini card */}
          <div
            style={{
              position: "absolute", left: "6%", bottom: 10, zIndex: 20,
              background: "#FFFFFF", borderRadius: 14,
              boxShadow: "0 14px 34px rgba(0,0,0,0.30)",
              padding: 12, width: 152,
              transform: "rotate(3deg)", transition: "transform .4s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "rotate(0deg)"}
            onMouseLeave={e => e.currentTarget.style.transform = "rotate(3deg)"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
              <svg style={{ width: 13, height: 13, color: "#FCD34D" }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0F172A" }}>4.9</span>
              <span className="badge badge-green" style={{ marginLeft: "auto", fontSize: "0.6rem", padding: "2px 6px" }}>Open</span>
            </div>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>Apollo Hospitals</p>
            <p style={{ fontSize: "0.65rem", color: "#94A3B8", marginTop: 2 }}>12 Departments</p>
          </div>

          {/* Floating "records synced" badge */}
          <div
            style={{
              position: "absolute", right: "2%", top: 4, zIndex: 20,
              background: "#FFFFFF", borderRadius: 14,
              boxShadow: "0 14px 34px rgba(0,0,0,0.30)",
              padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 8,
              transform: "rotate(2deg)", transition: "transform .4s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "rotate(0deg)"}
            onMouseLeave={e => e.currentTarget.style.transform = "rotate(2deg)"}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <svg style={{ width: 16, height: 16, color: "#2563EB" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.1 }}>Health Records</p>
              <p style={{ fontSize: "0.62rem", color: "#94A3B8" }}>Synced &amp; secure</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(255,255,255,0.10)",
        margin: "0 16px"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 0
        }} className="md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              textAlign: "center",
              padding: "20px 16px",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.10)" : "none",
              background: "rgba(255,255,255,0.04)"
            }}>
              <p style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 800,
                background: "linear-gradient(90deg, #5EEAD4, #BAE6FD)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.1
              }}>
                {s.value}
              </p>
              <p style={{
                color: "rgba(255,255,255,0.60)",
                fontSize: "0.8rem",
                marginTop: 4,
                fontWeight: 400
              }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default React.memo(Header);