import React, { useState, useContext, useCallback } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import CuraLinkPhoneInput from "../components/PhoneInput";
import PortalLayout from "../components/PortalLayout";
import { Pencil, Trash2, User as UserIcon } from "lucide-react";

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

const MyProfile = () => {
  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageChange = useCallback((e) => {
    setImage(e.target.files[0]);
    setImageRemoved(false);
  }, []);

  const handleImageRemove = useCallback(() => {
    if (userData.image && !image) {
      if (!window.confirm("Remove your profile picture? You'll need to upload a new one before saving.")) return;
    }
    setImage(null);
    setImageRemoved(true);
  }, [userData.image, image]);

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

  const handleInsuranceChange = useCallback(
    (field, value) =>
      setUserData((prev) => ({ ...prev, insurance: { ...prev.insurance, [field]: value } })),
    [setUserData]
  );

  const updateUserProfileData = async () => {
    if (imageRemoved && !image) {
      toast.error("Please upload a new profile picture before saving, or cancel the removal.");
      return;
    }
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
      formData.append("insuranceProvider", userData.insurance?.provider || "");
      formData.append("insurancePolicyNumber", userData.insurance?.policyNumber || "");
      formData.append("insuranceValidTill", userData.insurance?.validTill || "");
      if (image) formData.append("image", image);

      const { data } = await axios.post(`${backendUrl}/api/user/update-profile`, formData, {
        headers: { token },
      });
      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(null);
        setImageRemoved(false);
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

  // Keep the portal shell (nav/sidebar) visible instead of a blank page
  // while userData is still loading — or, on a genuine load failure, so the
  // user isn't stranded with no way to navigate elsewhere. An invalid/
  // expired session is handled separately by ProtectedRoute (App.jsx),
  // which redirects to /login once AppContext clears the token.
  if (!userData) {
    return (
      <PortalLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PortalLayout>
    );
  }

  const imgSrc = image ? URL.createObjectURL(image) : (imageRemoved ? null : userData.image);

  return (
    <PortalLayout>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="section-title" style={{ fontSize: "1.85rem" }}>My Profile</h1>
          <p className="text-text-muted mt-1">Manage your personal information</p>
        </div>
        {!isEdit && (
          <button onClick={() => setIsEdit(true)} className="btn btn-primary btn-sm shine">
            <Pencil size={15} strokeWidth={2.25} />
            Edit Profile
          </button>
        )}
      </div>

      {/* Avatar + name */}
      <div className="profile-section flex items-center gap-5 mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-primary-light bg-primary-light/40 flex items-center justify-center">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={userData.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon size={36} className="text-primary" />
            )}
          </div>
          {isEdit && (
            <>
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
              {imgSrc && (
                <button
                  type="button"
                  onClick={handleImageRemove}
                  title="Remove photo"
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={11} className="text-white" />
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isEdit && imageRemoved && !image && (
            <p className="text-red-600 text-xs mb-1">Please upload a new photo before saving.</p>
          )}
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
      <div className="profile-section mb-4">
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
      <div className="profile-section mb-4">
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

      {/* Insurance Information */}
      <div className="profile-section mb-4">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
          Insurance Information
        </h3>
        <div>
          <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Provider</p>
            {isEdit ? (
              <input
                className="input text-sm flex-1"
                value={userData.insurance?.provider || ""}
                onChange={(e) => handleInsuranceChange("provider", e.target.value)}
                placeholder="e.g. Star Health, HDFC Ergo"
              />
            ) : (
              <p className="text-sm text-text-secondary">{userData.insurance?.provider || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>
          <div className="py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Policy Number</p>
            {isEdit ? (
              <input
                className="input text-sm flex-1"
                value={userData.insurance?.policyNumber || ""}
                onChange={(e) => handleInsuranceChange("policyNumber", e.target.value)}
                placeholder="Policy / member ID"
              />
            ) : (
              <p className="text-sm text-text-secondary">{userData.insurance?.policyNumber || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>
          <div className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Valid Till</p>
            {isEdit ? (
              <input
                className="input text-sm w-auto max-w-[200px]"
                type="date"
                value={userData.insurance?.validTill || ""}
                onChange={(e) => handleInsuranceChange("validTill", e.target.value)}
              />
            ) : (
              <p className="text-sm text-text-secondary">{userData.insurance?.validTill || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account & Security — summary only; the actual password/session
          management form lives on its own Settings page (single
          responsibility per page — see PortalSidebar). */}
      <div className="profile-section mb-8">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          Account & Security
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-text-secondary">
              Email verification:{" "}
              <span className={userData.emailVerified ? "text-accent font-semibold" : "text-warning font-semibold"}>
                {userData.emailVerified ? "Verified" : "Pending"}
              </span>
            </p>
            <p className="text-sm text-text-secondary mt-1.5">
              Member since {new Date(userData.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
            </p>
          </div>
          <Link to="/settings" className="btn btn-ghost btn-sm w-fit">
            Manage Password & Sessions
          </Link>
        </div>
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
            onClick={() => { setIsEdit(false); setImage(null); setImageRemoved(false); }}
            className="btn btn-ghost"
          >
            Cancel
          </button>
        </div>
      )}
    </PortalLayout>
  );
};

export default MyProfile;
