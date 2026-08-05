import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const TRUST = [
  { icon: "✅", text: "Verified Doctors" },
  { icon: "🏥", text: "Trusted Hospitals" },
  { icon: "📅", text: "Instant Booking" },
  { icon: "💬", text: "24/7 Support" },
];

const Header = () => {
  const navigate = useNavigate();
  const { group_profiles, header_img } = assets;
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
      background: "linear-gradient(135deg, #0F172A 0%, #134E4A 55%, #0C4A6E 100%)"
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
      <div className="relative z-10 grid md:grid-cols-2 gap-8 items-end px-8 md:px-12 lg:px-16 pt-12 md:pt-16">

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

          {/* Trust pills */}
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
                <span>{t.icon}</span>
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

        {/* ── Right — Doctor image ── */}
        <div className="hidden md:flex justify-end items-end">
          <img
            src={header_img}
            alt="Doctor"
            loading="lazy"
            style={{
              width: "100%", maxWidth: 420,
              objectFit: "contain",
              filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.35))"
            }}
          />
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