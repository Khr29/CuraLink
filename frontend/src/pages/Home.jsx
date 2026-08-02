import React, { lazy, Suspense, useState } from "react";
import Header from "../components/Header";

const SpecialityMenu = lazy(() => import("../components/SpecialityMenu"));
const TopDoctors = lazy(() => import("../components/TopDoctors"));
const Banner = lazy(() => import("../components/Banner"));

/* ─── Why Choose Us ─────────────────────────────────────── */
const WHY = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-teal-600 bg-teal-50",
    title: "Verified Doctors",
    desc: "All doctors on our platform are thoroughly vetted, licensed, and background-checked for your safety.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-sky-600 bg-sky-50",
    title: "Instant Booking",
    desc: "Book appointments in under 60 seconds. No waiting, no phone calls — just seamless scheduling.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    color: "text-violet-600 bg-violet-50",
    title: "Secure & Private",
    desc: "Your medical data is encrypted and safe. We comply with healthcare privacy standards.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
      </svg>
    ),
    color: "text-green-600 bg-green-50",
    title: "Affordable Care",
    desc: "Transparent pricing with no hidden fees. Compare doctors and choose what fits your budget.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    color: "text-pink-600 bg-pink-50",
    title: "24/7 Support",
    desc: "Our healthcare support team is available around the clock to help with any concerns.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    color: "text-amber-600 bg-amber-50",
    title: "Health Records",
    desc: "All your prescriptions, records, and appointment history in one secure, organized place.",
  },
];

const WhyChooseUs = () => (
  <section className="py-16 px-4 bg-gradient-section">
    <div className="text-center mb-12">
      <span className="section-tag">Why Medilink</span>
      <h2 className="section-title">Healthcare Made Simple</h2>
      <p className="section-subtitle mx-auto">
        Everything you need for a better healthcare experience, all in one platform.
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {WHY.map((item, i) => (
        <div key={item.title} className="feature-card animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className={`inline-flex p-3 rounded-xl mb-4 ${item.color}`}>
            {item.icon}
          </div>
          <h3 className="text-base font-bold text-text-primary mb-2">{item.title}</h3>
          <p className="text-sm text-text-muted leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

/* ─── Testimonials ───────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Software Engineer, Bangalore",
    avatar: "PS",
    color: "bg-teal-500",
    rating: 5,
    text: "Medilink made it so easy to find a dermatologist near me. Booked in 2 minutes and got instant confirmation. The doctor was excellent!",
  },
  {
    name: "Rahul Mehta",
    role: "Business Owner, Mumbai",
    avatar: "RM",
    color: "bg-sky-500",
    rating: 5,
    text: "I was skeptical at first, but the platform is fantastic. Verified doctors, transparent pricing, and super easy to use. Highly recommend!",
  },
  {
    name: "Ananya Patel",
    role: "Teacher, Ahmedabad",
    avatar: "AP",
    color: "bg-violet-500",
    rating: 5,
    text: "Booked a pediatrician appointment for my daughter. The process was seamless and the doctor was very experienced. 10/10 experience.",
  },
];

const Testimonials = () => (
  <section className="py-16 px-4">
    <div className="text-center mb-12">
      <span className="section-tag">Patient Stories</span>
      <h2 className="section-title">What Our Patients Say</h2>
      <p className="section-subtitle mx-auto">
        Thousands of patients trust Medilink for their healthcare needs.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {TESTIMONIALS.map((t, i) => (
        <div key={t.name} className="testimonial-card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
          {/* Stars */}
          <div className="flex gap-1 mb-4">
            {Array.from({ length: t.rating }).map((_, s) => (
              <svg key={s} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Quote */}
          <p className="text-text-secondary text-sm leading-relaxed mb-6">"{t.text}"</p>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
              {t.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{t.name}</p>
              <p className="text-xs text-text-muted">{t.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ─── FAQ ────────────────────────────────────────────────── */
const FAQS = [
  { q: "How do I book an appointment on Medilink?", a: "Simply browse our doctor listings, select your preferred doctor, choose an available time slot, and confirm. You'll receive an instant confirmation via email." },
  { q: "Are all doctors on Medilink verified?", a: "Yes, every doctor on our platform goes through a rigorous verification process including license validation, credential checks, and background screening." },
  { q: "Can I cancel or reschedule my appointment?", a: "Absolutely! You can cancel or reschedule your appointment up to 2 hours before the scheduled time from your My Appointments page." },
  { q: "Is my personal health data secure?", a: "We take privacy seriously. All your data is encrypted end-to-end and we are fully compliant with healthcare data protection standards." },
  { q: "What payment methods are accepted?", a: "We accept all major UPI apps, credit/debit cards, net banking, and digital wallets through our secure Razorpay payment gateway." },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-16 px-4 bg-gradient-section">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="section-tag">FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle mx-auto">
            Everything you need to know about Medilink.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="faq-item">
              <button
                className="faq-question w-full"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {open === i && (
                <div className="faq-answer animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Home Page ──────────────────────────────────────────── */
const Loader = () => (
  <div className="flex justify-center py-16">
    <div className="spinner" />
  </div>
);

const Home = () => (
  <Suspense fallback={<Loader />}>
    <div className="flex flex-col gap-4">
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <WhyChooseUs />
      <Testimonials />
      <FAQ />
      <Banner />
    </div>
  </Suspense>
);

export default React.memo(Home);