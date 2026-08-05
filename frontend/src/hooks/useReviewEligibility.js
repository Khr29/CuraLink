import { useContext, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";

// Shared by the Doctor Profile and Hospital Profile pages: determines
// whether the logged-in user may write a review for `targetId`.
//
// Doctor reviews (targetType === "doctor") still require at least one
// completed, non-cancelled appointment with that doctor that hasn't already
// been reviewed — this logic is unchanged.
//
// Hospital reviews (targetType === "hospital") no longer require a
// completed appointment: any authenticated user is eligible, provided they
// haven't already reviewed that hospital (one review per user per
// hospital).
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
      if (targetType === "hospital") {
        const { data } = await axios.get(`${backendUrl}/api/review/my-reviews`, { headers: { token } });
        const myReviews = data.success ? data.reviews : [];
        const hasReviewed = myReviews.some((r) => {
          const id = r.hospitalId?._id || r.hospitalId;
          return id && id.toString() === targetId;
        });
        setAppointmentId(null);
        setAlreadyReviewed(hasReviewed);
        return;
      }

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
  }, [backendUrl, token, targetId, targetType, targetField, reviewField]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const eligible =
    targetType === "hospital" ? Boolean(token) && !alreadyReviewed : Boolean(appointmentId);

  return {
    loading,
    isLoggedIn: Boolean(token),
    eligible,
    appointmentId,
    alreadyReviewed,
    refresh,
  };
};

export default useReviewEligibility;
