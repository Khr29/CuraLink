import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PharmacyContext } from '../../context/PharmacyContext'
import {
  Pill, ScanLine, Search, History, ShieldCheck, Clock,
  PackageCheck, PackageOpen, ShieldAlert, Activity
} from 'lucide-react'
import StatCard from '../../components/StatCard'
import QuickAction from '../../components/QuickAction'
import PageHero from '../../components/PageHero'

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
    <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
  </div>
)

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''

const PharmacyDashboard = () => {
  const { pToken, pharmacyProfile, getPharmacyProfile, pharmacyStats, getPharmacyStats, pharmacyHistory, getPharmacyHistory } = useContext(PharmacyContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (pToken) {
      getPharmacyProfile()
      getPharmacyStats()
      getPharmacyHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pToken])

  if (!pharmacyProfile || !pharmacyStats) return <PageLoader />

  const stats = [
    { icon: ShieldCheck, label: 'Verified Today', value: pharmacyStats.verifiedToday, accent: { bg: '#EFF6FF', color: '#2563EB' } },
    { icon: PackageOpen, label: 'Partially Dispensed', value: pharmacyStats.partiallyDispensed, accent: { bg: '#FFFBEB', color: '#D97706' } },
    { icon: PackageCheck, label: 'Fully Dispensed', value: pharmacyStats.dispensedTotal, accent: { bg: '#F0FDF4', color: '#22C55E' } },
    { icon: Activity, label: "Dispensed Today", value: pharmacyStats.dispensedToday, accent: { bg: '#F0FDFA', color: '#14B8A6' } },
    { icon: ShieldAlert, label: 'Revoked / Invalid Touched', value: pharmacyStats.revokedTouched, accent: { bg: '#FEF2F2', color: '#DC2626' } },
  ]

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '32px 24px 48px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero
          icon={Pill}
          title={pharmacyProfile.name}
          description="Verify prescriptions and manage dispensing from your Pharmacy portal."
          badge={
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: pharmacyProfile.active ? 'rgba(34,197,94,0.18)' : 'rgba(148,163,184,0.18)',
              border: `1px solid ${pharmacyProfile.active ? 'rgba(94,234,212,0.4)' : 'rgba(255,255,255,0.25)'}`,
              color: pharmacyProfile.active ? '#5EEAD4' : '#CBD5E1',
              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em'
            }}>
              {pharmacyProfile.active ? 'Active' : 'Inactive'}
            </span>
          }
        />

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 24 }} className="curalink-dashboard-grid">

          {/* Recent prescriptions */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: '24px 26px', boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Recent Prescriptions</h2>
              <button onClick={() => navigate('/pharmacy-history')} style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}>
                View all
              </button>
            </div>

            {pharmacyHistory.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', padding: '32px 0' }}>No dispensing activity yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pharmacyHistory.slice(0, 6).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 14, padding: '12px 14px', gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{item.prescriptionId}</p>
                      <p style={{ fontSize: 11.5, color: '#64748B', margin: '2px 0 0' }}>
                        {item.patient?.name || 'Patient'} · Dr. {item.doctor?.name} · {formatDate(item.dispensedAt)}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: '5px 10px', borderRadius: 999, flexShrink: 0,
                      background: '#F0FDFA', color: '#0D9488',
                    }}>
                      {item.quantityDispensed} × {item.medicineName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <QuickAction icon={ScanLine} label="Scan QR" description="Open camera to scan a prescription" onClick={() => navigate('/pharmacy-scan')} />
            <QuickAction icon={Search} label="Verify Prescription" description="Look up by code or verify link" onClick={() => navigate('/pharmacy-scan')} />
            <QuickAction icon={History} label="Dispensing History" description="View your full dispensing log" onClick={() => navigate('/pharmacy-history')} />
            <QuickAction icon={Clock} label="Today's Activity" description={`${pharmacyStats.verifiedToday} verified, ${pharmacyStats.dispensedToday} dispensed today`} onClick={() => navigate('/pharmacy-history')} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .curalink-dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default PharmacyDashboard
