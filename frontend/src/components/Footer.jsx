import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const COMPANY_LINKS = [
  { to: "/", label: "Home" },
  { to: "/doctors", label: "All Doctors" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
];

const Footer = () => (
  <footer className="bg-slate-900 text-white mt-24">
    {/* Main content */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-2">
          <img src={assets.logo} alt="Medilink" className="h-9 w-auto brightness-200 mb-4" />
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Medilink connects patients with trusted, verified doctors across India. Book appointments online in minutes, anytime, anywhere.
          </p>

          {/* Social */}
          <div className="flex gap-3 mt-6">
            {[
              { label: "Twitter", path: "M22 5.9c-.7.3-1.5.5-2.4.6.8-.5 1.5-1.3 1.8-2.2-.8.5-1.7.8-2.6 1-.8-.8-1.8-1.3-3-1.3-2.3 0-4.1 1.8-4.1 4.1 0 .3 0 .6.1.9C7.7 8.8 4.1 7.2 1.7 4.6c-.4.6-.6 1.3-.6 2.1 0 1.4.7 2.7 1.8 3.4-.7 0-1.3-.2-1.8-.5v.1c0 2 1.4 3.6 3.3 4-.3.1-.7.1-1.1.1-.3 0-.5 0-.8-.1.5 1.6 2 2.8 3.8 2.8-1.4 1.1-3.2 1.8-5.1 1.8H0c1.8 1.2 4 1.8 6.3 1.8 7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2.2z" },
              { label: "LinkedIn", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
            ].map(s => (
              <a key={s.label} href="#" aria-label={s.label}
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-primary flex items-center justify-center transition-colors duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <p className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</p>
          <ul className="space-y-3">
            {COMPANY_LINKS.map(l => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-slate-400 hover:text-primary transition-colors duration-200">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <button className="text-sm text-slate-400 hover:text-primary transition-colors duration-200">
                Privacy Policy
              </button>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Get in Touch</p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                <p className="text-sm text-slate-300">+91 9592383952</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Email</p>
                <p className="text-sm text-slate-300 break-all">aneeshy1508cse@gmail.com</p>
              </div>
            </li>
          </ul>

          {/* Newsletter */}
          <div className="mt-6">
            <p className="text-xs font-medium text-slate-400 mb-2">Get health tips in your inbox</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 bg-slate-800 border border-slate-700 text-sm text-white px-3 py-2 rounded-lg placeholder-slate-500 focus:outline-none focus:border-primary transition-colors min-w-0"
              />
              <button className="bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0">
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Medilink. All rights reserved.</p>
        <div className="flex gap-4">
          <button className="hover:text-slate-300 transition-colors">Terms</button>
          <button className="hover:text-slate-300 transition-colors">Privacy</button>
          <button className="hover:text-slate-300 transition-colors">Cookies</button>
        </div>
      </div>
    </div>
  </footer>
);

export default React.memo(Footer);