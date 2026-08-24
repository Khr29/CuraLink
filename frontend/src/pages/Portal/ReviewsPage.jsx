import React, { useContext, useState, useCallback, useEffect, useMemo } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { MessageSquare, Stethoscope, Building2 } from "lucide-react";
import StarRating from "../../components/StarRating";
import ReviewForm from "../../components/ReviewForm";
import EmptyState from "../../components/EmptyState";
import PortalLayout from "../../components/PortalLayout";

const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatSlotDate = (slotDate) => {
  if (!slotDate) return "";
  const [d, m, y] = slotDate.split("_");
  return `${d} ${months[Number(m)]} ${y}`;
};

const ReviewCard = ({ review, onEdit, onDelete, deleting }) => {
  const target = review.doctorId || review.hospitalId;
  const isDoctor = !!review.doctorId;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-lg bg-gradient-card flex items-center justify-center flex-shrink-0">
            {isDoctor ? <Stethoscope size={15} className="text-primary" /> : <Building2 size={15} className="text-secondary" />}
          </span>
          <div>
            <p className="text-sm font-bold text-text-primary">{target?.name || "Unknown"}</p>
            <p className="text-xs text-text-muted">
              {formatSlotDate(review.appointmentId?.slotDate)}
              {review.appointmentId?.slotTime ? ` · ${review.appointmentId.slotTime}` : ` · ${new Date(review.createdAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {!review.isVisible && <span className="badge badge-slate text-[10px] mb-2">Hidden by admin</span>}

      <h4 className="text-sm font-semibold text-text-primary mt-2">{review.title}</h4>
      <p className="text-sm text-text-secondary mt-1 leading-relaxed">{review.comment}</p>

      {review.adminReply && (
        <div className="mt-3 bg-gradient-card rounded-xl p-3 border border-slate-100">
          <p className="text-xs font-bold text-primary mb-1">Response from CuraLink</p>
          <p className="text-xs text-text-secondary">{review.adminReply}</p>
        </div>
      )}
      {review.reply?.text && (
        <div className="mt-3 bg-gradient-card rounded-xl p-3 border border-slate-100">
          <p className="text-xs font-bold text-primary mb-1">Response from {target?.name}</p>
          <p className="text-xs text-text-secondary">{review.reply.text}</p>
        </div>
      )}

      <div className="flex items-center gap-3 mt-3">
        {review.editable ? (
          <button onClick={() => onEdit(review)} className="btn btn-ghost btn-sm">Edit</button>
        ) : (
          <span className="text-xs text-text-muted">Edit window expired</span>
        )}
        <button
          onClick={() => onDelete(review._id)}
          disabled={deleting === review._id}
          className="btn btn-ghost btn-sm border-danger/30 text-danger hover:bg-red-50"
        >
          {deleting === review._id ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

const ReviewsPage = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("doctor");
  const [editingReview, setEditingReview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMyReviews = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/review/my-reviews`, { headers: { token } });
      if (data.success) setReviews(data.reviews);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    if (token) fetchMyReviews();
  }, [token, fetchMyReviews]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    setDeletingId(reviewId);
    try {
      const { data } = await axios.delete(`${backendUrl}/api/review/${reviewId}`, { headers: { token } });
      if (data.success) {
        toast.success(data.message);
        fetchMyReviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const doctorReviews = useMemo(() => reviews.filter((r) => r.doctorId), [reviews]);
  const hospitalReviews = useMemo(() => reviews.filter((r) => r.hospitalId), [reviews]);
  const activeList = tab === "doctor" ? doctorReviews : hospitalReviews;

  return (
    <PortalLayout>
      <div className="mb-6">
        <h1 className="section-title" style={{ fontSize: "1.85rem" }}>My Reviews</h1>
        <p className="text-text-muted mt-1">Everything you've written for doctors and hospitals.</p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("doctor")}
          className={`filter-pill w-auto inline-flex items-center gap-1.5 ${tab === "doctor" ? "active" : ""}`}
        >
          <Stethoscope size={14} /> Doctor Reviews ({doctorReviews.length})
        </button>
        <button
          onClick={() => setTab("hospital")}
          className={`filter-pill w-auto inline-flex items-center gap-1.5 ${tab === "hospital" ? "active" : ""}`}
        >
          <Building2 size={14} /> Hospital Reviews ({hospitalReviews.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => <div key={i} className="profile-section animate-pulse h-24" />)}
        </div>
      ) : activeList.length === 0 ? (
        <div className="profile-section">
          <EmptyState
            icon={MessageSquare}
            title={`No ${tab === "doctor" ? "Doctor" : "Hospital"} Reviews Yet`}
            subtitle={`Reviews you write for ${tab === "doctor" ? "doctors" : "hospitals"} will show up here.`}
            compact
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {activeList.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onEdit={setEditingReview}
              onDelete={handleDelete}
              deleting={deletingId}
            />
          ))}
        </div>
      )}

      <ReviewForm
        key={editingReview?._id || "closed"}
        open={!!editingReview}
        onClose={() => setEditingReview(null)}
        targetType={editingReview?.doctorId ? "doctor" : "hospital"}
        targetName={editingReview ? (editingReview.doctorId || editingReview.hospitalId)?.name : ""}
        editReview={editingReview}
        onSuccess={fetchMyReviews}
      />
    </PortalLayout>
  );
};

export default ReviewsPage;
