import React, {
  useState,
  useContext,
  useCallback,
  useEffect
} from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext'
import {
  User,
  Mail,
  Lock,
  Stethoscope,
  GraduationCap,
  Briefcase,
  IndianRupee,
  MapPin,
  FileText,
  UploadCloud,
  UserPlus,
  Building2
} from 'lucide-react'
import PageHero from '../../components/PageHero'

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [employmentType, setEmploymentType] = useState('hospital')
  const [hospitalId, setHospitalId] = useState('')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')

  const {
  backendUrl,
  aToken,
  hospitals,
  getAllHospitals
} = useContext(AdminContext)

useEffect(() => {
  if (aToken) {
    getAllHospitals()
  }
}, [aToken, getAllHospitals])

  const onSubmitHandler = useCallback(
    async (event) => {
      event.preventDefault()

      if (!docImg) {
        return toast.error('Image not selected')
      }

      try {
        const formData = new FormData()

        formData.append('image', docImg)
        formData.append('name', name.trim())
        formData.append('email', email.trim())
        formData.append('password', password)
        formData.append('experience', experience)
        formData.append('fees', fees)
        formData.append('about', about.trim())
        formData.append('speciality', speciality)
        formData.append('employmentType', employmentType)
        if (employmentType === 'hospital') formData.append('hospitalId', hospitalId)
        formData.append('degree', degree.trim())
        formData.append(
          'address',
          JSON.stringify({
            line1: address1.trim(),
            line2: address2.trim()
          })
        )

        const { data } = await axios.post(
          `${backendUrl}/api/admin/add-doctor`,
          formData,
          { headers: { aToken } }
        )

        if (data.success) {
          toast.success(data.message)

          setDocImg(null)
          setName('')
          setEmail('')
          setPassword('')
          setExperience('1 Year')
          setFees('')
          setAbout('')
          setSpeciality('General physician')
          setEmploymentType('hospital')
          setHospitalId('')
          setDegree('')
          setAddress1('')
          setAddress2('')
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        console.error(error)
        toast.error(error.message)
      }
    },
    [
      docImg,
      name,
      email,
      password,
      experience,
      fees,
      about,
      speciality,
      employmentType,
      hospitalId,
      degree,
      address1,
      address2,
      backendUrl,
      aToken
    ]
  )

  return (
    <div
      className="curalink-fade-in"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)',
        padding: '36px 24px'
      }}
    >
      <form onSubmit={onSubmitHandler} style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero
          icon={UserPlus}
          title="Add New Doctor"
          description="Register a new doctor into CuraLink."
        />

        {/* GRID LAYOUT - 2 COLUMNS ON DESKTOP */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(580px, 1fr))', gap: 28 }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            
            {/* CARD 1: BASIC INFORMATION */}
            <DashboardCard title="Basic Information" icon={User}>
              
              {/* Doctor Photo Upload Area */}
              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Doctor Photo</label>
                <div style={{ position: 'relative' }}>
                  <label
                    htmlFor="doc-img"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px 16px',
                      borderRadius: 20,
                      border: '2px dashed #CBD5E1',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2563EB'
                      e.currentTarget.style.background = '#EFF6FF'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#CBD5E1'
                      e.currentTarget.style.background = '#F8FAFC'
                    }}
                  >
                    {docImg ? (
                      <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 14, overflow: 'hidden' }}>
                        <img
                          src={URL.createObjectURL(docImg)}
                          alt="Doctor Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(15,23,42,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFF',
                            fontWeight: 600,
                            fontSize: 13
                          }}
                        >
                          Click to Replace Image
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            background: '#E0F2FE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 12
                          }}
                        >
                          <UploadCloud size={24} color="#14B8A6" />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                          Click or drag doctor photo here
                        </p>
                        <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                          Supports PNG, JPG or WEBP (Max 5MB)
                        </p>
                      </>
                    )}
                  </label>
                  <input
                    type="file"
                    id="doc-img"
                    hidden
                    accept="image/*"
                    onChange={(e) => setDocImg(e.target.files[0])}
                  />
                </div>
              </div>

              {/* Name & Speciality */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <InputField
                  label="Doctor Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. John Doe"
                  icon={User}
                  required
                />
                <div>
                  <label style={labelStyle}>Speciality</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: 14, pointerEvents: 'none', color: '#94A3B8' }}>
                      <Stethoscope size={18} />
                    </div>
                    <select
                      value={speciality}
                      onChange={(e) => setSpeciality(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 42 }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563EB'
                        e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.12)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#CBD5E1'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      <option value="General physician">General physician</option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pediatricians">Pediatricians</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Gastroenterologist">Gastroenterologist</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Practice Type</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { value: 'hospital', label: 'Works at Hospital', icon: Building2 },
                    { value: 'independent', label: 'Independent Practice', icon: User },
                  ].map((opt) => {
                    const Icon = opt.icon
                    const active = employmentType === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setEmploymentType(opt.value)}
                        style={{
                          flex: 1,
                          height: 48,
                          borderRadius: 14,
                          border: active ? '1.5px solid #2563EB' : '1.5px solid #CBD5E1',
                          background: active ? '#EFF6FF' : '#FFFFFF',
                          color: active ? '#2563EB' : '#475569',
                          fontWeight: 600,
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Icon size={16} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {employmentType === 'hospital' && (
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Hospital</label>

                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: 14,
                        color: '#94A3B8'
                      }}
                    >
                      <Building2 size={18} />
                    </div>

                    <select
                      required
                      value={hospitalId}
                      onChange={(e) => setHospitalId(e.target.value)}
                      style={{
                        ...inputStyle,
                        paddingLeft: 42
                      }}
                    >
                      <option value="">
                        Select Hospital
                      </option>

                      {hospitals.map((hospital) => (
                        <option
                          key={hospital._id}
                          value={hospital._id}
                        >
                          {hospital.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Education & Experience */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <InputField
                  label="Education / Degree"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="MBBS, MD"
                  icon={GraduationCap}
                  required
                />
                <div>
                  <label style={labelStyle}>Experience</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: 14, pointerEvents: 'none', color: '#94A3B8' }}>
                      <Briefcase size={18} />
                    </div>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 42 }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2563EB'
                        e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.12)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#CBD5E1'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i} value={`${i + 1} Year`}>
                          {i + 1} Year
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Consultation Fees */}
              <div>
                <InputField
                  label="Consultation Fees"
                  type="number"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  placeholder="500"
                  icon={IndianRupee}
                  required
                />
              </div>

            </DashboardCard>

            {/* CARD 2: CONTACT INFORMATION */}
            <DashboardCard title="Contact Information" icon={Mail}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <InputField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@email.com"
                  icon={Mail}
                  required
                />
                <InputField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  icon={Lock}
                  required
                />
              </div>
            </DashboardCard>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            
            {/* CARD 3: ADDRESS */}
            <DashboardCard title="Address" icon={MapPin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <InputField
                  label="Address Line 1"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="Street, Area..."
                  icon={MapPin}
                  required
                />
                <InputField
                  label="Address Line 2"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Landmark, City..."
                  icon={MapPin}
                  required
                />
              </div>
            </DashboardCard>

            {/* CARD 4: ABOUT DOCTOR */}
            <DashboardCard title="About Doctor" icon={FileText}>
              <div>
                <label style={labelStyle}>Biography / Detail</label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={6}
                  placeholder="Write a detailed description about the doctor's experience, background, and medical practice..."
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    height: 'auto',
                    padding: '14px'
                  }}
                  required
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
            </DashboardCard>

            {/* CARD 5: SUBMIT BUTTON */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 24,
                padding: 24,
                boxShadow: '0 8px 24px rgba(15,23,42,.05)'
              }}
            >
              <button
                type="submit"
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(37,99,235,0.25)',
                  transition: 'all 0.25s ease',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.95'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                👨‍⚕️ Register Doctor
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
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
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
const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
  step
}) => (
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

export default React.memo(AddDoctor)