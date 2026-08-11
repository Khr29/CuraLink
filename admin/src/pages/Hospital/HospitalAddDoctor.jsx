import React, { useState, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { HospitalContext } from '../../context/HospitalContext'
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
  UserPlus
} from 'lucide-react'
import PageHero from '../../components/PageHero'
import FormCard from '../../components/FormCard'
import FormInput from '../../components/FormInput'
import ImageUploadSlot from '../../components/ImageUploadSlot'
import { formLabelStyle, formInputStyle, formFocusHandlers } from '../../components/formStyles'
import { formatExperienceYears } from '../../utils/experience'

const HospitalAddDoctor = () => {
  const [docImg, setDocImg] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState(1)
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [saving, setSaving] = useState(false)

  const { backendUrl, hToken } = useContext(HospitalContext)
  const navigate = useNavigate()

  const onSubmitHandler = useCallback(
    async (event) => {
      event.preventDefault()

      if (!docImg) {
        return toast.error('Image not selected')
      }

      if (experience === '' || Number(experience) < 0) {
        return toast.error('Enter a valid number of years of experience')
      }

      setSaving(true)
      try {
        const formData = new FormData()

        formData.append('image', docImg)
        formData.append('name', name.trim())
        formData.append('email', email.trim())
        formData.append('password', password)
        formData.append('experience', formatExperienceYears(experience))
        formData.append('fees', fees)
        formData.append('about', about.trim())
        formData.append('speciality', speciality)
        formData.append('degree', degree.trim())
        formData.append('licenseNumber', licenseNumber.trim())
        formData.append(
          'address',
          JSON.stringify({ line1: address1.trim(), line2: address2.trim() })
        )

        const { data } = await axios.post(
          `${backendUrl}/api/hospital/self/doctors/add`,
          formData,
          { headers: { htoken: hToken } }
        )

        if (data.success) {
          toast.success(data.message)
          navigate('/hospital-my-doctors')
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        console.error(error)
        toast.error(error.response?.data?.message || error.message)
      } finally {
        setSaving(false)
      }
    },
    [docImg, name, email, password, experience, fees, about, speciality, degree, licenseNumber, address1, address2, backendUrl, hToken, navigate]
  )

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <form onSubmit={onSubmitHandler} style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero icon={UserPlus} title="Add New Doctor" description="Register a new doctor under your hospital." />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(580px, 1fr))', gap: 28 }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            <FormCard title="Basic Information" icon={User}>

              <div style={{ marginBottom: 24 }}>
                <ImageUploadSlot
                  label="Doctor Photo"
                  hint="Supports PNG, JPG or WEBP (Max 5MB)"
                  aspect="16/9"
                  file={docImg}
                  required
                  onSelect={setDocImg}
                  onRemove={() => setDocImg(null)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <FormInput label="Doctor Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. John Doe" icon={User} required />
                <div>
                  <label style={formLabelStyle}>Speciality</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: 14, pointerEvents: 'none', color: '#94A3B8' }}>
                      <Stethoscope size={18} />
                    </div>
                    <select value={speciality} onChange={(e) => setSpeciality(e.target.value)} style={{ ...formInputStyle, paddingLeft: 42 }} {...formFocusHandlers}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <FormInput label="Education / Degree" value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="MBBS, MD" icon={GraduationCap} required />
                <div>
                  <label style={formLabelStyle}>Experience (Years)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: 14, pointerEvents: 'none', color: '#94A3B8' }}>
                      <Briefcase size={18} />
                    </div>
                    <input
                      type="number" min={0} max={70} step={1}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 5"
                      style={{ ...formInputStyle, paddingLeft: 42, paddingRight: 70 }}
                      {...formFocusHandlers}
                    />
                    <span style={{ position: 'absolute', right: 14, color: '#94A3B8', fontSize: 13, fontWeight: 600, pointerEvents: 'none' }}>
                      {experience === 1 ? 'Year' : 'Years'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <FormInput label="Consultation Fees" type="number" value={fees} onChange={(e) => setFees(e.target.value)} placeholder="500" icon={IndianRupee} required />
                <FormInput label="License Number (optional)" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. MCI-123456" icon={FileText} />
              </div>
            </FormCard>

            <FormCard title="Contact Information" icon={Mail}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <FormInput label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="doctor@email.com" icon={Mail} required />
                <FormInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" icon={Lock} required />
              </div>
            </FormCard>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <FormCard title="Address" icon={MapPin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FormInput label="Address Line 1" value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="Street, Area..." icon={MapPin} required />
                <FormInput label="Address Line 2" value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Landmark, City..." icon={MapPin} required />
              </div>
            </FormCard>

            <FormCard title="About Doctor" icon={FileText}>
              <label style={formLabelStyle}>Biography / Detail</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={6}
                placeholder="Write a detailed description about the doctor's experience, background, and medical practice..."
                style={{ ...formInputStyle, resize: 'vertical', height: 'auto', padding: '14px' }}
                required
                {...formFocusHandlers}
              />
            </FormCard>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: 24, boxShadow: '0 8px 24px rgba(15,23,42,.05)' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%', height: 56, borderRadius: 16,
                  background: saving ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #14B8A6)',
                  color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 10px 30px rgba(37,99,235,0.25)',
                  transition: 'all 0.25s ease', fontFamily: 'Inter, sans-serif'
                }}
              >
                {saving ? 'Registering…' : '👨‍⚕️ Register Doctor'}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

export default HospitalAddDoctor
