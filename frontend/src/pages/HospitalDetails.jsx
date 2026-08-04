import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const HospitalDetails = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();

  const { backendUrl } = useContext(AppContext);

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);

  const getHospital = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/hospital/${hospitalId}`
      );

      if (data.success) {
        setHospital(data.hospital);
        setDoctors(data.doctors || []);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getHospital();
  }, [hospitalId]);

  if (!hospital) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in">
      {/* Hospital Details Hero */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Photo */}
        <div className="sm:w-72 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden bg-gradient-card aspect-square sm:aspect-auto sm:h-80">
            <img
              src={hospital.image}
              alt={hospital.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info card */}
        <div className="flex-1 profile-section">
          {/* Name + verified + subinfo */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2 flex-wrap">
                {hospital.name}
                <img src={assets.verified_icon} alt="Verified" className="w-5 h-5" />
              </h1>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                <p className="text-text-secondary text-sm">
                  {hospital.address?.city}, {hospital.address?.state}
                </p>
                <span className="badge badge-teal">{hospital.hospitalType}</span>
              </div>
            </div>
          </div>

          {/* Rating row */}
          <div className="flex items-center gap-4 py-3 border-t border-b border-slate-100 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-text-secondary">{hospital.rating}</span>
              <span className="text-xs text-text-muted">(200+ reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-text-muted">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verified Hospital
            </div>
          </div>

          {/* About */}
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary mb-2">
              <img src={assets.info_icon} alt="" className="w-4 h-4" />
              About
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">{hospital.description}</p>
          </div>

          {/* Information Cards (Replacing Fee/Availability) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-card rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <p className="text-xs text-text-muted mb-0.5">Rating</p>
              <p className="text-xl font-extrabold text-primary">{hospital.rating}</p>
            </div>
            <div className="bg-gradient-card rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <p className="text-xs text-text-muted mb-1.5">Status</p>
              <span className={`badge ${hospital.active ? "badge-green" : "badge-slate"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${hospital.active ? "bg-accent animate-pulse" : "bg-slate-400"}`} />
                {hospital.active ? "Open" : "Closed"}
              </span>
            </div>
            <div className="bg-gradient-card rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <p className="text-xs text-text-muted mb-0.5">Beds</p>
              <p className="text-xl font-extrabold text-primary">{hospital.beds}</p>
            </div>
            <div className="bg-gradient-card rounded-xl p-4 flex flex-col justify-center items-center text-center">
              <p className="text-xs text-text-muted mb-0.5">Hospital Type</p>
              <p className="text-sm mt-1 font-extrabold text-primary truncate w-full">{hospital.hospitalType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="profile-section mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-4">Departments</h2>
        <div className="flex flex-wrap gap-2">
          {hospital.departments?.map((dept, index) => (
            <span key={index} className="badge bg-slate-50 text-text-secondary border border-slate-200 px-4 py-2 rounded-full text-sm font-medium">
              {dept}
            </span>
          ))}
        </div>
      </div>

      {/* Facilities */}
      <div className="profile-section mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-4">Facilities</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hospital.facilities?.map((facility, index) => (
            <div key={index} className="bg-gradient-card rounded-xl p-4 flex items-center gap-3 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0 text-accent">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-text-secondary">{facility}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Doctors */}
      <div className="profile-section mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-6">Doctors</h2>
        {doctors.length === 0 ? (
          <div className="flex items-center gap-2 text-text-muted text-sm py-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            No doctors found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all group flex flex-col">
                <div className="bg-gradient-card aspect-[4/3] overflow-hidden">
                  <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-50 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Available
                    </div>
                  </div>
                  <h3 className="font-extrabold text-lg text-text-primary truncate">{doctor.name}</h3>
                  <p className="text-sm text-text-secondary mb-4">{doctor.speciality}</p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-primary">₹{doctor.fees}</p>
                    <p className="text-xs text-text-muted">{doctor.experience}</p>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/appointment/${doctor._id}`)}
                    className="mt-4 btn btn-primary w-full shine text-sm py-2.5"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gallery */}
      <div className="profile-section mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-4">Hospital Gallery</h2>
        {hospital.gallery?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hospital.gallery.map((img, index) => (
              <div key={index} className="rounded-xl overflow-hidden aspect-video bg-gradient-card">
                <img src={img} alt={`Hospital ${index}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted">No gallery images available.</p>
        )}
      </div>

      {/* Contact & Location Block */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Contact Information */}
        <div className="flex-1 profile-section">
          <h2 className="text-lg font-bold text-text-primary mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-card flex items-center justify-center flex-shrink-0 text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-sm font-semibold text-text-secondary">{hospital.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-card flex items-center justify-center flex-shrink-0 text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.733.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-0.5">Phone</p>
                <p className="text-sm font-semibold text-text-secondary">{hospital.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-card flex items-center justify-center flex-shrink-0 text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-0.5">Website</p>
                <p className="text-sm font-semibold text-text-secondary">{hospital.website || "Not Available"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-card flex items-center justify-center flex-shrink-0 text-accent">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-0.5">Address</p>
                <p className="text-sm font-semibold text-text-secondary">
                  {hospital.address?.street}, {hospital.address?.city}, {hospital.address?.state}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Maps */}
        <div className="flex-1 profile-section flex flex-col">
          <h2 className="text-lg font-bold text-text-primary mb-4">Location</h2>
          <div className="flex-1 bg-gradient-card rounded-xl border border-slate-100 flex flex-col items-center justify-center p-8 text-center gap-4 min-h-[200px]">
            {hospital.location ? (
              <>
                <div className="w-14 h-14 bg-white shadow-sm text-accent rounded-full flex items-center justify-center mb-1">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${hospital.location.latitude},${hospital.location.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-lg shine w-full sm:w-auto"
                >
                  <svg className="w-5 h-5 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Open in Google Maps
                </a>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2.25a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-2.25-2.25H3m0 6h2.25A2.25 2.25 0 017.5 15.25v2.25m-4.5-4.5V13m0 0H3m0 0h2.25m4.5-4.5H9.75M9.75 6H12m0 0h2.25M12 6v2.25m0 4.5v2.25m-4.5-4.5h2.25m0 0H12m0-4.5h2.25m-4.5 4.5H9.75" /></svg>
                <p className="text-sm text-text-muted">No location data available.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Placeholder */}
      <div className="profile-section mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-4">Reviews</h2>
        <div className="bg-gradient-card rounded-xl p-10 flex flex-col items-center justify-center text-center border border-slate-100">
          <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <h3 className="text-base font-bold text-text-primary">No Reviews Yet</h3>
          <p className="text-sm text-text-muted mt-1">Users will be able to rate and review this hospital soon.</p>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetails;