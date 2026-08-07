import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import StarRating from "./StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Modal review form, reused for both doctor and hospital targets, and for
// both creating a new review and editing an existing one (pass `editReview`
// to prefill the fields and PATCH instead of POST). Callers that need fresh
// prefilled state per target should render this with a changing `key`.
const ReviewForm = ({ open, onClose, targetType, targetId, targetName, appointmentId, editReview, onSuccess }) => {
  const { backendUrl, token } = useContext(AppContext);

  const [rating, setRating] = useState(() => editReview?.rating || 0);
  const [title, setTitle] = useState(() => editReview?.title || "");
  const [comment, setComment] = useState(() => editReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = Boolean(editReview);

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
      const { data } = isEditMode
        ? await axios.patch(
            `${backendUrl}/api/review/${editReview._id}`,
            { rating, title: title.trim(), comment: comment.trim() },
            { headers: { token } }
          )
        : await axios.post(
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
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-text-primary">
            {isEditMode ? "Edit Your Review" : `Rate ${targetType === "doctor" ? "Doctor" : "Hospital"}`}
          </DialogTitle>
          <DialogDescription className="text-text-muted">{targetName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Your Rating</p>
            <StarRating interactive value={rating} onChange={setRating} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="review-title" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Title
            </Label>
            <Input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Sum up your experience"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="review-comment" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Comment
            </Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Share details about your experience..."
              required
            />
          </div>

          <Button type="submit" variant="gradient" disabled={submitting} className="shine w-full">
            {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Submit Review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
