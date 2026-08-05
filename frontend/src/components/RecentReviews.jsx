import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import StarRating from "./StarRating";
import timeAgo from "../utils/timeAgo";

const LIMIT = 6;

const ReviewCard = React.memo(({ review }) => {
  // Doctor names in this app already include the "Dr." prefix (e.g. "Dr.
  // Rohan Mehta"), so it isn't added again here.
  const target = review.doctorId || review.hospitalId;

  return (
    <div className="testimonial-card animate-slide-up">
      <div className="flex items-center gap-1 mb-3">
        <StarRating rating={review.rating} size="sm" />
      </div>
      <p className="text-text-secondary text-sm leading-relaxed mb-5 line-clamp-4">
        "{review.comment}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-card flex-shrink-0">
          {review.userId?.image ? (
            <img src={review.userId.image} alt={review.userId?.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary font-bold">
              {review.userId?.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{review.userId?.name || "Patient"}</p>
          <p className="text-xs text-text-muted truncate">
            {target?.name || "CuraLink"} · {timeAgo(review.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
});
ReviewCard.displayName = "ReviewCard";

// Latest genuine reviews from real patients across every doctor and
// hospital on the platform — a public, platform-wide feed (distinct from
// ReviewList.jsx, which is scoped to one doctor/hospital's own reviews).
const RecentReviews = () => {
  const { backendUrl } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/review/recent`, { params: { limit: LIMIT } });
        if (data.success) setReviews(data.reviews);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, [backendUrl]);

  // Nothing to show yet — don't render an empty/broken section
  if (!loading && reviews.length === 0) return null;

  return (
    <section className="py-20 md:py-24 px-4">
      <div className="text-center mb-14">
        <span className="section-tag">Real Feedback</span>
        <h2 className="section-title">Recent Patient Reviews</h2>
        <p className="section-subtitle mx-auto">
          Genuine, verified reviews from real CuraLink patients.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="testimonial-card animate-pulse h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}
    </section>
  );
};

export default React.memo(RecentReviews);
