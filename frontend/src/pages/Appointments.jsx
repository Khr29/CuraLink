import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctor from "../components/RelatedDoctor";
import { toast } from "react-toastify";
import axios from "axios";

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const Appointments = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [booking, setBooking] = useState(false);

  const fetchDocInfo = useCallback(() => {
    const doctor = doctors.find((doc) => doc._id === docId);
    setDocInfo(doctor || null);
  }, [doctors, docId]);

  const getAvailableSlots = useCallback(() => {
    if (!docInfo) return;
    const slots = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);
      if (i === 0) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }
      const timeSlots = [];
      while (currentDate < endTime) {
        const formattedTime = currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const slotDate = `${day}_${month}_${year}`;
        const isAvailable = !docInfo.slots_booked?.[slotDate]?.includes(formattedTime);
        if (isAvailable) timeSlots.push({ datetime: new Date(currentDate), time: formattedTime });
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      slots.push(timeSlots);
    }
    setDocSlots(slots);
  }, [docInfo]);

  const bookAppointment = useCallback(async () => {
    if (!token) {
      toast.warn("Please login to book an appointment");
      return navigate("/login");
    }
    if (!slotTime) {
      toast.warn("Please select a time slot");
      return;
    }
    setBooking(true);
    try {
      const date = docSlots[slotIndex][0].datetime;
      const slotDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;
      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        { docId, slotDate, slotTime },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        await getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setBooking(false);
    }
  }, [token, docSlots, slotIndex, slotTime, backendUrl, docId, navigate, getDoctorsData]);

  useEffect(() => { fetchDocInfo(); }, [fetchDocInfo]);
  useEffect(() => { getAvailableSlots(); }, [getAvailableSlots]);

  if (!docInfo) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in">
      {/* Doctor Details */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Photo */}
        <div className="sm:w-72 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden bg-gradient-card aspect-square sm:aspect-auto sm:h-80">
            <img
              src={docInfo.image}
              alt={docInfo.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info card */}
        <div className="flex-1 profile-section">
          {/* Name + verified */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold text-text-primary flex items-center gap-2 flex-wrap">
                {docInfo.name}
                <img src={assets.verified_icon} alt="Verified" className="w-5 h-5" />
              </h1>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                <p className="text-text-secondary text-sm">
                  {docInfo.degree} · {docInfo.speciality}
                </p>
                <span className="badge badge-teal">{docInfo.experience}</span>
              </div>
            </div>
          </div>

          {/* Rating row */}
          <div className="flex items-center gap-4 py-3 border-t border-b border-slate-100 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-text-secondary">4.9</span>
              <span className="text-xs text-text-muted">(200+ reviews)</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-text-muted">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verified Doctor
            </div>
          </div>

          {/* About */}
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-text-primary mb-2">
              <img src={assets.info_icon} alt="" className="w-4 h-4" />
              About
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">{docInfo.about}</p>
          </div>

          {/* Fee */}
          <div className="flex items-center justify-between bg-gradient-card rounded-xl p-4">
            <div>
              <p className="text-xs text-text-muted mb-0.5">Consultation Fee</p>
              <p className="text-2xl font-extrabold text-primary">
                {currencySymbol}{docInfo.fees}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted mb-0.5">Availability</p>
              <span className={`badge ${docInfo.available ? "badge-green" : "badge-slate"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${docInfo.available ? "bg-accent animate-pulse" : "bg-slate-400"}`} />
                {docInfo.available ? "Available Today" : "Unavailable"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Slots */}
      <div className="profile-section mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-6">Select Appointment Slot</h2>

        {/* Day selector */}
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Choose Day</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-6">
          {docSlots.map((item, index) => (
            <button
              key={index}
              onClick={() => { setSlotIndex(index); setSlotTime(""); }}
              className={`slot-day flex-shrink-0 ${slotIndex === index ? "active" : ""}`}
            >
              <p className="text-xs font-bold">{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
              <p className="text-lg font-extrabold mt-0.5">{item[0] && item[0].datetime.getDate()}</p>
            </button>
          ))}
        </div>

        {/* Time selector */}
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Choose Time</p>
        {docSlots[slotIndex]?.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {docSlots[slotIndex].map((item, index) => (
              <button
                key={index}
                onClick={() => setSlotTime(item.time)}
                className={`slot-time ${item.time === slotTime ? "active" : ""}`}
              >
                {item.time.toLowerCase()}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-text-muted text-sm py-4 mb-6">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            No slots available for this day
          </div>
        )}

        {/* Book button */}
        <button
          onClick={bookAppointment}
          disabled={booking || !slotTime}
          className="btn btn-primary btn-lg shine w-full sm:w-auto"
        >
          {booking ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
              Confirm Appointment
            </>
          )}
        </button>
      </div>

      <RelatedDoctor docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default React.memo(Appointments);