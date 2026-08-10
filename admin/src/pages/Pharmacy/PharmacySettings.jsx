import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { PharmacyContext } from '../../context/PharmacyContext'
import { Settings, Lock, Mail, Check, Loader2 } from 'lucide-react'
import PageHero from '../../components/PageHero'
import FormCard from '../../components/FormCard'
import FormInput from '../../components/FormInput'
import { formLabelStyle } from '../../components/formStyles'

const PharmacySettings = () => {
  const { pToken, pharmacyProfile, getPharmacyProfile, changePharmacyPassword } = useContext(PharmacyContext)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (pToken) getPharmacyProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pToken])

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match')
      return
    }

    setSaving(true)
    const data = await changePharmacyPassword(currentPassword, newPassword, confirmPassword)
    if (data.success) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setSaving(false)
  }

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <PageHero icon={Settings} title="Settings" description="Manage your pharmacy portal account." />

        <FormCard title="Account" icon={Mail}>
          <label style={formLabelStyle}>Login Email</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '12px 14px' }}>
            <Mail size={16} color="#94A3B8" />
            <span style={{ fontSize: 13.5, color: '#0F172A', fontWeight: 600 }}>{pharmacyProfile?.email || '—'}</span>
          </div>
          <p style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 8 }}>
            To change your login email, contact CuraLink support.
          </p>
        </FormCard>

        <div style={{ height: 24 }} />

        <FormCard title="Change Password" icon={Lock}>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <FormInput label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" icon={Lock} />
            <FormInput label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" icon={Lock} required />
            <FormInput label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" icon={Lock} required />

            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                height: 50, borderRadius: 14, border: 'none',
                background: saving ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #14B8A6)',
                color: '#FFFFFF', fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 10px 30px rgba(37,99,235,0.25)', fontFamily: 'Inter, sans-serif'
              }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </FormCard>
      </div>
    </div>
  )
}

export default PharmacySettings
