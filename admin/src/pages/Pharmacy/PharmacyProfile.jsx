import React, { useContext, useEffect, useState } from 'react'
import { PharmacyContext } from '../../context/PharmacyContext'
import { UserCog, Pill, Phone, MapPin, FileBadge, Check, Loader2 } from 'lucide-react'
import PageHero from '../../components/PageHero'
import FormCard from '../../components/FormCard'
import FormInput from '../../components/FormInput'

const PharmacyProfile = () => {
  const { pToken, pharmacyProfile, getPharmacyProfile, updatePharmacyProfile } = useContext(PharmacyContext)
  const [form, setForm] = useState({ name: '', phone: '', licenseNumber: '', line1: '', city: '', state: '', pincode: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (pToken) getPharmacyProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pToken])

  useEffect(() => {
    if (pharmacyProfile) {
      setForm({
        name: pharmacyProfile.name || '',
        phone: pharmacyProfile.phone || '',
        licenseNumber: pharmacyProfile.licenseNumber || '',
        line1: pharmacyProfile.address?.line1 || '',
        city: pharmacyProfile.address?.city || '',
        state: pharmacyProfile.address?.state || '',
        pincode: pharmacyProfile.address?.pincode || '',
      })
    }
  }, [pharmacyProfile])

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await updatePharmacyProfile({
      name: form.name,
      phone: form.phone,
      licenseNumber: form.licenseNumber,
      address: { line1: form.line1, city: form.city, state: form.state, pincode: form.pincode },
    })
    setSaving(false)
  }

  if (!pharmacyProfile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
      </div>
    )
  }

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '32px 24px 48px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <PageHero icon={UserCog} title="Pharmacy Profile" description="Manage your pharmacy's details." />

        <form onSubmit={handleSubmit}>
          <FormCard title="Pharmacy Details" icon={Pill}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <FormInput label="Pharmacy Name" value={form.name} onChange={handleChange('name')} icon={Pill} required />
              <FormInput label="License Number" value={form.licenseNumber} onChange={handleChange('licenseNumber')} icon={FileBadge} />
              <FormInput label="Phone" value={form.phone} onChange={handleChange('phone')} icon={Phone} />
            </div>
          </FormCard>

          <div style={{ height: 24 }} />

          <FormCard title="Address" icon={MapPin}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <FormInput label="Address Line" value={form.line1} onChange={handleChange('line1')} icon={MapPin} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <FormInput label="City" value={form.city} onChange={handleChange('city')} />
                <FormInput label="State" value={form.state} onChange={handleChange('state')} />
                <FormInput label="Pincode" value={form.pincode} onChange={handleChange('pincode')} />
              </div>
            </div>
          </FormCard>

          <div style={{ height: 24 }} />

          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              height: 50, width: '100%', borderRadius: 14, border: 'none',
              background: saving ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #14B8A6)',
              color: '#FFFFFF', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 10px 30px rgba(37,99,235,0.25)', fontFamily: 'Inter, sans-serif'
            }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default PharmacyProfile
