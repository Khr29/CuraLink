// The platform has no persisted notification model (Task 13 only added
// security *emails*, not an in-app notification center), and building a
// full new backend feature isn't warranted just for a portal nav item —
// so notifications are derived client-side from data the patient already
// has access to (appointments, medical records, reviews). Shared by the
// Dashboard's summary count and the dedicated Notifications page so the
// two never drift out of sync.
const DAY_MS = 24 * 60 * 60 * 1000;

const parseSlotDateTime = (slotDate) => {
  if (typeof slotDate !== "string") return null;
  const [day, month, year] = slotDate.split("_").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

export const deriveNotifications = ({ appointments = [], records = [], reviews = [] }) => {
  const items = [];
  const now = new Date();

  for (const appt of appointments) {
    const apptDate = parseSlotDateTime(appt.slotDate);
    if (!apptDate) continue;

    if (!appt.cancelled && !appt.isCompleted && apptDate >= now && apptDate - now <= 3 * DAY_MS) {
      items.push({
        id: `appt-upcoming-${appt._id}`,
        type: "appointment",
        title: "Upcoming appointment",
        message: `With ${appt.docData?.name || "your doctor"} on ${appt.slotDate.replaceAll("_", "/")} at ${appt.slotTime}`,
        date: apptDate,
      });
    }

    if (appt.isCompleted) {
      items.push({
        id: `appt-completed-${appt._id}`,
        type: "appointment",
        title: "Appointment completed",
        message: `Your visit with ${appt.docData?.name || "your doctor"} is complete`,
        date: apptDate,
      });
    }

    if (appt.cancelled) {
      items.push({
        id: `appt-cancelled-${appt._id}`,
        type: "appointment",
        title: "Appointment cancelled",
        message: `Your appointment with ${appt.docData?.name || "your doctor"} on ${appt.slotDate.replaceAll("_", "/")} was cancelled`,
        date: apptDate,
      });
    }
  }

  for (const record of records) {
    if (record.status === "finalized") {
      items.push({
        id: `record-${record._id}`,
        type: "record",
        title: "Medical record available",
        message: `${record.doctorId?.name || "Your doctor"} finalized a new medical record`,
        date: new Date(record.finalizedAt || record.updatedAt),
      });
    }
  }

  for (const review of reviews) {
    const target = review.doctorId || review.hospitalId;
    if (review.reply?.text) {
      items.push({
        id: `review-reply-${review._id}`,
        type: "review",
        title: "Reply to your review",
        message: `${target?.name || "They"} replied to your review`,
        date: new Date(review.reply.repliedAt || review.updatedAt),
      });
    }
    if (review.adminReply) {
      items.push({
        id: `review-admin-reply-${review._id}`,
        type: "review",
        title: "Response from CuraLink",
        message: "CuraLink responded to your review",
        date: new Date(review.updatedAt),
      });
    }
  }

  return items
    .filter((item) => item.date && !Number.isNaN(item.date.getTime()))
    .sort((a, b) => b.date - a.date);
};
