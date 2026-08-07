import React from "react";
import { AppContext } from "../context/AppContext";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ReviewForm from "../components/ReviewForm";
import EmptyState from "../components/EmptyState";
import PortalLayout from "../components/PortalLayout";
import { CalendarX2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDate = (slotDate) => {
  const [d, m, y] = slotDate.split("_");
  return `${d} ${months[Number(m)]} ${y}`;
};

const StatusBadge = ({ item }) => {
  if (item.cancelled) return <Badge variant="red">Cancelled</Badge>;
  if (item.isCompleted) return <Badge variant="green">Completed</Badge>;
  if (item.payment) return <Badge variant="teal">Paid</Badge>;
  return <Badge variant="amber">Pending Payment</Badge>;
};

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewModal, setReviewModal] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelItem, setConfirmCancelItem] = useState(null);
  const navigate = useNavigate();

  const getUserAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } });
      if (data.success) setAppointments(data.appointments.reverse());
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getMyReviews = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/review/my-reviews`, { headers: { token } });
      if (data.success) setMyReviews(data.reviews);
    } catch (error) {
      console.error(error);
    }
  };

  const hasReviewed = (appointmentId, targetType) =>
    myReviews.some(
      (r) =>
        (r.appointmentId?._id || r.appointmentId) === appointmentId &&
        (targetType === "doctor" ? r.doctorId : r.hospitalId)
    );

  const cancelAppointment = async (appointmentId) => {
    setCancellingId(appointmentId);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setCancellingId(null);
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/verifyRazorpay`,
            response,
            { headers: { token } }
          );
          if (data.success) {
            getUserAppointments();
            navigate("/my-appointments");
          }
        } catch (error) {
          console.error(error);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-razorpay`,
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) initPay(data.order);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
      getMyReviews();
    }
  }, [token]);

  if (loading) {
    return (
      <PortalLayout>
        <div>
          <h1 className="section-title mb-8" style={{ fontSize: "1.85rem" }}>My Appointments</h1>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="appt-card">
                <div className="flex gap-4">
                  <Skeleton className="w-24 h-28 rounded-xl" />
                  <div className="flex-1 space-y-3 pt-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (appointments.length === 0) {
    return (
      <PortalLayout>
        <div>
          <h1 className="section-title mb-8" style={{ fontSize: "1.85rem" }}>My Appointments</h1>
          <div className="flex flex-col items-center justify-center text-center">
            <EmptyState
              icon={CalendarX2}
              title="No Appointments Yet"
              subtitle="You haven't booked any appointments. Find a doctor and schedule your first consultation!"
            />
            <Button onClick={() => navigate("/doctors")} variant="gradient" className="mt-2">
              Find a Doctor
            </Button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">My Appointments</h1>
          <p className="text-text-muted mt-1">{appointments.length} appointment{appointments.length !== 1 ? "s" : ""} found</p>
        </div>
        <Button onClick={() => navigate("/doctors")} variant="gradient" size="sm">
          + New Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: appointments.length, icon: "📅", color: "bg-slate-50" },
          { label: "Upcoming", value: appointments.filter(a => !a.cancelled && !a.isCompleted).length, icon: "⏰", color: "bg-teal-50" },
          { label: "Completed", value: appointments.filter(a => a.isCompleted).length, icon: "✅", color: "bg-green-50" },
          { label: "Cancelled", value: appointments.filter(a => a.cancelled).length, icon: "❌", color: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 flex items-center gap-3`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xl font-extrabold text-text-primary">{s.value}</p>
              <p className="text-xs text-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Appointments list */}
      <div className="flex flex-col gap-4">
        {appointments.map((item, index) => (
          <div key={index} className="appt-card animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Doctor image */}
              <div className="flex-shrink-0">
                <div className="w-24 h-28 rounded-xl overflow-hidden bg-gradient-card">
                  <img
                    src={item.docData.image}
                    alt={item.docData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                  <h3 className="text-base font-bold text-text-primary">{item.docData.name}</h3>
                  <StatusBadge item={item} />
                </div>
                <p className="text-sm text-primary font-medium mb-2">{item.docData.speciality}</p>

                <div className="flex flex-col gap-1.5 text-sm text-text-muted">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 text-text-muted/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className="text-xs">{item.docData.address?.line1}{item.docData.address?.line2 ? `, ${item.docData.address.line2}` : ""}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 text-text-muted/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" />
                    </svg>
                    <span className="text-xs font-medium text-text-secondary">
                      {formatDate(item.slotDate)} &nbsp;·&nbsp; {item.slotTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row sm:flex-col gap-2 sm:justify-end sm:min-w-[160px]">
                {!item.cancelled && item.payment && !item.isCompleted && (
                  <Button variant="success" size="sm" className="w-full justify-center cursor-default opacity-90" disabled>
                    ✅ Paid
                  </Button>
                )}
                {!item.cancelled && !item.payment && !item.isCompleted && (
                  <Button
                    onClick={() => appointmentRazorpay(item._id)}
                    variant="gradient"
                    size="sm"
                    className="shine w-full justify-center"
                  >
                    Pay Online
                  </Button>
                )}
                {!item.cancelled && !item.isCompleted && (
                  <Button
                    onClick={() => setConfirmCancelItem(item)}
                    disabled={cancellingId === item._id}
                    variant="brand-ghost"
                    size="sm"
                    className="border-danger/30 text-danger hover:bg-red-50 w-full justify-center"
                  >
                    {cancellingId === item._id ? "Cancelling..." : "Cancel"}
                  </Button>
                )}
                {item.cancelled && !item.isCompleted && (
                  <Badge variant="red" className="justify-center py-2 w-full">Appointment Cancelled</Badge>
                )}
                {item.isCompleted && (
                  <>
                    <Badge variant="green" className="justify-center py-2 w-full">✅ Completed</Badge>
                    {hasReviewed(item._id, "doctor") ? (
                      <Badge variant="teal" className="justify-center py-2 w-full text-[11px]">✓ Doctor Reviewed</Badge>
                    ) : (
                      <Button
                        onClick={() =>
                          setReviewModal({
                            targetType: "doctor",
                            targetId: item.docId,
                            targetName: item.docData?.name,
                            appointmentId: item._id,
                          })
                        }
                        variant="secondary"
                        size="sm"
                        className="w-full justify-center"
                      >
                        ⭐ Rate Doctor
                      </Button>
                    )}
                    {hasReviewed(item._id, "hospital") ? (
                      <Badge variant="teal" className="justify-center py-2 w-full text-[11px]">✓ Hospital Reviewed</Badge>
                    ) : (
                      <Button
                        onClick={() =>
                          setReviewModal({
                            targetType: "hospital",
                            targetId: item.hospitalId,
                            targetName: "Your visit on " + formatDate(item.slotDate),
                            appointmentId: item._id,
                          })
                        }
                        variant="brand-ghost"
                        size="sm"
                        className="w-full justify-center"
                      >
                        ⭐ Rate Hospital
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ReviewForm
        open={!!reviewModal}
        onClose={() => setReviewModal(null)}
        targetType={reviewModal?.targetType}
        targetId={reviewModal?.targetId}
        targetName={reviewModal?.targetName}
        appointmentId={reviewModal?.appointmentId}
        onSuccess={getMyReviews}
      />

      <AlertDialog open={!!confirmCancelItem} onOpenChange={(open) => !open && setConfirmCancelItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Your appointment with {confirmCancelItem?.docData?.name} on{" "}
              {confirmCancelItem ? formatDate(confirmCancelItem.slotDate) : ""} will be cancelled. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              variant="solid-destructive"
              onClick={() => {
                const item = confirmCancelItem;
                setConfirmCancelItem(null);
                if (item) cancelAppointment(item._id);
              }}
            >
              Yes, Cancel It
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalLayout>
  );
};

export default MyAppointments;