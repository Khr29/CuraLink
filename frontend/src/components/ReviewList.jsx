import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { MessageSquare } from "lucide-react";
import { AppContext } from "../context/AppContext";
import StarRating from "./StarRating";
import WriteReviewCTA from "./WriteReviewCTA";
import EmptyState from "./EmptyState";
import timeAgo from "../utils/timeAgo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const LIMIT = 5;

// Renders a paginated ("load more") list of visible reviews for a doctor
// or hospital. `refreshKey` can be bumped by the parent to force a reload
// (e.g. right after the user submits a new review elsewhere on the page).
// `onStats` (optional) is called with { total, distribution } after each
// fetch, so a parent can render a <RatingDistribution> without a second call.
// `eligibility` + `onWriteReview` (optional) drive the "Write the First
// Review" call-to-action shown when the list is empty.
const ReviewList = ({ targetType, targetId, refreshKey, onStats, eligibility, onWriteReview }) => {
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
          onStats?.({ total: data.total, distribution: data.distribution });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!loading && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <EmptyState icon={MessageSquare} title="No reviews yet" subtitle="Be the first to share your experience." />
        {eligibility && (
          <WriteReviewCTA
            eligibility={eligibility}
            onOpenModal={onWriteReview}
            size="large"
            label="⭐ Write the First Review"
            targetLabel={targetType}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <div key={review._id} className="profile-section">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0 bg-gradient-card">
              <AvatarImage src={review.userId?.image} alt={review.userId?.name} />
              <AvatarFallback className="bg-transparent text-primary font-bold">
                {review.userId?.name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-bold text-text-primary">{review.userId?.name || "Patient"}</span>
                {review.verifiedPatient && (
                  <Badge variant="teal" className="text-[10px]">✓ Verified Patient</Badge>
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

              {review.reply?.text && (
                <div className="mt-3 bg-secondary/5 rounded-xl p-3 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="teal" className="text-[10px]">✓ Verified</Badge>
                    <p className="text-xs font-bold text-secondary">
                      {review.reply.repliedBy === "hospital" ? "Hospital Response" : "Doctor Response"}
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">{review.reply.text}</p>
                  <p className="text-[11px] text-text-muted mt-1">{timeAgo(review.reply.repliedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {reviews.length < total && (
        <Button
          variant="brand-ghost"
          size="sm"
          onClick={() => fetchReviews(page + 1)}
          disabled={loading}
          className="self-center"
        >
          {loading ? "Loading..." : `Load More (${total - reviews.length} more)`}
        </Button>
      )}
    </div>
  );
};

export default ReviewList;
