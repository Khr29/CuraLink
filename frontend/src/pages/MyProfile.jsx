import React, { useState, useContext, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-slate-100 last:border-b-0">
    <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">{label}</p>
    <p className="text-sm text-text-secondary flex-1">{value || <span className="text-slate-400">Not provided</span>}</p>
  </div>
);

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

  const updateUserProfileData = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
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
              <input
                className="input text-sm flex-1"
                value={userData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Phone number"
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
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                {userData.address?.line1 ? (
                  <>{userData.address.line1}{userData.address.line2 && <><br />{userData.address.line2}</>}</>
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

          <div className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p className="sm:w-32 text-xs font-semibold text-text-muted uppercase tracking-wider flex-shrink-0">Birthday</p>
            {isEdit ? (
              <input
                className="input text-sm w-auto max-w-[200px]"
                type="date"
                value={userData.dob || ""}
                onChange={(e) => handleChange("dob", e.target.value)}
              />
            ) : (
              <p className="text-sm text-text-secondary">{userData.dob || <span className="text-slate-400">Not provided</span>}</p>
            )}
          </div>
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