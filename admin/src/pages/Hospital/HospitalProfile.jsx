import React, { useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { HospitalContext } from '../../context/HospitalContext'
import {
  Building2, Phone, Mail, Globe, MapPin, Compass, Clock, BedDouble, FileText,
  ShieldCheck, Activity, Ambulance, Microscope, Syringe, HeartPulse, Car, Utensils,
  Check, Plus, X, Loader2, ExternalLink
} from 'lucide-react'
import PageHero from '../../components/PageHero'
import FormCard from '../../components/FormCard'
import FormInput from '../../components/FormInput'
import { formLabelStyle, formInputStyle, formFocusHandlers } from '../../components/formStyles'
import CuraLinkPhoneInput from '../../components/PhoneInput'

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
  { name: 'Cafeteria', icon: Utensils },
]

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
    <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
  </div>
)

const ToggleRow = (props) => {
  const Icon = props.icon
  const { label, hint, checked, onChange } = props
  return (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 14, padding: '14px 18px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon size={18} color="#2563EB" />
      <div>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', margin: 0 }}>{label}</p>
        {hint && <p style={{ fontSize: 11.5, color: '#94A3B8', margin: '2px 0 0' }}>{hint}</p>}
      </div>
    </div>
    <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{ position: 'absolute', inset: 0, backgroundColor: checked ? '#16A34A' : '#CBD5E1', borderRadius: 99, transition: '0.25s ease' }}>
        <span style={{ position: 'absolute', height: 18, width: 18, left: checked ? 23 : 3, bottom: 3, backgroundColor: '#FFFFFF', borderRadius: '50%', transition: '0.25s ease' }} />
      </span>
    </label>
  </div>
  )
}

const HospitalProfile = () => {
  const { hToken, backendUrl, hospitalProfile, getHospitalProfile } = useContext(HospitalContext)
  const [form, setForm] = useState(null)
  const [specialtyInput, setSpecialtyInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (hToken) getHospitalProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  useEffect(() => {
    if (hospitalProfile && !form) {
      setForm({
        name: hospitalProfile.name || '',
        description: hospitalProfile.description || '',
        phone: hospitalProfile.phone || '',
        email: hospitalProfile.email || '',
        website: hospitalProfile.website || '',
        address: { line1: '', line2: '', city: '', state: '', country: 'India', pincode: '', ...hospitalProfile.address },
        location: { latitude: '', longitude: '', mapsUrl: '', ...hospitalProfile.location },
        openingHours: hospitalProfile.openingHours || '24 Hours',
        beds: hospitalProfile.beds || 0,
        emergency: hospitalProfile.emergency ?? true,
        insuranceAccepted: hospitalProfile.insuranceAccepted ?? true,
        facilities: hospitalProfile.facilities || [],
        specialties: hospitalProfile.specialties || [],
      })
    }
  }, [hospitalProfile, form])

  const set = useCallback((field, value) => setForm((p) => ({ ...p, [field]: value })), [])
  const setNested = useCallback((parent, field, value) => setForm((p) => ({ ...p, [parent]: { ...p[parent], [field]: value } })), [])
  const toggleFacility = useCallback((name) => {
    setForm((p) => ({
      ...p,
      facilities: p.facilities.includes(name) ? p.facilities.filter((f) => f !== name) : [...p.facilities, name]
    }))
  }, [])
  const addSpecialty = () => {
    const value = specialtyInput.trim()
    if (!value) return
    if (!form.specialties.includes(value)) set('specialties', [...form.specialties, value])
    setSpecialtyInput('')
  }
  const removeSpecialty = (value) => set('specialties', form.specialties.filter((s) => s !== value))

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await axios.put(`${backendUrl}/api/hospital/self/profile`, form, { headers: { htoken: hToken } })
      if (data.success) {
        toast.success('Profile updated')
        getHospitalProfile()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setSaving(false)
    }
  }

  if (!form) return <PageLoader />

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero icon={Building2} title="Hospital Profile" description="Keep your hospital's public information up to date." />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(580px, 1fr))', gap: 28 }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <FormCard title="Basic Information" icon={Building2}>
              <div style={{ marginBottom: 18 }}>
                <FormInput label="Hospital Name" value={form.name} onChange={(e) => set('name', e.target.value)} icon={Building2} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                <FormInput label="Opening Hours" value={form.openingHours} onChange={(e) => set('openingHours', e.target.value)} icon={Clock} />
                <FormInput label="Number of Beds" type="number" value={form.beds} onChange={(e) => set('beds', e.target.value)} icon={BedDouble} />
              </div>
              <div>
                <label style={formLabelStyle}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={4}
                  style={{ ...formInputStyle, resize: 'vertical', height: 'auto', padding: 14 }}
                  {...formFocusHandlers}
                />
              </div>
            </FormCard>

            <FormCard title="Contact Information" icon={Phone}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <FormInput label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} icon={Mail} />
                <div>
                  <label style={formLabelStyle}>Phone</label>
                  <CuraLinkPhoneInput value={form.phone} onChange={(value) => set('phone', value || '')} />
                </div>
                <FormInput label="Website" value={form.website} onChange={(e) => set('website', e.target.value)} icon={Globe} />
              </div>
            </FormCard>

            <FormCard title="Address" icon={MapPin}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <FormInput label="Address Line 1" value={form.address.line1} onChange={(e) => setNested('address', 'line1', e.target.value)} icon={MapPin} />
                <FormInput label="Address Line 2" value={form.address.line2} onChange={(e) => setNested('address', 'line2', e.target.value)} icon={MapPin} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
                <FormInput label="City" value={form.address.city} onChange={(e) => setNested('address', 'city', e.target.value)} />
                <FormInput label="State" value={form.address.state} onChange={(e) => setNested('address', 'state', e.target.value)} />
                <FormInput label="Country" value={form.address.country} onChange={(e) => setNested('address', 'country', e.target.value)} />
                <FormInput label="Pincode" value={form.address.pincode} onChange={(e) => setNested('address', 'pincode', e.target.value)} />
              </div>
            </FormCard>

            <FormCard title="Google Maps" icon={Compass}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <FormInput label="Latitude" type="number" step="any" value={form.location.latitude} onChange={(e) => setNested('location', 'latitude', e.target.value)} />
                <FormInput label="Longitude" type="number" step="any" value={form.location.longitude} onChange={(e) => setNested('location', 'longitude', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <FormInput label="Google Maps URL" value={form.location.mapsUrl || ''} onChange={(e) => setNested('location', 'mapsUrl', e.target.value)} icon={Globe} />
                </div>
                <a
                  href={form.location.mapsUrl || 'https://maps.google.com'}
                  target="_blank" rel="noreferrer"
                  style={{ height: 48, padding: '0 18px', borderRadius: 14, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', boxSizing: 'border-box', whiteSpace: 'nowrap' }}
                >
                  <ExternalLink size={16} /> Open Maps
                </a>
              </div>
            </FormCard>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <FormCard title="Availability & Services" icon={ShieldCheck}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ToggleRow icon={Ambulance} label="Emergency Services" hint="24/7 emergency care available" checked={form.emergency} onChange={(v) => set('emergency', v)} />
                <ToggleRow icon={ShieldCheck} label="Insurance Accepted" hint="Accepts health insurance plans" checked={form.insuranceAccepted} onChange={(v) => set('insuranceAccepted', v)} />
              </div>
            </FormCard>

            <FormCard title="Facilities" icon={Activity}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                {FACILITY_LIST.map((facility) => {
                  const Icon = facility.icon
                  const isSelected = form.facilities.includes(facility.name)
                  return (
                    <button
                      key={facility.name}
                      type="button"
                      onClick={() => toggleFacility(facility.name)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 999,
                        border: `1.5px solid ${isSelected ? '#2563EB' : '#CBD5E1'}`,
                        background: isSelected ? '#2563EB' : '#FFFFFF', color: isSelected ? '#FFFFFF' : '#334155',
                        fontSize: 12.5, fontWeight: isSelected ? 600 : 500, cursor: 'pointer',
                        transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      <Icon size={13} color={isSelected ? '#FFFFFF' : '#64748B'} />
                      {facility.name}
                    </button>
                  )
                })}
              </div>
            </FormCard>

            <FormCard title="Specialties" icon={FileText}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {form.specialties.map((s) => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0FDFA', color: '#0D9488', padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
                    {s}
                    <button type="button" onClick={() => removeSpecialty(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#0D9488' }}>
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty() } }}
                  placeholder="e.g. Cardiac Surgery"
                  style={{ flex: 1, height: 44, border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '0 14px', fontSize: 13.5, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                />
                <button type="button" onClick={addSpecialty} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', border: 'none', borderRadius: 12, padding: '0 18px', color: '#2563EB', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  <Plus size={15} /> Add
                </button>
              </div>
            </FormCard>

            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: 24, boxShadow: '0 8px 24px rgba(15,23,42,.05)' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: '100%', height: 56, borderRadius: 16,
                  background: saving ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #14B8A6)',
                  color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 10px 30px rgba(37,99,235,0.25)', fontFamily: 'Inter, sans-serif'
                }}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default HospitalProfile
