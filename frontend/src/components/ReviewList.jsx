import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import StarRating from "./StarRating";

const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, secondsInUnit] of units) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) return `${count} ${name}${count > 1 ? "s" : ""} ago`;
  }
  return "Just now";
};

const LIMIT = 5;

// Renders a paginated ("load more") list of visible reviews for a doctor
// or hospital. `refreshKey` can be bumped by the parent to force a reload
// (e.g. right after the user submits a new review elsewhere on the page).
const ReviewList = ({ targetType, targetId, refreshKey }) => {
  const { backendUrl } = useContext(AppContext);

  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(
    async (pageToLoad) => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/review/${targetType}/${targetId}`,
          { params: { page: pageToLoad, limit: LIMIT } }
        );
        if (data.success) {
          setReviews((prev) => (pageToLoad === 1 ? data.reviews : [...prev, ...data.reviews]));
          setTotal(data.total);
          setPage(pageToLoad);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [backendUrl, targetType, targetId]
  );

  useEffect(() => {
    if (targetId) fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, refreshKey]);

  if (loading && reviews.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="appt-card animate-pulse h-24" />
        ))}
      </div>
    );
  }

  if (!loading && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-4xl mb-2">📝</div>
        <p className="text-text-muted text-sm">No reviews yet. Be the first to share your experience.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <div key={review._id} className="profile-section">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-card flex-shrink-0">
              {review.userId?.image ? (
                <img src={review.userId.image} alt={review.userId?.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                  {review.userId?.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-bold text-text-primary">{review.userId?.name || "Patient"}</span>
                {review.verifiedPatient && (
                  <span className="badge badge-teal text-[10px]">✓ Verified Patient</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-xs text-text-muted">{timeAgo(review.createdAt)}</span>
              </div>
              <h4 className="text-sm font-semibold text-text-primary mt-2">{review.title}</h4>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">{review.comment}</p>

              {review.adminReply && (
                <div className="mt-3 bg-gradient-card rounded-xl p-3 border border-slate-100">
                  <p className="text-xs font-bold text-primary mb-1">Response from CuraLink</p>
                  <p className="text-xs text-text-secondary">{review.adminReply}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {reviews.length < total && (
        <button
          onClick={() => fetchReviews(page + 1)}
          disabled={loading}
          className="btn btn-ghost btn-sm self-center"
        >
          {loading ? "Loading..." : `Load More (${total - reviews.length} more)`}
        </button>
      )}
    </div>
  );
};

export default ReviewList;
