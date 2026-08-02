import React from "react";
import { assets } from "../assets/assets";

const VALUES = [
  {
    icon: "🎯",
    bg: "bg-teal-50 text-teal-700",
    title: "EFFICIENCY",
    desc: "Streamlined appointment scheduling that fits into your busy lifestyle. Book in under 60 seconds.",
  },
  {
    icon: "🌟",
    bg: "bg-sky-50 text-sky-700",
    title: "CONVENIENCE",
    desc: "Access a network of trusted healthcare professionals in your area — anytime, anywhere.",
  },
  {
    icon: "💡",
    bg: "bg-violet-50 text-violet-700",
    title: "PERSONALIZATION",
    desc: "Tailored recommendations and reminders to help you stay on top of your health goals.",
  },
];

const About = () => (
  <div className="py-8 animate-fade-in">
    {/* Hero */}
    <div className="text-center mb-14">
      <span className="section-tag">About Us</span>
      <h1 className="section-title">
        Transforming Healthcare
        <span className="block gradient-text">Access for Everyone</span>
      </h1>
      <p className="section-subtitle mx-auto mt-3">
        Medilink bridges the gap between patients and doctors, making quality healthcare accessible, affordable, and effortless.
      </p>
    </div>

    {/* Main section */}
    <div className="flex flex-col md:flex-row gap-12 items-center mb-20">
      {/* Image */}
      <div className="w-full md:w-2/5 flex-shrink-0">
        <div className="relative rounded-3xl overflow-hidden shadow-card-lg">
          <img
            src={assets.about_image}
            alt="About Medilink"
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
          {/* Floating badge */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 shadow-card-md">
              <div className="w-12 h-12 bg-gradient-teal rounded-xl flex items-center justify-center text-white font-extrabold text-xl flex-shrink-0">
                M
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">Medilink Platform</p>
                <p className="text-xs text-text-muted">500+ verified doctors across India</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="space-y-5 text-text-secondary text-sm leading-relaxed mb-8">
          <p>
            Welcome to <strong className="text-text-primary">Medilink</strong>, your trusted partner in managing your healthcare needs conveniently and efficiently. At Medilink, we understand the challenges individuals face when it comes to scheduling doctor appointments and managing their health records.
          </p>
          <p>
            Medilink is committed to excellence in healthcare technology. We continuously strive to enhance our platform, integrating the latest advancements to improve user experience and deliver superior service. Whether you're booking your first appointment or managing ongoing care, Medilink is here to support you every step of the way.
          </p>
        </div>

        {/* Vision */}
        <div className="bg-gradient-card rounded-2xl p-6 border border-primary/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-text-primary">Our Vision</h3>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            Our vision at Medilink is to create a seamless healthcare experience for every user. We aim to bridge the gap between patients and healthcare providers, making it easier for you to access the care you need, when you need it.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { value: "50K+", label: "Patients" },
            { value: "500+", label: "Doctors" },
            { value: "30+", label: "Specialities" },
          ].map(s => (
            <div key={s.label} className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-2xl font-extrabold gradient-text">{s.value}</p>
              <p className="text-xs text-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Why Choose Us */}
    <div className="mb-16">
      <div className="text-center mb-10">
        <span className="section-tag">Our Values</span>
        <h2 className="section-title">Why Choose Medilink?</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {VALUES.map((v, i) => (
          <div key={v.title} className="feature-card text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`inline-flex w-14 h-14 rounded-2xl ${v.bg} text-2xl items-center justify-center mb-4`}>
              {v.icon}
            </div>
            <h3 className="text-base font-extrabold text-text-primary mb-2 tracking-wide">{v.title}</h3>
            <p className="text-sm text-text-muted leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default React.memo(About);