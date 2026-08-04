import React from "react";

const STEPS = [
  { n: "01", title: "Search", desc: "Tell us what you need — a speciality, a symptom, or a hospital name." },
  { n: "02", title: "Choose Hospital", desc: "Compare ratings, departments, and location to pick the right one." },
  { n: "03", title: "Choose Doctor", desc: "Browse verified specialists and check their availability." },
  { n: "04", title: "Book Appointment", desc: "Pick a slot and confirm — it takes under a minute." },
  { n: "05", title: "Visit Hospital", desc: "Show up at your scheduled time. That's it." },
];

const HowItWorks = () => (
  <section className="py-16 px-4 bg-gradient-section">
    <div className="text-center mb-12">
      <span className="section-tag">How It Works</span>
      <h2 className="section-title">From Search to Visit</h2>
      <p className="section-subtitle mx-auto">
        Five simple steps between you and the right care.
      </p>
    </div>

    <div className="how-it-works-track">
      {STEPS.map((step, i) => (
        <div key={step.n} className="how-it-works-step animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="how-it-works-num">{step.n}</div>
          <h3 className="text-sm font-bold text-text-primary mb-1">{step.title}</h3>
          <p className="text-xs text-text-muted leading-relaxed">{step.desc}</p>
          {i < STEPS.length - 1 && <div className="how-it-works-connector" />}
        </div>
      ))}
    </div>
  </section>
);

export default React.memo(HowItWorks);