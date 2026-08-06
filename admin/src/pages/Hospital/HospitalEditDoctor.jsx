import React, { useState, useContext, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { HospitalContext } from '../../context/HospitalContext'
import {
  User,
  Stethoscope,
  GraduationCap,
  Briefcase,
  IndianRupee,
  MapPin,
  FileText,
  UploadCloud,
  Pencil,
  ToggleRight
} from 'lucide-react'
import PageHero from '../../components/PageHero'
import FormCard from '../../components/FormCard'
import FormInput from '../../components/FormInput'
import { formLabelStyle, formInputStyle, formFocusHandlers } from '../../components/formStyles'
import { parseExperienceYears, formatExperienceYears } from '../../utils/experience'

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
    <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
  </div>
)

const HospitalEditDoctor = () => {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { backendUrl, hToken, doctors, getHospitalDoctors } = useContext(HospitalContext)

  const [docImg, setDocImg] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (hToken && doctors.length === 0) getHospitalDoctors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  useEffect(() => {
    const doctor = doctors.find((d) => d._id === doctorId)
    if (doctor) {
      setForm({
        name: doctor.name,
        image: doctor.image,
        speciality: doctor.speciality,
        degree: doctor.degree,
        experience: parseExperienceYears(doctor.experience) ?? 1,
        fees: doctor.fees,
        about: doctor.about,
        available: doctor.available,
        address1: doctor.address?.line1 || '',
        address2: doctor.address?.line2 || '',
      })
    }
  }, [doctors, doctorId])

  const onSubmitHandler = useCallback(
    async (event) => {
      event.preventDefault()

      if (form.experience === '' || Number(form.experience) < 0) {
        return toast.error('Enter a valid number of years of experience')
      }

      setSaving(true)
      try {
        const formData = new FormData()
        if (docImg) formData.append('image', docImg)
        formData.append('speciality', form.speciality)
        formData.append('degree', form.degree)
        formData.append('experience', formatExperienceYears(form.experience))
        formData.append('fees', form.fees)
        formData.append('about', form.about)
        formData.append('available', form.available)
        formData.append('address', JSON.stringify({ line1: form.address1.trim(), line2: form.address2.trim() }))

        const { data } = await axios.put(
          `${backendUrl}/api/hospital/self/doctors/${doctorId}`,
          formData,
          { headers: { htoken: hToken } }
        )

        if (data.success) {
          toast.success(data.message)
          getHospitalDoctors()
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
    [docImg, form, backendUrl, hToken, doctorId, getHospitalDoctors, navigate]
  )

  if (!form) return <PageLoader />

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <form onSubmit={onSubmitHandler} style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero icon={Pencil} title={`Edit Dr. ${form.name}`} description="Update this doctor's professional details." />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(580px, 1fr))', gap: 28 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <FormCard title="Professional Information" icon={User}>

              <div style={{ marginBottom: 24 }}>
                <label style={formLabelStyle}>Doctor Photo</label>
                <div style={{ position: 'relative' }}>
                  <label
                    htmlFor="doc-img"
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: '24px 16px', borderRadius: 20, border: '2px dashed #CBD5E1',
                      background: '#F8FAFC', cursor: 'pointer', transition: 'all 0.25s ease', textAlign: 'center'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.background = '#EFF6FF' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC' }}
                  >
                    <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 14, overflow: 'hidden' }}>
                      <img src={docImg ? URL.createObjectURL(docImg) : form.image} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 600, fontSize: 13 }}>
                        Click to Replace Photo
                      </div>
                    </div>
                  </label>
                  <input type="file" id="doc-img" hidden accept="image/*" onChange={(e) => setDocImg(e.target.files[0])} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <UploadCloud size={13} color="#94A3B8" />
                    <p style={{ fontSize: 11.5, color: '#94A3B8', margin: 0 }}>Only shown if you upload a new photo.</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <div>
                  <label style={formLabelStyle}>Speciality</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: 14, pointerEvents: 'none', color: '#94A3B8' }}>
                      <Stethoscope size={18} />
                    </div>
                    <select value={form.speciality} onChange={(e) => setForm((p) => ({ ...p, speciality: e.target.value }))} style={{ ...formInputStyle, paddingLeft: 42 }} {...formFocusHandlers}>
                      <option value="General physician">General physician</option>
                      <option value="Gynecologist">Gynecologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pediatricians">Pediatricians</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Gastroenterologist">Gastroenterologist</option>
                    </select>
                  </div>
                </div>
                <FormInput label="Education / Degree" value={form.degree} onChange={(e) => setForm((p) => ({ ...p, degree: e.target.value }))} placeholder="MBBS, MD" icon={GraduationCap} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <div>
                  <label style={formLabelStyle}>Experience (Years)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: 14, pointerEvents: 'none', color: '#94A3B8' }}>
                      <Briefcase size={18} />
                    </div>
                    <input
                      type="number" min={0} max={70} step={1}
                      value={form.experience}
                      onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value === '' ? '' : Number(e.target.value) }))}
                      placeholder="e.g. 5"
                      style={{ ...formInputStyle, paddingLeft: 42, paddingRight: 70 }}
                      {...formFocusHandlers}
                    />
                    <span style={{ position: 'absolute', right: 14, color: '#94A3B8', fontSize: 13, fontWeight: 600, pointerEvents: 'none' }}>
                      {form.experience === 1 ? 'Year' : 'Years'}
                    </span>
                  </div>
                </div>
                <FormInput label="Consultation Fees" type="number" value={form.fees} onChange={(e) => setForm((p) => ({ ...p, fees: e.target.value }))} placeholder="500" icon={IndianRupee} required />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 14, padding: '14px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ToggleRight size={18} color="#2563EB" />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>Available for bookings</span>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.available} onChange={(e) => setForm((p) => ({ ...p, available: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', inset: 0, backgroundColor: form.available ? '#16A34A' : '#CBD5E1', borderRadius: 99, transition: '0.25s ease' }}>
                    <span style={{ position: 'absolute', height: 18, width: 18, left: form.available ? 23 : 3, bottom: 3, backgroundColor: '#FFFFFF', borderRadius: '50%', transition: '0.25s ease' }} />
                  </span>
                </label>
              </div>
            </FormCard>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <FormCard title="Clinic Address" icon={MapPin}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <FormInput label="Address Line 1" value={form.address1} onChange={(e) => setForm((p) => ({ ...p, address1: e.target.value }))} placeholder="Street, Area..." icon={MapPin} required />
                <FormInput label="Address Line 2" value={form.address2} onChange={(e) => setForm((p) => ({ ...p, address2: e.target.value }))} placeholder="Landmark, City..." icon={MapPin} />
              </div>
            </FormCard>

            <FormCard title="About Doctor" icon={FileText}>
              <label style={formLabelStyle}>Biography / Detail</label>
              <textarea
                value={form.about}
                onChange={(e) => setForm((p) => ({ ...p, about: e.target.value }))}
                rows={6}
                style={{ ...formInputStyle, resize: 'vertical', height: 'auto', padding: '14px' }}
                required
                {...formFocusHandlers}
              />
            </FormCard>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: 24, boxShadow: '0 8px 24px rgba(15,23,42,.05)', display: 'flex', gap: 12 }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1, height: 52, borderRadius: 14,
                  background: saving ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #14B8A6)',
                  color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 14.5,
                  cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
                  boxShadow: saving ? 'none' : '0 10px 30px rgba(37,99,235,0.25)'
                }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/hospital-my-doctors')}
                style={{ flex: 1, height: 52, borderRadius: 14, background: '#FFFFFF', border: '1.5px solid #E2E8F0', color: '#475569', fontWeight: 600, fontSize: 14.5, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

export default HospitalEditDoctor
