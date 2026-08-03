import React, { useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/assets'
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Compass,
  Stethoscope,
  ShieldCheck,
  Image as ImageIcon,
  Power,
  UploadCloud,
  Trash2,
  ExternalLink,
  Clock,
  BedDouble,
  FileText,
  Loader2,
  Check,
  Plus,
  Sparkles,
  HeartPulse,
  Syringe,
  Activity,
  Ambulance,
  Building,
  Car,
  Utensils,
  Eye,
  Microscope,
  Baby
} from 'lucide-react'

// Icon mappings for departments
const DEPARTMENT_LIST = [
  { name: 'Cardiology', icon: HeartPulse },
  { name: 'Neurology', icon: Activity },
  { name: 'Orthopedics', icon: Stethoscope },
  { name: 'Pediatrics', icon: Baby },
  { name: 'Oncology', icon: Syringe },
  { name: 'Dermatology', icon: Sparkles },
  { name: 'General Medicine', icon: Building2 },
  { name: 'ENT', icon: Eye },
  { name: 'Urology', icon: Microscope },
  { name: 'Ophthalmology', icon: Eye },
  { name: 'Gastroenterology', icon: Microscope },
  { name: 'Pulmonology', icon: Activity }
]

// Icon mappings for facilities
const FACILITY_LIST = [
  { name: 'ICU', icon: Activity },
  { name: 'Emergency', icon: Ambulance },
  { name: 'MRI', icon: Microscope },
  { name: 'CT Scan', icon: Microscope },
  { name: 'X-Ray', icon: Microscope },
  { name: 'Laboratory', icon: Microscope },
  { name: 'Pharmacy', icon: Syringe },
  { name: 'Blood Bank', icon: HeartPulse },
  { name: 'Ambulance', icon: Ambulance },
  { name: 'Parking', icon: Car },
  { name: 'Wheelchair Access', icon: Building },
  { name: 'Cafeteria', icon: Utensils }
]

const INITIAL_HOSPITAL_STATE = {
  name: '',
  description: '',
  email: '',
  phone: '',
  website: '',
  hospitalType: 'Private',
  openingHours: '24 Hours',
  beds: '',
  address: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    country: 'India',
    pincode: ''
  },
  location: {
    latitude: '',
    longitude: '',
    mapsUrl: ''
  },
  departments: [],
  facilities: [],
  active: true
}

const AddHospital = () => {
  const [image, setImage] = useState(null)
  const [galleryImages, setGalleryImages] = useState([])
  const [hospitalData, setHospitalData] = useState(INITIAL_HOSPITAL_STATE)
  const [loading, setLoading] = useState(false)

  const { backendUrl, aToken } = useContext(AdminContext)

  // Top level input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setHospitalData((prev) => ({ ...prev, [name]: value }))
  }

  // Nested object handler (Address / Location)
  const handleNestedChange = (parentKey, fieldName, value) => {
    setHospitalData((prev) => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [fieldName]: value
      }
    }))
  }

  // Array toggle handler (Departments / Facilities)
  const handleArrayToggle = (arrayKey, item) => {
    setHospitalData((prev) => {
      const currentList = prev[arrayKey] || []
      const exists = currentList.includes(item)
      return {
        ...prev,
        [arrayKey]: exists
          ? currentList.filter((i) => i !== item)
          : [...currentList, item]
      }
    })
  }

  // Gallery image addition
  const handleGalleryAdd = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setGalleryImages((prev) => [...prev, ...files])
    }
  }

  // Gallery image removal
  const handleRemoveGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Submission handler
  const submitHandler = async (e) => {
    e.preventDefault()

    if (!image) {
      return toast.error('Hospital primary cover image is required!')
    }

    setLoading(true)

    try {
      const formData = new FormData()

      // Primary Image & Gallery
      formData.append('image', image)
      galleryImages.forEach((file) => {
        formData.append('galleryImages', file)
      })

      // Basic Information
      formData.append('name', hospitalData.name.trim())
      formData.append('description', hospitalData.description.trim())
      formData.append('email', hospitalData.email.trim())
      formData.append('phone', hospitalData.phone.trim())
      formData.append('website', hospitalData.website.trim())
      formData.append('hospitalType', hospitalData.hospitalType)
      formData.append('openingHours', hospitalData.openingHours)
      formData.append('beds', hospitalData.beds)
      formData.append('active', hospitalData.active)

      // Nested JSON Objects
      formData.append('address', JSON.stringify(hospitalData.address))
      formData.append('location', JSON.stringify(hospitalData.location))
      formData.append('departments', JSON.stringify(hospitalData.departments))
      formData.append('facilities', JSON.stringify(hospitalData.facilities))

      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-hospital`,
        formData,
        { headers: { aToken } }
      )

      if (data.success) {
        toast.success(data.message || 'Hospital registered successfully!')
        setImage(null)
        setGalleryImages([])
        setHospitalData(INITIAL_HOSPITAL_STATE)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <form onSubmit={submitHandler} style={{ maxWidth: 1320, margin: '0 auto' }}>

        {/* PAGE HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(37,99,235,0.25)'
            }}>
              <Building2 size={26} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                Add New Hospital
              </h1>
              <p style={{ fontSize: 14, color: '#64748B', marginTop: 3 }}>
                Register a new hospital into CuraLink.
              </p>
            </div>
          </div>
        </div>

        {/* GRID LAYOUT - 2 COLUMNS ON DESKTOP */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(580px, 1fr))', gap: 28 }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* CARD 1: LOGO & BASIC INFO */}
            <DashboardCard title="Basic Information" icon={Building2}>
              
              {/* Cover Upload Area */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Hospital Cover Image</label>
                <div style={{ position: 'relative' }}>
                  <label htmlFor="hospital-img" style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '24px 16px', borderRadius: 20, border: '2px dashed #CBD5E1',
                    background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.25s ease',
                    textAlign: 'center'
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC' }}
                  >
                    {image ? (
                      <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 14, overflow: 'hidden' }}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Hospital Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#FFF', fontWeight: 600, fontSize: 13
                        }}>
                          Click to Replace Image
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{
                          width: 48, height: 48, borderRadius: 14, background: '#E0F2FE',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12
                        }}>
                          <UploadCloud size={24} color="#14B8A6" />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                          Click or drag hospital logo here
                        </p>
                        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                          Supports PNG, JPG or WEBP (Max 5MB)
                        </p>
                      </>
                    )}
                  </label>
                  <input
                    type="file"
                    id="hospital-img"
                    hidden
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                </div>
              </div>

              {/* Basic Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <InputField
                  label="Hospital Name"
                  name="name"
                  value={hospitalData.name}
                  onChange={handleInputChange}
                  placeholder=""
                  icon={Building2}
                  required
                />
                <div>
                  <label style={labelStyle}>Hospital Type</label>
                  <select
                    name="hospitalType"
                    value={hospitalData.hospitalType}
                    onChange={handleInputChange}
                    style={inputStyle}
                  >
                    <option value="Private">Private</option>
                    <option value="Government">Government</option>
                    <option value="Multi-Speciality">Multi-Speciality</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Diagnostic Centre">Diagnostic Centre</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <InputField
                  label="Opening Hours"
                  name="openingHours"
                  value={hospitalData.openingHours}
                  onChange={handleInputChange}
                  placeholder="24 Hours"
                  icon={Clock}
                />
                <InputField
                  label="Number of Beds"
                  type="number"
                  name="beds"
                  value={hospitalData.beds}
                  onChange={handleInputChange}
                  placeholder="250"
                  icon={BedDouble}
                />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={hospitalData.description}
                  onChange={handleInputChange}
                  placeholder="Write a detailed description about the hospital..."
                  style={{ ...inputStyle, resize: 'vertical', height: 'auto' }}
                />
              </div>

            </DashboardCard>

            {/* CARD 2: CONTACT INFORMATION */}
            <DashboardCard title="Contact Information" icon={Phone}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <InputField
                  label="Email"
                  type="email"
                  name="email"
                  value={hospitalData.email}
                  onChange={handleInputChange}
                  placeholder="hospital@email.com"
                  icon={Mail}
                />
                <InputField
                  label="Phone"
                  name="phone"
                  value={hospitalData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  icon={Phone}
                />
                <InputField
                  label="Website"
                  name="website"
                  value={hospitalData.website}
                  onChange={handleInputChange}
                  placeholder="https://hospital.com"
                  icon={Globe}
                />
              </div>
            </DashboardCard>

            {/* CARD 3: ADDRESS */}
            <DashboardCard title="Address" icon={MapPin}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <InputField
                  label="Address Line 1"
                  value={hospitalData.address.line1}
                  onChange={(e) => handleNestedChange('address', 'line1', e.target.value)}
                  placeholder="Street, Area..."
                  icon={MapPin}
                />
                <InputField
                  label="Address Line 2"
                  value={hospitalData.address.line2}
                  onChange={(e) => handleNestedChange('address', 'line2', e.target.value)}
                  placeholder="Landmark (Optional)"
                  icon={MapPin}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
                <InputField
                  label="City"
                  value={hospitalData.address.city}
                  onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                  placeholder="Bangalore"
                />
                <InputField
                  label="State"
                  value={hospitalData.address.state}
                  onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                  placeholder="Karnataka"
                />
                <InputField
                  label="Country"
                  value={hospitalData.address.country}
                  onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                  placeholder="India"
                />
                <InputField
                  label="Pincode"
                  value={hospitalData.address.pincode}
                  onChange={(e) => handleNestedChange('address', 'pincode', e.target.value)}
                  placeholder="560001"
                />
              </div>
            </DashboardCard>

            {/* CARD 4: GOOGLE MAPS */}
            <DashboardCard title="Google Maps" icon={Compass}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <InputField
                  label="Latitude"
                  type="number"
                  step="any"
                  value={hospitalData.location.latitude}
                  onChange={(e) => handleNestedChange('location', 'latitude', e.target.value)}
                  placeholder="12.9716"
                />
                <InputField
                  label="Longitude"
                  type="number"
                  step="any"
                  value={hospitalData.location.longitude}
                  onChange={(e) => handleNestedChange('location', 'longitude', e.target.value)}
                  placeholder="77.5946"
                />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <InputField
                    label="Google Maps URL"
                    value={hospitalData.location.mapsUrl || ''}
                    onChange={(e) => handleNestedChange('location', 'mapsUrl', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    icon={Globe}
                  />
                </div>
                <a
                  href={hospitalData.location.mapsUrl || 'https://maps.google.com'}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    height: 48, padding: '0 18px', borderRadius: 14,
                    background: '#EFF6FF', border: '1px solid #BFDBFE',
                    color: '#2563EB', fontWeight: 600, fontSize: 13.5,
                    display: 'flex', alignItems: 'center', gap: 8,
                    textDecoration: 'none', transition: 'all 0.2s ease',
                    boxSizing: 'border-box', whitespace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#DBEAFE'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#EFF6FF'}
                >
                  <ExternalLink size={16} /> Open Google Maps
                </a>
              </div>
            </DashboardCard>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* CARD 5: DEPARTMENTS */}
            <DashboardCard title="Departments" icon={Stethoscope}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {DEPARTMENT_LIST.map(({ name, icon: DeptIcon }) => {
                  const selected = hospitalData.departments.includes(name)
                  return (
                    <PillButton
                      key={name}
                      label={name}
                      selected={selected}
                      icon={DeptIcon}
                      onClick={() => handleArrayToggle('departments', name)}
                    />
                  )
                })}
              </div>
            </DashboardCard>

            {/* CARD 6: FACILITIES */}
            <DashboardCard title="Facilities" icon={ShieldCheck}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {FACILITY_LIST.map(({ name, icon: FacIcon }) => {
                  const selected = hospitalData.facilities.includes(name)
                  return (
                    <PillButton
                      key={name}
                      label={name}
                      selected={selected}
                      icon={FacIcon}
                      onClick={() => handleArrayToggle('facilities', name)}
                    />
                  )
                })}
              </div>
            </DashboardCard>

            {/* CARD 7: GALLERY IMAGES */}
            <DashboardCard title="Gallery Images" icon={ImageIcon}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="gallery-upload" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  padding: '14px 20px', borderRadius: 14, border: '2px dashed #CBD5E1',
                  background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.2s ease'
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC' }}
                >
                  <UploadCloud size={20} color="#2563EB" />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>
                    Browse & Upload Gallery Photos
                  </span>
                </label>
                <input
                  type="file"
                  id="gallery-upload"
                  multiple
                  hidden
                  accept="image/*"
                  onChange={handleGalleryAdd}
                />
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 12 }}>
                  {galleryImages.map((file, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '100%', height: 80, borderRadius: 12, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Gallery ${idx}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        style={{
                          position: 'absolute', top: 4, right: 4, width: 22, height: 22,
                          borderRadius: '50%', background: '#EF4444', border: 'none',
                          color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>

            {/* CARD 8: HOSPITAL STATUS */}
            <DashboardCard title="Hospital Status" icon={Power}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', margin: 0 }}>Active Listing</p>
                  <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    Toggle to make this hospital instantly visible to patients.
                  </p>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 52, height: 28, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={hospitalData.active}
                    onChange={(e) => setHospitalData((prev) => ({ ...prev, active: e.target.checked }))}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: hospitalData.active ? '#2563EB' : '#CBD5E1',
                    borderRadius: 34, transition: '0.3s',
                    boxShadow: hospitalData.active ? '0 0 12px rgba(37,99,235,0.4)' : 'none'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""',
                      height: 22, width: 22, left: hospitalData.active ? 26 : 3, bottom: 3,
                      backgroundColor: 'white', borderRadius: '50%', transition: '0.3s'
                    }} />
                  </span>
                </label>
              </div>
            </DashboardCard>

            {/* CARD 9: SUBMIT BUTTON */}
            <div style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24,
              padding: 24, boxShadow: '0 8px 24px rgba(15,23,42,.05)'
            }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 56, borderRadius: 16,
                  background: loading ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #14B8A6)',
                  color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 10px 30px rgba(37,99,235,0.25)',
                  transition: 'all 0.25s ease', fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.opacity = '0.95'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Saving Hospital...
                  </>
                ) : (
                  <>
                    🏥 Register Hospital
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </form>
    </div>
  )
}

// REUSABLE DASHBOARD CARD COMPONENT
const DashboardCard = ({ title, icon: Icon, children }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 24,
        padding: '28px 32px',
        boxShadow: hovered ? '0 12px 32px rgba(15,23,42,0.08)' : '0 8px 24px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.25s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        {Icon && (
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color="#2563EB" />
          </div>
        )}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

// REUSABLE FORM INPUT COMPONENT
const InputField = ({ label, type = 'text', name, value, onChange, placeholder, icon: Icon, required = false, step }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {Icon && (
        <div style={{ position: 'absolute', left: 14, pointerEvents: 'none', color: '#94A3B8' }}>
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        step={step}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          ...inputStyle,
          paddingLeft: Icon ? 42 : 14
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#2563EB'
          e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.12)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#CBD5E1'
          e.target.style.boxShadow = 'none'
        }}
      />
    </div>
  </div>
)

// SELECTABLE PILL BUTTON
const PillButton = ({ label, selected, icon: Icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 16px',
      borderRadius: 999,
      border: `1.5px solid ${selected ? '#2563EB' : '#CBD5E1'}`,
      background: selected ? '#2563EB' : '#FFFFFF',
      color: selected ? '#FFFFFF' : '#334155',
      fontSize: 13,
      fontWeight: selected ? 600 : 500,
      cursor: 'pointer',
      boxShadow: selected ? '0 4px 14px rgba(37,99,235,0.25)' : 'none',
      transition: 'all 0.2s ease',
      userSelect: 'none'
    }}
    onMouseEnter={(e) => {
      if (!selected) {
        e.currentTarget.style.background = '#EFF6FF'
        e.currentTarget.style.borderColor = '#93C5FD'
      }
    }}
    onMouseLeave={(e) => {
      if (!selected) {
        e.currentTarget.style.background = '#FFFFFF'
        e.currentTarget.style.borderColor = '#CBD5E1'
      }
    }}
  >
    {Icon && <Icon size={15} color={selected ? '#FFFFFF' : '#64748B'} />}
    <span>{label}</span>
    {selected && <Check size={14} color="#FFFFFF" style={{ marginLeft: 'auto' }} />}
  </button>
)

// SHARED INPUT & LABEL STYLES
const labelStyle = {
  fontSize: 12.5,
  fontWeight: 600,
  color: '#475569',
  marginBottom: 6,
  display: 'block',
  letterSpacing: '0.01em'
}

const inputStyle = {
  width: '100%',
  height: 48,
  background: '#FFFFFF',
  border: '1.5px solid #CBD5E1',
  borderRadius: 14,
  padding: '0 14px',
  fontSize: 13.5,
  color: '#0F172A',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box'
}

export default AddHospital