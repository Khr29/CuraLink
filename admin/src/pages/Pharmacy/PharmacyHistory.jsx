import React, { useContext, useEffect, useMemo, useState } from 'react'
import { PharmacyContext } from '../../context/PharmacyContext'
import { History, Search, User, Stethoscope } from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'

const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const STATUS_STYLE = {
  dispensed: { bg: '#F0FDF4', color: '#16A34A' },
  partially_dispensed: { bg: '#FFFBEB', color: '#D97706' },
  pending: { bg: '#F1F5F9', color: '#64748B' },
  not_applicable: { bg: '#F1F5F9', color: '#64748B' },
}

const PharmacyHistory = () => {
  const { pToken, pharmacyHistory, getPharmacyHistory } = useContext(PharmacyContext)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (pToken) getPharmacyHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pToken])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return pharmacyHistory
    return pharmacyHistory.filter((item) =>
      item.prescriptionId?.toLowerCase().includes(q) ||
      item.patient?.name?.toLowerCase().includes(q) ||
      item.doctor?.name?.toLowerCase().includes(q)
    )
  }, [pharmacyHistory, query])

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '32px 24px 48px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <PageHero icon={History} title="Dispensing History" description="Every prescription this pharmacy has verified and dispensed against — a full auditable log, never overwritten." />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 14, padding: '10px 14px', marginBottom: 20, maxWidth: 420 }}>
          <Search size={16} color="#94A3B8" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by prescription ID, patient, or doctor"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={History} title="No dispensing history yet" subtitle="Prescriptions you verify and dispense will appear here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((item, i) => {
              const style = STATUS_STYLE[item.dispensing?.status] || STATUS_STYLE.pending
              return (
                <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 18, padding: '16px 20px', boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: 0 }}>{item.prescriptionId}</p>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569' }}>
                        <User size={13} color="#94A3B8" /> {item.patient?.name || '—'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569' }}>
                        <Stethoscope size={13} color="#94A3B8" /> Dr. {item.doctor?.name}{item.doctor?.speciality ? ` (${item.doctor.speciality})` : ''}
                      </span>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '5px 12px', borderRadius: 999, textTransform: 'uppercase', background: style.bg, color: style.color }}>
                      {(item.dispensing?.status || 'pending').replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 10, fontSize: 11.5, color: '#94A3B8' }}>
                    <span>Issued: {formatDateTime(item.issuedAt)}</span>
                    <span>Dispensed: {formatDateTime(item.dispensing?.dispensedAt)}</span>
                    {item.prescribingHospital && <span>Prescribing Hospital: {item.prescribingHospital}</span>}
                    {item.dispensing?.notes && <span>Notes: {item.dispensing.notes}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default PharmacyHistory
