import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import StarRating from "./StarRating";

// Modal review form, reused for both doctor and hospital targets.
// `targetType` is "doctor" | "hospital".
const ReviewForm = ({ open, onClose, targetType, targetId, targetName, appointmentId, onSuccess }) => {
  const { backendUrl, token } = useContext(AppContext);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setComment("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      toast.warn("Please select a star rating");
      return;
    }
    if (!title.trim() || !comment.trim()) {
      toast.warn("Please fill in a title and comment");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/review/add`,
        {
          appointmentId,
          [targetType === "doctor" ? "doctorId" : "hospitalId"]: targetId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        resetForm();
        onSuccess?.();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-lg font-bold text-text-primary mb-1">
          Rate {targetType === "doctor" ? "Doctor" : "Hospital"}
        </h2>
        <p className="text-sm text-text-muted mb-5">{targetName}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Your Rating</p>
            <StarRating interactive value={rating} onChange={setRating} />
          </div>

          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Title</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Sum up your experience"
              className="input w-full"
              required
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Comment</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Share details about your experience..."
              className="input w-full resize-none"
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary shine w-full">
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
