import React, { useCallback } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();
  const handleNavigate = useCallback(() => {
    navigate("/login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  return (
    <section className="my-16 px-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero hero-mesh">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-8 sm:px-12 py-12 md:py-0">
          {/* Left */}
          <div className="text-center md:text-left py-4 md:py-14">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm">
              🏥 100+ Trusted Doctors
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Ready to Book Your<br />
              <span className="gradient-text">Next Appointment?</span>
            </h2>
            <p className="text-white/65 text-base md:text-lg mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
              Join thousands of patients who trust Medilink for their healthcare needs. Quick, safe, and reliable.
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={handleNavigate}
                className="btn btn-primary btn-lg shine"
              >
                Create Free Account
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => navigate("/doctors")}
                className="btn btn-sm text-white border border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 transition-all text-sm font-medium"
              >
                Explore Doctors
              </button>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2 mt-8 justify-center md:justify-start">
              {["No registration fees", "Instant confirmation", "Easy reschedule"].map(f => (
                <span key={f} className="inline-flex items-center gap-1.5 text-xs text-white/70 bg-white/8 border border-white/12 px-3 py-1.5 rounded-full">
                  <svg className="w-3 h-3 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right — doctor image */}
          <div className="hidden md:block flex-shrink-0 self-end">
            <img
              src={assets.appointment_img}
              alt="Book appointment"
              loading="lazy"
              className="w-64 lg:w-80 object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Banner);
