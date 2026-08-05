import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = ["No registration fees", "Instant confirmation", "Easy reschedule"];

const Banner = () => {
  const navigate = useNavigate();
  const handleNavigate = useCallback(() => {
    navigate("/login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  return (
    <section className="my-16 px-4">
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          // Blue-forward variant — same family as Header/Stats, but leaning
          // toward primary blue instead of teal, so Hero and Banner read as
          // two distinct moments instead of a repeated block.
          background: "linear-gradient(135deg, #0B1120 0%, #1E3A8A 55%, #0F766E 100%)"
        }}
      >
        {/* Mesh overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            radial-gradient(circle at 15% 30%, rgba(20,184,166,0.16) 0%, transparent 50%),
            radial-gradient(circle at 85% 70%, rgba(14,165,233,0.16) 0%, transparent 50%)
          `
        }} />
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: -60, right: -60, width: 260, height: 260,
          background: "rgba(20,184,166,0.14)", borderRadius: "50%",
          filter: "blur(60px)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60, width: 220, height: 220,
          background: "rgba(14,165,233,0.12)", borderRadius: "50%",
          filter: "blur(60px)", pointerEvents: "none"
        }} />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 px-8 sm:px-12 py-14 md:py-16">

          {/* Left */}
          <div className="text-center md:text-left">
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)",
              color: "#E2F8F5",
              fontSize: "0.75rem", fontWeight: 600,
              padding: "6px 16px", borderRadius: 99,
              marginBottom: 20, backdropFilter: "blur(8px)"
            }}>
              <svg style={{ width: 14, height: 14, color: "#5EEAD4" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15" />
              </svg>
              100+ Trusted Doctors &amp; Hospitals
            </span>

            <h2 style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.2,
              marginBottom: 16
            }}>
              Start Your Healthcare
              <span style={{
                display: "block",
                marginTop: 4,
                background: "linear-gradient(90deg, #5EEAD4, #BAE6FD)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>
                Journey Today
              </span>
            </h2>

            <p style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: "1rem", lineHeight: 1.7,
              marginBottom: 28, maxWidth: 440
            }}>
              Find trusted hospitals and verified doctors in minutes — quick, safe, and reliable.
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={handleNavigate}
                className="btn btn-lg shine"
                style={{
                  background: "linear-gradient(135deg, #14B8A6, #0EA5E9)",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 20px rgba(20,184,166,0.45)",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 600
                }}
              >
                Create Free Account
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => navigate("/doctors")}
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
                Explore Doctors
              </button>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2 mt-8 justify-center md:justify-start">
              {FEATURES.map(f => (
                <span key={f} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: "0.75rem", color: "rgba(255,255,255,0.75)",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  padding: "6px 12px", borderRadius: 99
                }}>
                  <svg style={{ width: 12, height: 12, color: "#5EEAD4", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right — floating icon-grid mockup, same visual language as the Hero cards */}
          <div className="hidden md:block flex-shrink-0" style={{ position: "relative", width: 220, height: 220 }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 24,
              backdropFilter: "blur(6px)"
            }} />
            <div style={{
              position: "relative", zIndex: 10, height: "100%",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
              padding: 24
            }}>
              {[
                { d: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }, // verified
                { d: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15" }, // hospital
                { d: "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" }, // records
                { d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" }, // instant
              ].map((icon, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.95)",
                  borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.20)"
                }}>
                  <svg style={{ width: 28, height: 28, color: "#0F766E" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon.d} />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Banner);