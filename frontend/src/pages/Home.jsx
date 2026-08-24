import React, { lazy, Suspense, useState } from "react";
import Header from "../components/Header";

const SpecialityMenu = lazy(() => import("../components/SpecialityMenu"));
const FeaturedHospitals = lazy(() => import("../components/FeaturedHospitals"));
const TopDoctors = lazy(() => import("../components/TopDoctors"));
const Stats = lazy(() => import("../components/Stats"));
const HowItWorks = lazy(() => import("../components/HowItWorks"));
const RecentReviews = lazy(() => import("../components/RecentReviews"));
const Banner = lazy(() => import("../components/Banner"));

/* ─── Why Choose Us ─────────────────────────────────────────
   Palette restrained to the site's own 3-tone system:
   primary blue, teal/cyan accent, one soft green note.
   No unrelated hues (violet/amber/pink removed). ───────────── */
const CheckIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const WHY = [
  {
    icon: <CheckIcon />,
    color: "text-teal-600 bg-teal-50",
    title: "Verified Doctors",
    desc: "Every doctor on our platform is licensed and background-checked for your safety.",
  },
  {
    icon: <CheckIcon />,
    color: "text-primary bg-primary-light",
    title: "Trusted Hospitals",
    desc: "Compare hospitals side by side on ratings, departments, and location before you decide.",
  },
  {
    icon: <CheckIcon />,
    color: "text-primary bg-primary-light",
    title: "Secure Health Records",
    desc: "All your prescriptions, records, and appointment history stored securely in one place.",
  },
  {
    icon: <CheckIcon />,
    color: "text-teal-600 bg-teal-50",
    title: "Easy Appointment Booking",
    desc: "Book appointments in under 60 seconds. No waiting, no phone calls.",
  },
  {
    icon: <CheckIcon />,
    color: "text-emerald-600 bg-emerald-50",
    title: "Genuine Reviews",
    desc: "Every review comes from a real, verified patient — no fake ratings, ever.",
  },
  {
    icon: <CheckIcon />,
    color: "text-primary bg-primary-light",
    title: "Fast Search",
    desc: "Find the right doctor or hospital in seconds with smart, instant search and filters.",
  },
];

const WhyChooseUs = () => (
  <section className="py-20 md:py-24 px-4 bg-gradient-section">
    <div className="text-center mb-14">
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
    color: "bg-primary",
    rating: 5,
    text: "CuraLink made it so easy to find a dermatologist near me. Booked in 2 minutes and got instant confirmation. The doctor was excellent!",
  },
  {
    name: "Rahul Mehta",
    role: "Business Owner, Mumbai",
    avatar: "RM",
    color: "bg-teal-500",
    rating: 5,
    text: "I was skeptical at first, but the platform is fantastic. Verified doctors, transparent pricing, and super easy to use. Highly recommend!",
  },
  {
    name: "Ananya Patel",
    role: "Teacher, Ahmedabad",
    avatar: "AP",
    color: "bg-emerald-500",
    rating: 5,
    text: "Booked a pediatrician appointment for my daughter. The process was seamless and the doctor was very experienced. 10/10 experience.",
  },
];

const Testimonials = () => (
  <section className="py-20 md:py-24 px-4">
    <div className="text-center mb-14">
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
    <section className="py-20 md:py-24 px-4 bg-gradient-section">
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
      <RecentReviews />
      <Testimonials />
      <FAQ />
      <Banner />
    </div>
  </Suspense>
);

export default React.memo(Home);