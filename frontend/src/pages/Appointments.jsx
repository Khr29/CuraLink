import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctor from "../components/RelatedDoctor";
import StarRating from "../components/StarRating";
import ReviewList from "../components/ReviewList";
import RatingDistribution from "../components/RatingDistribution";
import WriteReviewCTA from "../components/WriteReviewCTA";
import ReviewForm from "../components/ReviewForm";
import useReviewEligibility from "../hooks/useReviewEligibility";
import { toast } from "react-toastify";
import axios from "axios";
import { formatExperience } from "../utils/experience";
import EmptyState from "../components/EmptyState";
import { CalendarX2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewsRefreshKey, setReviewsRefreshKey] = useState(0);
  const [reviewModalAppointmentId, setReviewModalAppointmentId] = useState(null);

  const reviewEligibility = useReviewEligibility("doctor", docId);

  const handleReviewSuccess = useCallback(() => {
    setReviewModalAppointmentId(null);
    setReviewsRefreshKey((k) => k + 1);
    reviewEligibility.refresh();
    getDoctorsData();
  }, [reviewEligibility, getDoctorsData]);

  const fetchDocInfo = useCallback(() => {
    const doctor = doctors.find((doc) => doc._id === docId);
    setDocInfo(doctor || null);
  }, [doctors, docId]);

  const getAvailableSlots = useCallback(() => {
    if (!docInfo) return;
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      // `date` is the calendar day this box represents — kept separate from
      // the slot-generation cursor below so the day label always renders
      // even when that day happens to produce zero bookable time slots
      // (e.g. "today" after the clinic's last slot has already passed).
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const cursor = new Date(date);
      const endTime = new Date(date);
      endTime.setHours(21, 0, 0, 0);
      if (i === 0) {
        cursor.setHours(cursor.getHours() > 10 ? cursor.getHours() + 1 : 10);
        cursor.setMinutes(cursor.getMinutes() > 30 ? 30 : 0);
      } else {
        cursor.setHours(10);
        cursor.setMinutes(0);
      }
      const timeSlots = [];
      while (cursor < endTime) {
        const formattedTime = cursor.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const day = cursor.getDate();
        const month = cursor.getMonth() + 1;
        const year = cursor.getFullYear();
        const slotDate = `${day}_${month}_${year}`;
        const isAvailable = !docInfo.slots_booked?.[slotDate]?.includes(formattedTime);
        if (isAvailable) timeSlots.push({ datetime: new Date(cursor), time: formattedTime });
        cursor.setMinutes(cursor.getMinutes() + 30);
      }
      days.push({ date, slots: timeSlots });
    }
    setDocSlots(days);
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
      const date = docSlots[slotIndex].date;
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
                <Badge variant="teal">{formatExperience(docInfo.experience)}</Badge>
              </div>
            </div>
          </div>

          {/* Rating row */}
          <div className="flex items-center gap-4 py-3 border-t border-b border-slate-100 mb-4">
            <div className="flex items-center gap-1.5">
              <StarRating rating={docInfo.averageRating} />
              <span className="text-sm font-semibold text-text-secondary">
                {docInfo.totalReviews > 0 ? docInfo.averageRating.toFixed(1) : "New"}
              </span>
              <span className="text-xs text-text-muted">
                {docInfo.totalReviews > 0 ? `(${docInfo.totalReviews} reviews)` : "(no reviews yet)"}
              </span>
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
              <Badge variant={docInfo.available ? "green" : "slate"}>
                <span className={`w-1.5 h-1.5 rounded-full ${docInfo.available ? "bg-accent animate-pulse" : "bg-slate-400"}`} />
                {docInfo.available ? "Available Today" : "Unavailable"}
              </Badge>
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
          {docSlots.map((day, index) => (
            <button
              key={index}
              onClick={() => { setSlotIndex(index); setSlotTime(""); }}
              className={`slot-day flex-shrink-0 ${slotIndex === index ? "active" : ""}`}
            >
              <p className="text-xs font-bold">{daysOfWeek[day.date.getDay()]}</p>
              <p className="text-lg font-extrabold mt-0.5">{day.date.getDate()}</p>
            </button>
          ))}
        </div>

        {/* Time selector */}
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Choose Time</p>
        {docSlots[slotIndex]?.slots.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {docSlots[slotIndex].slots.map((item, index) => (
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
          <div className="mb-6">
            <EmptyState icon={CalendarX2} title="No Slots Available" subtitle="Please choose a different day." compact />
          </div>
        )}

        {/* Book button */}
        <Button
          onClick={bookAppointment}
          disabled={booking || !slotTime}
          variant="gradient"
          size="xl"
          className="shine w-full sm:w-auto"
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
        </Button>
      </div>

      {/* Reviews */}
      <div className="profile-section mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h2 className="text-lg font-bold text-text-primary">Patient Reviews</h2>
          {reviewStats && reviewStats.total > 0 && (
            <WriteReviewCTA
              eligibility={reviewEligibility}
              onOpenModal={setReviewModalAppointmentId}
              targetLabel="doctor"
            />
          )}
        </div>
        {reviewStats && reviewStats.total > 0 && (
          <div className="pb-6 mb-6 border-b border-slate-100">
            <RatingDistribution
              distribution={reviewStats.distribution}
              total={reviewStats.total}
              averageRating={docInfo.averageRating}
            />
          </div>
        )}
        <ReviewList
          targetType="doctor"
          targetId={docId}
          refreshKey={reviewsRefreshKey}
          onStats={setReviewStats}
          eligibility={reviewEligibility}
          onWriteReview={setReviewModalAppointmentId}
        />
      </div>

      <RelatedDoctor docId={docId} speciality={docInfo.speciality} />

      <ReviewForm
        open={!!reviewModalAppointmentId}
        onClose={() => setReviewModalAppointmentId(null)}
        targetType="doctor"
        targetId={docId}
        targetName={docInfo.name}
        appointmentId={reviewModalAppointmentId}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default React.memo(Appointments);