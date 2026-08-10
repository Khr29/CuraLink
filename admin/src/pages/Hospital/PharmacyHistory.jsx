import React, { useContext, useEffect, useMemo, useState } from 'react'
import { HospitalContext } from '../../context/HospitalContext'
import { History, Search, PackageCheck, Layers, ShieldAlert } from 'lucide-react'
import EmptyState from '../../components/EmptyState'

const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

const STATUS_STYLE = {
  dispensed: { bg: '#F0FDF4', color: '#16A34A', icon: PackageCheck },
  partially_dispensed: { bg: '#FFFBEB', color: '#D97706', icon: Layers },
}

// Hospital Portal — Pharmacy — Dispensing History. Scoped server-side to
// only what this hospital has actually dispensed (see
// getPharmacyHistory/authHospital in the backend) — never another
// hospital's activity.
const PharmacyHistory = () => {
  const { hToken, pharmacyHistory, getPharmacyHistory } = useContext(HospitalContext)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (hToken) getPharmacyHistory().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return pharmacyHistory
    return pharmacyHistory.filter((r) =>
      r.prescriptionId?.toLowerCase().includes(q) ||
      r.patient?.name?.toLowerCase().includes(q) ||
      r.doctor?.name?.toLowerCase().includes(q)
    )
  }, [pharmacyHistory, search])

  return (
    <div className="curalink-fade-in" style={{ maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <History size={20} /> Dispensing History
      </h1>
      <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px' }}>
        Prescriptions this hospital's Pharmacy section has dispensed against.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '10px 14px', marginBottom: 20, maxWidth: 360 }}>
        <Search size={15} color="#94A3B8" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by prescription ID, patient, doctor"
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12.5, fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ height: 70, borderRadius: 16, background: '#F1F5F9' }} className="animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
          <EmptyState icon={History} title="No Dispensing Activity Yet" subtitle="Prescriptions verified and dispensed here will show up in this list." />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((r, i) => {
            const style = STATUS_STYLE[r.dispensing?.status] || STATUS_STYLE.partially_dispensed
            const StatusIcon = r.status === 'revoked' ? ShieldAlert : style.icon
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '14px 18px', boxShadow: '0 4px 16px rgba(15,23,42,0.03)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: r.status === 'revoked' ? '#FEF2F2' : style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <StatusIcon size={17} color={r.status === 'revoked' ? '#DC2626' : style.color} />
                </div>
                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', margin: 0 }}>{r.prescriptionId}</p>
                  <p style={{ fontSize: 11.5, color: '#64748B', margin: '2px 0 0' }}>
                    {r.patient?.name || '—'} · {r.doctor?.name}{r.doctor?.speciality ? ` (${r.doctor.speciality})` : ''}
                  </p>
                </div>
                <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: style.bg, color: style.color, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {(r.dispensing?.status || '').replace('_', ' ')}
                  </span>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: '4px 0 0' }}>{formatDateTime(r.dispensing?.dispensedAt)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PharmacyHistory
