import React, { useContext, useEffect, useState, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import CuraLinkPhoneInput from "../components/PhoneInput";

const initialFormData = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  phone: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  bloodGroup: "",
  height: "",
  weight: "",
  allergies: "",
  chronicDiseases: "",
  medications: "",
  addressLine1: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const SectionCard = ({ icon, title, description, children }) => (
  <div className="profile-section mb-6">
    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-1 flex items-center gap-2">
      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {icon}
      </svg>
      {title}
    </h3>
    {description && <p className="text-xs text-text-muted mb-4">{description}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">{children}</div>
  </div>
);

const Field = ({ label, children, full }) => (
  <div className={full ? "sm:col-span-2" : ""}>
    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">{label}</p>
    {children}
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { backendUrl, token, setToken } = useContext(AppContext);

  const [formData, setFormData] = useState(initialFormData);
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setField = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback((e) => setImage(e.target.files[0]), []);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter your first and last name");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", `${firstName.trim()} ${lastName.trim()}`.trim());
      payload.append("email", email);
      payload.append("password", password);
      if (formData.dob) payload.append("dob", formData.dob);
      if (formData.gender) payload.append("gender", formData.gender);
      if (formData.phone) payload.append("phone", formData.phone);
      if (formData.emergencyContactName) payload.append("emergencyContactName", formData.emergencyContactName);
      if (formData.emergencyContactPhone) payload.append("emergencyContactPhone", formData.emergencyContactPhone);
      if (formData.bloodGroup) payload.append("bloodGroup", formData.bloodGroup);
      if (formData.height) payload.append("height", formData.height);
      if (formData.weight) payload.append("weight", formData.weight);
      if (formData.allergies) payload.append("allergies", formData.allergies);
      if (formData.chronicDiseases) payload.append("chronicDiseases", formData.chronicDiseases);
      if (formData.medications) payload.append("medications", formData.medications);

      const hasAddress = formData.addressLine1 || formData.city || formData.state || formData.country || formData.pincode;
      if (hasAddress) {
        payload.append(
          "address",
          JSON.stringify({
            line1: formData.addressLine1,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            pincode: formData.pincode,
          })
        );
      }
      if (image) payload.append("image", image);

      const { data } = await axios.post(`${backendUrl}/api/user/register`, payload);

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success("Account created — welcome to CuraLink!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  const imgSrc = image ? URL.createObjectURL(image) : null;

  return (
    <div className="py-8 animate-fade-in max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="section-title">Create Your CuraLink Account</h1>
        <p className="text-text-muted mt-1">
          A few details help us personalize your care — everything except your name, email, and password is optional.
        </p>
      </div>

      <form onSubmit={onSubmitHandler}>
        {/* Identity — photo + address */}
        <div className="profile-section mb-6">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Identity
          </h3>
          <div className="flex items-center gap-5 mb-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-primary-light bg-gradient-card flex items-center justify-center">
                {imgSrc ? (
                  <img src={imgSrc} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-9 h-9 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )}
              </div>
              <label
                htmlFor="register-image"
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-dark transition-colors"
                title="Upload photo"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
                <input id="register-image" type="file" accept="image/*" hidden onChange={handleImageChange} />
              </label>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Profile Photo</p>
              <p className="text-xs text-text-muted">Optional — you can add this later</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Address" full>
              <input name="addressLine1" className="input text-sm" value={formData.addressLine1} onChange={handleChange} placeholder="Street address" />
            </Field>
            <Field label="City">
              <input name="city" className="input text-sm" value={formData.city} onChange={handleChange} placeholder="City" />
            </Field>
            <Field label="State">
              <input name="state" className="input text-sm" value={formData.state} onChange={handleChange} placeholder="State" />
            </Field>
            <Field label="Country">
              <input name="country" className="input text-sm" value={formData.country} onChange={handleChange} placeholder="Country" />
            </Field>
            <Field label="Postal Code">
              <input name="pincode" className="input text-sm" value={formData.pincode} onChange={handleChange} placeholder="Postal code" />
            </Field>
          </div>
        </div>

        {/* Personal Information */}
        <SectionCard
          title="Personal Information"
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />}
        >
          <Field label="First Name">
            <input name="firstName" className="input text-sm" value={formData.firstName} onChange={handleChange} placeholder="First name" required />
          </Field>
          <Field label="Last Name">
            <input name="lastName" className="input text-sm" value={formData.lastName} onChange={handleChange} placeholder="Last name" required />
          </Field>
          <Field label="Date of Birth">
            <input name="dob" type="date" className="input text-sm" value={formData.dob} onChange={handleChange} />
          </Field>
          <Field label="Gender">
            <select name="gender" className="input text-sm" value={formData.gender} onChange={handleChange}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </Field>
          <Field label="Phone Number">
            <CuraLinkPhoneInput value={formData.phone} onChange={(value) => setField("phone", value || "")} />
          </Field>
          <Field label="Emergency Contact Name">
            <input name="emergencyContactName" className="input text-sm" value={formData.emergencyContactName} onChange={handleChange} placeholder="Contact's full name" />
          </Field>
          <Field label="Emergency Contact Number" full>
            <CuraLinkPhoneInput value={formData.emergencyContactPhone} onChange={(value) => setField("emergencyContactPhone", value || "")} />
          </Field>
        </SectionCard>

        {/* Medical Information */}
        <SectionCard
          title="Medical Information"
          description="Optional, but helps doctors give you better care."
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />}
        >
          <Field label="Blood Group">
            <select name="bloodGroup" className="input text-sm" value={formData.bloodGroup} onChange={handleChange}>
              <option value="">Select blood group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </Field>
          <Field label="Height (cm)">
            <input name="height" className="input text-sm" value={formData.height} onChange={handleChange} placeholder="e.g. 175" />
          </Field>
          <Field label="Weight (kg)">
            <input name="weight" className="input text-sm" value={formData.weight} onChange={handleChange} placeholder="e.g. 70" />
          </Field>
          <Field label="Known Allergies" full>
            <input name="allergies" className="input text-sm" value={formData.allergies} onChange={handleChange} placeholder="e.g. Penicillin, peanuts" />
          </Field>
          <Field label="Chronic Diseases" full>
            <input name="chronicDiseases" className="input text-sm" value={formData.chronicDiseases} onChange={handleChange} placeholder="e.g. Diabetes, hypertension" />
          </Field>
          <Field label="Current Medications" full>
            <input name="medications" className="input text-sm" value={formData.medications} onChange={handleChange} placeholder="e.g. Metformin 500mg" />
          </Field>
        </SectionCard>

        {/* Account */}
        <SectionCard
          title="Account"
          icon={<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />}
        >
          <Field label="Email" full>
            <input name="email" type="email" className="input text-sm" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
          </Field>
          <Field label="Password">
            <input name="password" type="password" className="input text-sm" value={formData.password} onChange={handleChange} placeholder="At least 8 characters" required />
          </Field>
          <Field label="Confirm Password">
            <input name="confirmPassword" type="password" className="input text-sm" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required />
          </Field>
        </SectionCard>

        <button type="submit" disabled={submitting} className="btn btn-primary shine w-full">
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-center text-sm text-text-muted mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-primary underline">Log in here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
