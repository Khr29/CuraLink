import React, { useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Bell, CalendarDays, FileText, MessageSquare } from "lucide-react";
import { AppContext } from "../../context/AppContext";
import PortalLayout from "../../components/PortalLayout";
import EmptyState from "../../components/EmptyState";
import { deriveNotifications } from "../../utils/deriveNotifications";

const iconFor = (type) => {
  if (type === "appointment") return { Icon: CalendarDays, bg: "#EFF6FF", color: "#2563EB" };
  if (type === "record") return { Icon: FileText, bg: "#F0FDFA", color: "#0D9488" };
  return { Icon: MessageSquare, bg: "#FFFBEB", color: "#D97706" };
};

const timeAgo = (date) => {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const NotificationsPage = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [apptRes, recordRes, reviewRes] = await Promise.all([
          axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } }),
          axios.get(`${backendUrl}/api/medical-records/mine`, { headers: { token } }),
          axios.get(`${backendUrl}/api/review/my-reviews`, { headers: { token } }),
        ]);
        if (apptRes.data.success) setAppointments(apptRes.data.appointments);
        if (recordRes.data.success) setRecords(recordRes.data.records);
        if (reviewRes.data.success) setReviews(reviewRes.data.reviews);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [backendUrl, token]);

  const notifications = useMemo(
    () => deriveNotifications({ appointments, records, reviews }),
    [appointments, records, reviews]
  );

  return (
    <PortalLayout>
      <div className="mb-6">
        <h1 className="section-title" style={{ fontSize: "1.85rem" }}>Notifications</h1>
        <p className="text-text-muted mt-1">Recent activity across your appointments, records and reviews.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="profile-section animate-pulse h-16" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="profile-section">
          <EmptyState icon={Bell} title="You're all caught up" subtitle="New activity on your appointments, records and reviews will show up here." />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notifications.map((item) => {
            const { Icon, bg, color } = iconFor(item.type);
            return (
              <div key={item.id} className="card flex items-center gap-3.5 p-4">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                  <Icon size={17} color={color} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{item.message}</p>
                </div>
                <span className="text-xs text-text-muted flex-shrink-0">{timeAgo(item.date)}</span>
              </div>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
};

export default NotificationsPage;
