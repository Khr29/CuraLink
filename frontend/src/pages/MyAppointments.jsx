import React from "react";
import { AppContext } from "../context/AppContext";
import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDate = (slotDate) => {
  const [d, m, y] = slotDate.split("_");
  return `${d} ${months[Number(m)]} ${y}`;
};

const StatusBadge = ({ item }) => {
  if (item.cancelled) return <span className="badge badge-red">Cancelled</span>;
  if (item.isCompleted) return <span className="badge badge-green">Completed</span>;
  if (item.payment) return <span className="badge badge-teal">Paid</span>;
  return <span className="badge badge-amber">Pending Payment</span>;
};

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const cancelAppointment = async (appointmentId) => {
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
      toast.error(error.message);
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
    if (token) getUserAppointments();
  }, [token]);

  if (loading) {
    return (
      <div className="py-8">
        <h1 className="section-title mb-8">My Appointments</h1>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="appt-card animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-28 bg-slate-100 rounded-xl" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="py-8">
        <h1 className="section-title mb-8">My Appointments</h1>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No Appointments Yet</h3>
          <p className="text-text-muted text-sm mb-6 max-w-sm">
            You haven't booked any appointments. Find a doctor and schedule your first consultation!
          </p>
          <button onClick={() => navigate("/doctors")} className="btn btn-primary">
            Find a Doctor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">My Appointments</h1>
          <p className="text-text-muted mt-1">{appointments.length} appointment{appointments.length !== 1 ? "s" : ""} found</p>
        </div>
        <button onClick={() => navigate("/doctors")} className="btn btn-primary btn-sm">
          + New Appointment
        </button>
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
                  <span className="btn btn-sm btn-success w-full justify-center cursor-default opacity-90">
                    ✅ Paid
                  </span>
                )}
                {!item.cancelled && !item.payment && !item.isCompleted && (
                  <button
                    onClick={() => appointmentRazorpay(item._id)}
                    className="btn btn-primary btn-sm shine w-full justify-center"
                  >
                    Pay Online
                  </button>
                )}
                {!item.cancelled && !item.isCompleted && (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="btn btn-sm btn-ghost border-danger/30 text-danger hover:bg-red-50 w-full justify-center"
                  >
                    Cancel
                  </button>
                )}
                {item.cancelled && !item.isCompleted && (
                  <span className="badge badge-red justify-center py-2">Appointment Cancelled</span>
                )}
                {item.isCompleted && (
                  <span className="badge badge-green justify-center py-2">✅ Completed</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;