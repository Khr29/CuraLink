import React, { lazy, Suspense, useState } from "react";
import Header from "../components/Header";

const SpecialityMenu = lazy(() => import("../components/SpecialityMenu"));
const FeaturedHospitals = lazy(() => import("../components/FeaturedHospitals"));
const TopDoctors = lazy(() => import("../components/TopDoctors"));
const Stats = lazy(() => import("../components/Stats"));
const HowItWorks = lazy(() => import("../components/HowItWorks"));
const Banner = lazy(() => import("../components/Banner"));

/* ─── Why Choose Us ─────────────────────────────────────── */
const WHY = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15" />
      </svg>
    ),
    color: "text-sky-600 bg-sky-50",
    title: "Hospital Comparison",
    desc: "Compare hospitals side by side on ratings, departments, and location before you decide.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-teal-600 bg-teal-50",
    title: "Verified Doctors",
    desc: "Every doctor on our platform is licensed and background-checked for your safety.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    color: "text-violet-600 bg-violet-50",
    title: "Digital Health Records",
    desc: "All your prescriptions, records, and appointment history stored securely in one place.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    color: "text-amber-600 bg-amber-50",
    title: "AI Recommendations",
    desc: "Get smart suggestions for doctors and hospitals based on your needs and history.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    color: "text-pink-600 bg-pink-50",
    title: "Nearby Hospitals",
    desc: "Find trusted hospitals close to you, ranked by distance and department availability.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "text-green-600 bg-green-50",
    title: "Instant Booking",
    desc: "Book appointments in under 60 seconds. No waiting, no phone calls.",
  },
];

const WhyChooseUs = () => (
  <section className="py-16 px-4 bg-gradient-section">
    <div className="text-center mb-12">
      <span className="section-tag">Why CuraLink</span>
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
    text: "CuraLink made it so easy to find a dermatologist near me. Booked in 2 minutes and got instant confirmation. The doctor was excellent!",
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
        Thousands of patients trust CuraLink for their healthcare needs.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {TESTIMONIALS.map((t, i) => (
        <div key={t.name} className="testimonial-card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="flex gap-1 mb-4">
            {Array.from({ length: t.rating }).map((_, s) => (
              <svg key={s} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">"{t.text}"</p>
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
  { q: "How do I book an appointment on CuraLink?", a: "Simply browse our doctor listings, select your preferred doctor, choose an available time slot, and confirm. You'll receive an instant confirmation via email." },
  { q: "Are all doctors on CuraLink verified?", a: "Yes, every doctor on our platform goes through a rigorous verification process including license validation, credential checks, and background screening." },
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
            Everything you need to know about CuraLink.
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
      <FeaturedHospitals />
      <TopDoctors />
      <WhyChooseUs />
      <Stats />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <Banner />
    </div>
  </Suspense>
);

export default React.memo(Home);