import React, { useContext, useState, useCallback, useEffect, useMemo } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { MessageSquare, Stethoscope, Building2 } from "lucide-react";
import StarRating from "../../components/StarRating";
import ReviewForm from "../../components/ReviewForm";
import EmptyState from "../../components/EmptyState";
import PortalLayout from "../../components/PortalLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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

      {!review.isVisible && <Badge variant="slate" className="text-[10px] mb-2">Hidden by admin</Badge>}

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
          <Button onClick={() => onEdit(review)} variant="brand-ghost" size="sm">Edit</Button>
        ) : (
          <span className="text-xs text-text-muted">Edit window expired</span>
        )}
        <Button
          onClick={() => onDelete(review._id)}
          disabled={deleting === review._id}
          variant="brand-ghost"
          size="sm"
          className="border-danger/30 text-danger hover:bg-red-50"
        >
          {deleting === review._id ? "Deleting..." : "Delete"}
        </Button>
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
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="gap-2 p-0 h-auto bg-transparent">
          <TabsTrigger
            value="doctor"
            style={tab === "doctor" ? { background: "#CCFBF1", color: "#0D9488", borderColor: "#5EEAD4", fontWeight: 600 } : undefined}
            className={`flex-none inline-flex items-center gap-1.5 h-auto rounded-[10px] border-[1.5px] px-3.5 py-2.5 text-sm transition-all font-sans ${
              tab === "doctor"
                ? ""
                : "bg-transparent text-text-secondary border-transparent hover:bg-teal-50 hover:text-primary-dark hover:border-primary-light"
            }`}
          >
            <Stethoscope size={14} /> Doctor Reviews ({doctorReviews.length})
          </TabsTrigger>
          <TabsTrigger
            value="hospital"
            style={tab === "hospital" ? { background: "#CCFBF1", color: "#0D9488", borderColor: "#5EEAD4", fontWeight: 600 } : undefined}
            className={`flex-none inline-flex items-center gap-1.5 h-auto rounded-[10px] border-[1.5px] px-3.5 py-2.5 text-sm transition-all font-sans ${
              tab === "hospital"
                ? ""
                : "bg-transparent text-text-secondary border-transparent hover:bg-teal-50 hover:text-primary-dark hover:border-primary-light"
            }`}
          >
            <Building2 size={14} /> Hospital Reviews ({hospitalReviews.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
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
              onDelete={setConfirmDeleteId}
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

      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Review</AlertDialogCancel>
            <AlertDialogAction
              variant="solid-destructive"
              onClick={() => {
                const id = confirmDeleteId;
                setConfirmDeleteId(null);
                if (id) handleDelete(id);
              }}
            >
              Yes, Delete It
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalLayout>
  );
};

export default ReviewsPage;
