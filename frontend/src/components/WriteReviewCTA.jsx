import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Drives the "Write Review" entry point shared by the compact header button
// (Doctor/Hospital Profile reviews section) and the large empty-state CTA
// (rendered inside ReviewList when there are no reviews yet). Behavior
// branches on the `eligibility` state from useReviewEligibility:
//  - not logged in            -> prompt login
//  - logged in, already wrote -> "you already reviewed" badge, no button
//  - logged in, not eligible  -> button opens a friendly explainer instead of the modal
//  - eligible                 -> button opens the review modal
const WriteReviewCTA = ({ eligibility, onOpenModal, size = "default", label, targetLabel = "provider" }) => {
  const navigate = useNavigate();
  const [showWhyNot, setShowWhyNot] = useState(false);

  const { loading, isLoggedIn, eligible, alreadyReviewed, appointmentId } = eligibility;

  if (loading) return null;

  if (alreadyReviewed) {
    return (
      <span className="badge badge-teal">✓ You've reviewed this</span>
    );
  }

  const handleClick = () => {
    if (!isLoggedIn) {
      toast.warn("Please login to write a review");
      navigate("/login");
      return;
    }
    if (eligible) {
      onOpenModal(appointmentId);
      return;
    }
    setShowWhyNot(true);
  };

  const isLarge = size === "large";
  const buttonLabel = label || "⭐ Write Review";

  return (
    <div className={isLarge ? "flex flex-col items-center" : ""}>
      <button
        onClick={handleClick}
        className={`btn btn-primary shine ${isLarge ? "btn-lg" : "btn-sm"}`}
      >
        {buttonLabel}
      </button>
      {showWhyNot && (
        <p className={`text-xs text-text-muted mt-3 ${isLarge ? "text-center max-w-xs" : ""}`}>
          Only patients with a completed appointment for this {targetLabel} can write a review.
        </p>
      )}
    </div>
  );
};

export default WriteReviewCTA;
