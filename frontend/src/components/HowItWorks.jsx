import React from "react";

const STEPS = [
  {
    n: "01",
    title: "Search",
    desc: "Tell us what you need — a speciality, a symptom, or a hospital name.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Choose Hospital",
    desc: "Compare ratings, departments, and location to pick the right one.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Choose Doctor",
    desc: "Browse verified specialists and check their availability.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Book Appointment",
    desc: "Pick a slot and confirm — it takes under a minute.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    n: "05",
    title: "Visit Hospital",
    desc: "Show up at your scheduled time. That's it.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
];

const HowItWorks = () => (
  <section className="py-20 md:py-24 px-4 bg-gradient-section">
    <div className="text-center mb-14">
      <span className="section-tag">How It Works</span>
      <h2 className="section-title">From Search to Visit</h2>
      <p className="section-subtitle mx-auto">
        Five simple steps between you and the right care.
      </p>
    </div>

    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 lg:gap-4">
        {STEPS.map((step, i) => (
          <div
            key={step.n}
            className="relative bg-white border border-slate-100 rounded-2xl p-5 text-center
                       shadow-[0_4px_16px_rgba(15,23,42,0.05)]
                       hover:shadow-[0_16px_40px_rgba(37,99,235,0.10)]
                       hover:border-blue-100 hover:-translate-y-1
                       transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {/* connecting line — desktop only, between cards */}
            {i < STEPS.length - 1 && (
              <div
                className="hidden lg:block absolute top-9 left-full w-4 h-px
                           border-t-2 border-dashed border-blue-100 z-0"
              />
            )}

            {/* number + icon badge */}
            <div
              className="relative z-10 w-11 h-11 mx-auto mb-4 rounded-xl
                         bg-gradient-to-br from-primary to-teal-500
                         text-white flex items-center justify-center shadow-md"
            >
              {step.icon}
            </div>

            <p className="text-[11px] font-bold tracking-wider text-primary/70 mb-1">
              STEP {step.n}
            </p>
            <h3 className="text-sm font-bold text-text-primary mb-1.5">
              {step.title}
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default React.memo(HowItWorks);