import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HospitalContext } from '../../context/HospitalContext'
import { QrCode, History, ShieldCheck, CheckCircle2, PackageCheck, Layers, ShieldAlert } from 'lucide-react'
import StatCard from '../../components/StatCard'
import QuickAction from '../../components/QuickAction'
import PageHero from '../../components/PageHero'

const PageLoader = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
  </div>
)

// Hospital Portal — Pharmacy Overview. Same auth (hToken) and layout shell
// as every other Hospital Portal page; this is not a separate app.
const PharmacyOverview = () => {
  const { hToken, pharmacyStats, getPharmacyStats } = useContext(HospitalContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (hToken) getPharmacyStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  if (!pharmacyStats) return <PageLoader />

  const stats = [
    { icon: ShieldCheck, label: 'Verified Today', value: pharmacyStats.verifiedToday, accent: { bg: '#EFF6FF', color: '#2563EB' } },
    { icon: CheckCircle2, label: 'Dispensed Today', value: pharmacyStats.dispensedToday, accent: { bg: '#F0FDF4', color: '#22C55E' } },
    { icon: PackageCheck, label: 'Total Dispensed', value: pharmacyStats.dispensedTotal, accent: { bg: '#F0FDFA', color: '#14B8A6' } },
    { icon: Layers, label: 'Partially Dispensed', value: pharmacyStats.partiallyDispensed, accent: { bg: '#FFFBEB', color: '#D97706' } },
    { icon: ShieldAlert, label: 'Revoked (touched)', value: pharmacyStats.revokedTouched, accent: { bg: '#FEF2F2', color: '#DC2626' } },
  ]

  return (
    <div className="curalink-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <PageHero
        icon={QrCode}
        title="Pharmacy"
        description="Verify and dispense patient prescriptions from the same Hospital Portal you already use — no separate login."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
        Quick Actions
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        <QuickAction
          icon={QrCode}
          label="Verify & Dispense"
          description="Look up a prescription by its verification code and record dispensing"
          onClick={() => navigate('/hospital-pharmacy/verify')}
        />
        <QuickAction
          icon={History}
          label="Dispensing History"
          description="Review prescriptions this hospital has verified and dispensed"
          onClick={() => navigate('/hospital-pharmacy/history')}
        />
      </div>

      <div style={{ marginTop: 28, background: '#F0FDFA', border: '1px solid #99F6E4', borderRadius: 16, padding: 18, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <ShieldCheck size={18} color="#0D9488" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12.5, color: '#0F172A', margin: 0, lineHeight: 1.6 }}>
          The Pharmacy section only shows what's needed to fulfill a prescription — medicine, dose, frequency,
          quantity and instructions. It never gives access to a patient's diagnosis, notes, or other medical records.
        </p>
      </div>
    </div>
  )
}

export default PharmacyOverview
