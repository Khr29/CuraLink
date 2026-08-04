import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import { specialityData } from "../assets/assets";

const useCountUp = (target, active, duration = 1200) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    let frame;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);
  return value;
};

const StatBlock = ({ target, suffix, label, active }) => {
  const count = useCountUp(target, active);
  return (
    <div className="stat-block">
      <p className="stat-block-value">
        {count}
        {suffix}
      </p>
      <p className="stat-block-label">{label}</p>
    </div>
  );
};

const Stats = () => {
  const { doctors, hospitals } = useContext(AppContext);
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Derived directly from real data already in context — no fake numbers.
  const stats = useMemo(() => [
    { target: hospitals.length, suffix: "+", label: "Hospitals" },
    { target: doctors.length, suffix: "+", label: "Doctors" },
    { target: specialityData.length, suffix: "+", label: "Departments" },
    // No backend field for total patients / avg rating yet —
    // shown as static placeholders instead of invented "live" numbers.
    { target: 0, suffix: "50K+", label: "Patients", isPlaceholder: true },
    { target: 0, suffix: "4.8★", label: "Avg. Rating", isPlaceholder: true },
  ], [doctors.length, hospitals.length]);

  return (
    <section ref={sectionRef} className="py-16 px-4">
      <div className="stats-panel">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 sm:gap-4">
          {stats.map((s) =>
            s.isPlaceholder ? (
              <div key={s.label} className="stat-block">
                <p className="stat-block-value">{s.suffix}</p>
                <p className="stat-block-label">{s.label}</p>
              </div>
            ) : (
              <StatBlock key={s.label} target={s.target} suffix={s.suffix} label={s.label} active={inView} />
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Stats);