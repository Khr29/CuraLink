import { useContext, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

// Shared by the Doctor Profile and Hospital Profile pages: determines
// whether the logged-in user may write a review for `targetId` (a doctor
// or hospital, per `targetType`) — i.e. they have at least one completed,
// non-cancelled appointment with that target that they haven't already
// reviewed. Reuses the existing appointments + my-reviews endpoints rather
// than adding a dedicated eligibility API.
const useReviewEligibility = (targetType, targetId) => {
  const { backendUrl, token } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [appointmentId, setAppointmentId] = useState(null);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const targetField = targetType === "doctor" ? "docId" : "hospitalId";
  const reviewField = targetType === "doctor" ? "doctorId" : "hospitalId";

  const refresh = useCallback(async () => {
    if (!token || !targetId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [appointmentsRes, reviewsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } }),
        axios.get(`${backendUrl}/api/review/my-reviews`, { headers: { token } }),
      ]);

      const myReviews = reviewsRes.data.success ? reviewsRes.data.reviews : [];
      const reviewedAppointmentIds = new Set(
        myReviews
          .filter((r) => r[reviewField])
          .map((r) => r.appointmentId?._id || r.appointmentId)
      );

      const eligibleAppointment = appointmentsRes.data.success
        ? appointmentsRes.data.appointments.find(
            (a) =>
              a[targetField] === targetId &&
              a.isCompleted &&
              !a.cancelled &&
              !reviewedAppointmentIds.has(a._id)
          )
        : null;

      const hasAnyReviewedAppointment = appointmentsRes.data.success
        ? appointmentsRes.data.appointments.some(
            (a) => a[targetField] === targetId && reviewedAppointmentIds.has(a._id)
          )
        : false;

      setAppointmentId(eligibleAppointment?._id || null);
      setAlreadyReviewed(!eligibleAppointment && hasAnyReviewedAppointment);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token, targetId, targetField, reviewField]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loading,
    isLoggedIn: Boolean(token),
    eligible: Boolean(appointmentId),
    appointmentId,
    alreadyReviewed,
    refresh,
  };
};

export default useReviewEligibility;
