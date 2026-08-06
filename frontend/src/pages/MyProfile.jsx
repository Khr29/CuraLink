import React, { useState, useContext, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import StarRating from "../components/StarRating";
import ReviewForm from "../components/ReviewForm";
import CuraLinkPhoneInput from "../components/PhoneInput";
import EmptyState from "../components/EmptyState";
import { MessageSquare, CalendarX2 } from "lucide-react";

const months = [" ", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatSlotDate = (slotDate) => {
  if (!slotDate) return "";
  const [d, m, y] = slotDate.split("_");
  return `${d} ${months[Number(m)]} ${y}`;
};

// dob is stored as a plain "YYYY-MM-DD" string (or "Not Selected") — parse
// defensively since it's user-entered, not a real Date column.
const calculateAge = (dob) => {
  if (!dob || dob === "Not Selected") return null;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

const MyReviews = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
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
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="profile-section animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-1/4 mb-3" />
        <div className="h-16 bg-slate-100 rounded" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="profile-section">
        <EmptyState
          icon={MessageSquare}
          title="No Reviews Yet"
          subtitle="Reviews you write for doctors and hospitals will show up here."
          compact
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => {
        const target = review.doctorId || review.hospitalId;
        const targetType = review.doctorId ? "Doctor" : "Hospital";
        const editable = review.editable;

        return (
          <div key={review._id} className="profile-section">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge badge-teal text-[10px]">{targetType}</span>
                  <span className="text-sm font-bold text-text-primary">{target?.name || "Unknown"}</span>
                  {!review.isVisible && <span className="badge badge-slate text-[10px]">Hidden by admin</span>}
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Appointment: {formatSlotDate(review.appointmentId?.slotDate)}
                  {review.appointmentId?.slotTime ? ` · ${review.appointmentId.slotTime}` : ""}
                </p>
              </div>
              <StarRating rating={review.rating} size="sm" />
            </div>

            <h4 className="text-sm font-semibold text-text-primary mt-2">{review.title}</h4>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">{review.comment}</p>

            {review.adminReply && (
              <div className="mt-3 bg-gradient-card rounded-xl p-3 border border-slate-100">
                <p className="text-xs font-bold text-primary mb-1">Response from CuraLink</p>
                <p className="text-xs text-text-secondary">{review.adminReply}</p>
              </div>
            )}

            <div className="flex items-center gap-3 mt-3">
              {editable ? (
                <button onClick={() => setEditingReview(review)} className="btn btn-ghost btn-sm">
                  Edit
                </button>
              ) : (
                <span className="text-xs text-text-muted">Edit window expired</span>
              )}
              <button
                onClick={() => handleDelete(review._id)}
                disabled={deletingId === review._id}
                className="btn btn-ghost btn-sm border-danger/30 text-danger hover:bg-red-50"
              >
                {deletingId === review._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        );
      })}

      <ReviewForm
        key={editingReview?._id || "closed"}
        open={!!editingReview}
        onClose={() => setEditingReview(null)}
        targetType={editingReview?.doctorId ? "doctor" : "hospital"}
        targetName={editingReview ? (editingReview.doctorId || editingReview.hospitalId)?.name : ""}
        editReview={editingReview}
        onSuccess={fetchMyReviews}
      />
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-slate-100 last:border-b-0">
    <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">{label}</p>
    <p className="text-sm text-text-secondary flex-1">{value || <span className="text-slate-400">Not provided</span>}</p>
  </div>
);

// Compact summary — full history lives on /my-appointments, this just
// surfaces the most recent few so the profile page doesn't duplicate it.
const RecentAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/appointments`, { headers: { token } });
        if (data.success) setAppointments(data.appointments.reverse().slice(0, 3));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [backendUrl, token]);

  if (loading) {
    return (
      <div className="profile-section animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-1/4 mb-3" />
        <div className="h-16 bg-slate-100 rounded" />
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="profile-section">
        <EmptyState
          icon={CalendarX2}
          title="No Appointments Yet"
          subtitle="Book a doctor and it'll show up here."
          compact
        />
      </div>
    );
  }

  return (
    <div className="profile-section">
      <div className="flex flex-col gap-3">
        {appointments.map((item) => (
          <div key={item._id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-b-0">
            <img
              src={item.docData?.image}
              alt={item.docData?.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{item.docData?.name}</p>
              <p className="text-xs text-text-muted">{formatSlotDate(item.slotDate)} · {item.slotTime}</p>
            </div>
            {item.cancelled ? (
              <span className="badge badge-red text-[10px]">Cancelled</span>
            ) : item.isCompleted ? (
              <span className="badge badge-green text-[10px]">Completed</span>
            ) : (
              <span className="badge badge-blue text-[10px]">Upcoming</span>
            )}
          </div>
        ))}
      </div>
      <button onClick={() => navigate("/my-appointments")} className="btn btn-ghost btn-sm w-full mt-4">
        View All Appointments
      </button>
    </div>
  );
};

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleImageChange = useCallback((e) => setImage(e.target.files[0]), []);

  const handleChange = useCallback(
    (field, value) => setUserData((prev) => ({ ...prev, [field]: value })),
    [setUserData]
  );

  const handleAddressChange = useCallback(
    (field, value) =>
      setUserData((prev) => ({ ...prev, address: { ...prev.address, [field]: value } })),
    [setUserData]
  );

  const handleEmergencyContactChange = useCallback(
    (field, value) =>
      setUserData((prev) => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [field]: value } })),
    [setUserData]
  );

  const handleMedicalChange = useCallback(
    (field, value) =>
      setUserData((prev) => ({ ...prev, medical: { ...prev.medical, [field]: value } })),
    [setUserData]
  );

  const updateUserProfileData = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      formData.append("bloodGroup", userData.bloodGroup || "");
      formData.append("emergencyContactName", userData.emergencyContact?.name || "");
      formData.append("emergencyContactPhone", userData.emergencyContact?.phone || "");
      formData.append("height", userData.medical?.height || "");
      formData.append("weight", userData.medical?.weight || "");
      formData.append("allergies", userData.medical?.allergies || "");
      formData.append("chronicDiseases", userData.medical?.chronicDiseases || "");
      formData.append("medications", userData.medical?.medications || "");
      if (image) formData.append("image", image);

      const { data } = await axios.post(`${backendUrl}/api/user/update-profile`, formData, {
        headers: { token },
      });
      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (!userData) return null;

  const imgSrc = image ? URL.createObjectURL(image) : userData.image;

  return (
    <div className="py-8 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">My Profile</h1>
          <p className="text-text-muted mt-1">Manage your personal information</p>
        </div>
        {!isEdit && (
          <button onClick={() => setIsEdit(true)} className="btn btn-secondary btn-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {/* Avatar + name */}
      <div className="profile-section flex items-center gap-5 mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-primary-light">
            <img
              src={imgSrc}
              alt={userData.name}
              className="w-full h-full object-cover"
            />
          </div>
          {isEdit && (
            <label
              htmlFor="profile-image"
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-dark transition-colors"
              title="Change photo"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isEdit ? (
            <input
              className="input text-xl font-bold mb-1"
              value={userData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Full name"
            />
          ) : (
            <h2 className="text-xl font-bold text-text-primary">{userData.name}</h2>
          )}
          <p className="text-sm text-text-muted">{userData.email}</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="profile-section mb-4">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          Contact Information
        </h3>
        <div>
          <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Email</p>
            <p className="text-sm text-primary font-medium">{userData.email}</p>
          </div>

          <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Phone</p>
            {isEdit ? (
              <CuraLinkPhoneInput
                className="flex-1"
                value={userData.phone}
                onChange={(value) => handleChange("phone", value || "")}
              />
            ) : (
              <p className="text-sm text-text-secondary">{userData.phone || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0 sm:mt-2">Address</p>
            {isEdit ? (
              <div className="flex flex-col gap-2 flex-1">
                <input
                  className="input text-sm"
                  value={userData.address?.line1 || ""}
                  onChange={(e) => handleAddressChange("line1", e.target.value)}
                  placeholder="Address line 1"
                />
                <input
                  className="input text-sm"
                  value={userData.address?.line2 || ""}
                  onChange={(e) => handleAddressChange("line2", e.target.value)}
                  placeholder="Address line 2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="input text-sm"
                    value={userData.address?.city || ""}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    placeholder="City"
                  />
                  <input
                    className="input text-sm"
                    value={userData.address?.state || ""}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    placeholder="State"
                  />
                  <input
                    className="input text-sm"
                    value={userData.address?.country || ""}
                    onChange={(e) => handleAddressChange("country", e.target.value)}
                    placeholder="Country"
                  />
                  <input
                    className="input text-sm"
                    value={userData.address?.pincode || ""}
                    onChange={(e) => handleAddressChange("pincode", e.target.value)}
                    placeholder="Postal code"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                {userData.address?.line1 || userData.address?.city || userData.address?.state || userData.address?.country || userData.address?.pincode ? (
                  <>
                    {userData.address.line1}
                    {userData.address.line2 && <><br />{userData.address.line2}</>}
                    {(userData.address.city || userData.address.state || userData.address.country || userData.address.pincode) && (
                      <><br />{[userData.address.city, userData.address.state, userData.address.country, userData.address.pincode].filter(Boolean).join(", ")}</>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400">Not provided</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="profile-section mb-8">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Basic Information
        </h3>
        <div>
          <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Gender</p>
            {isEdit ? (
              <select
                className="input text-sm w-auto max-w-[180px]"
                value={userData.gender || ""}
                onChange={(e) => handleChange("gender", e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p className="text-sm text-text-secondary">{userData.gender || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>

          <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Birthday</p>
            {isEdit ? (
              <input
                className="input text-sm w-auto max-w-[200px]"
                type="date"
                value={userData.dob || ""}
                onChange={(e) => handleChange("dob", e.target.value)}
              />
            ) : (
              <p className="text-sm text-text-secondary">
                {userData.dob && userData.dob !== "Not Selected" ? (
                  <>{userData.dob}{calculateAge(userData.dob) !== null && ` (${calculateAge(userData.dob)} years old)`}</>
                ) : (
                  <span className="text-slate-400">Not provided</span>
                )}
              </p>
            )}
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Blood Group</p>
            {isEdit ? (
              <select
                className="input text-sm w-auto max-w-[180px]"
                value={userData.bloodGroup || ""}
                onChange={(e) => handleChange("bloodGroup", e.target.value)}
              >
                <option value="">Select blood group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-text-secondary">{userData.bloodGroup || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="profile-section mb-8">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          Emergency Contact
        </h3>
        <div>
          <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Name</p>
            {isEdit ? (
              <input
                className="input text-sm flex-1"
                value={userData.emergencyContact?.name || ""}
                onChange={(e) => handleEmergencyContactChange("name", e.target.value)}
                placeholder="Contact's full name"
              />
            ) : (
              <p className="text-sm text-text-secondary">{userData.emergencyContact?.name || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>
          <div className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Phone</p>
            {isEdit ? (
              <CuraLinkPhoneInput
                className="flex-1"
                value={userData.emergencyContact?.phone || ""}
                onChange={(value) => handleEmergencyContactChange("phone", value || "")}
              />
            ) : (
              <p className="text-sm text-text-secondary">{userData.emergencyContact?.phone || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="profile-section mb-8">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
          </svg>
          Medical Information
        </h3>
        <div>
          <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Height</p>
            {isEdit ? (
              <input
                className="input text-sm flex-1"
                value={userData.medical?.height || ""}
                onChange={(e) => handleMedicalChange("height", e.target.value)}
                placeholder="e.g. 175 cm"
              />
            ) : (
              <p className="text-sm text-text-secondary">{userData.medical?.height || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>
          <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Weight</p>
            {isEdit ? (
              <input
                className="input text-sm flex-1"
                value={userData.medical?.weight || ""}
                onChange={(e) => handleMedicalChange("weight", e.target.value)}
                placeholder="e.g. 70 kg"
              />
            ) : (
              <p className="text-sm text-text-secondary">{userData.medical?.weight || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>
          <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Allergies</p>
            {isEdit ? (
              <input
                className="input text-sm flex-1"
                value={userData.medical?.allergies || ""}
                onChange={(e) => handleMedicalChange("allergies", e.target.value)}
                placeholder="e.g. Penicillin, peanuts"
              />
            ) : (
              <p className="text-sm text-text-secondary">{userData.medical?.allergies || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>
          <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Chronic Diseases</p>
            {isEdit ? (
              <input
                className="input text-sm flex-1"
                value={userData.medical?.chronicDiseases || ""}
                onChange={(e) => handleMedicalChange("chronicDiseases", e.target.value)}
                placeholder="e.g. Diabetes, hypertension"
              />
            ) : (
              <p className="text-sm text-text-secondary">{userData.medical?.chronicDiseases || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>
          <div className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Medications</p>
            {isEdit ? (
              <input
                className="input text-sm flex-1"
                value={userData.medical?.medications || ""}
                onChange={(e) => handleMedicalChange("medications", e.target.value)}
                placeholder="e.g. Metformin 500mg"
              />
            ) : (
              <p className="text-sm text-text-secondary">{userData.medical?.medications || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          Recent Appointments
        </h3>
        <RecentAppointments />
      </div>

      {/* My Reviews */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          My Reviews
        </h3>
        <MyReviews />
      </div>

      {/* Save / Cancel */}
      {isEdit && (
        <div className="flex gap-3">
          <button
            onClick={updateUserProfileData}
            disabled={saving}
            className="btn btn-primary shine"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          <button
            onClick={() => { setIsEdit(false); setImage(null); }}
            className="btn btn-ghost"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProfile;