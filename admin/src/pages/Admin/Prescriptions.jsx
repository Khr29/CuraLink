import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { AdminContext } from '../../context/AdminContext'
import {
  ClipboardList,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Stethoscope,
  Building2,
  ShieldCheck,
  ShieldAlert,
  PackageCheck,
} from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import { SkeletonRow } from '../../components/Skeleton'

// Display labels only — the stored enum values (pending/not_applicable/
// partially_dispensed/dispensed) never change, matching the same wording
// used on the pharmacy scan screen (admin/src/pages/Pharmacy/PharmacyScan.jsx).
const DISPENSING_LABELS = {
  not_applicable: 'Not Dispensed',
  pending: 'Not Dispensed',
  partially_dispensed: 'Partially Dispensed',
  dispensed: 'Dispensed',
}

const DISPENSING_OPTIONS = ['pending', 'partially_dispensed', 'dispensed']
const STATUS_OPTIONS = ['active', 'revoked']

const dispensingStyle = (status) => {
  if (status === 'dispensed') return { color: '#16A34A', background: '#F0FDF4', border: '1px solid #DCFCE7' }
  if (status === 'partially_dispensed') return { color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A' }
  return { color: '#64748B', background: '#F1F5F9', border: '1px solid #E2E8F0' }
}

const selectStyle = {
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid #E2E8F0',
  background: '#FFFFFF',
  color: '#334155',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
}

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

const Prescriptions = () => {
  const { aToken, prescriptions, prescriptionsPagination, getAllPrescriptions, hospitals, getAllHospitals } = useContext(AdminContext)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dispensingStatus, setDispensingStatus] = useState('')
  const [hospitalId, setHospitalId] = useState('')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState(null)

  const params = useMemo(() => ({
    search: search.trim() || undefined,
    status: status || undefined,
    dispensingStatus: dispensingStatus || undefined,
    hospitalId: hospitalId || undefined,
    page,
    limit: 25,
  }), [search, status, dispensingStatus, hospitalId, page])

  useEffect(() => {
    if (!aToken) return
    const timer = setTimeout(() => {
      setLoading(true)
      getAllPrescriptions(params).finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [aToken, getAllPrescriptions, params])

  useEffect(() => {
    if (aToken && !hospitals?.length) getAllHospitals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken])

  const handleSearchChange = useCallback((e) => {
    setPage(1)
    setSearch(e.target.value)
  }, [])

  const handleFilterChange = useCallback((setter) => (e) => {
    setPage(1)
    setter(e.target.value)
  }, [])

  const pagination = prescriptionsPagination || { page: 1, pages: 1, total: 0 }

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero
          icon={ClipboardList}
          title="Prescriptions"
          description="A system-wide view of every prescribed, dispensed, and revoked prescription across CuraLink."
        />

        {/* FILTER BAR */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by prescription ID, patient, or doctor…"
              style={{
                width: '100%', padding: '10px 14px 10px 38px', borderRadius: 12,
                border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: 13.5,
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <select value={status} onChange={handleFilterChange(setStatus)} style={selectStyle}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          <select value={dispensingStatus} onChange={handleFilterChange(setDispensingStatus)} style={selectStyle}>
            <option value="">All Dispensing States</option>
            {DISPENSING_OPTIONS.map((d) => (
              <option key={d} value={d}>{DISPENSING_LABELS[d]}</option>
            ))}
          </select>

          <select value={hospitalId} onChange={handleFilterChange(setHospitalId)} style={selectStyle}>
            <option value="">All Hospitals</option>
            {(hospitals || []).map((h) => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>

        {/* DATA TABLE */}
        <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '130px 1.1fr 1.1fr 1fr 90px 140px 150px 28px',
            gap: 16, padding: '16px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
            fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>Rx ID</span>
            <span>Patient</span>
            <span>Doctor</span>
            <span>Hospital</span>
            <span>Meds</span>
            <span>Status</span>
            <span>Dispensing</span>
            <span />
          </div>

          <div>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : prescriptions?.length > 0 ? (
              prescriptions.map((rx) => (
                <PrescriptionRow
                  key={rx._id}
                  rx={rx}
                  expanded={expandedId === rx._id}
                  onToggle={() => setExpandedId((id) => (id === rx._id ? null : rx._id))}
                />
              ))
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No Prescriptions Found"
                subtitle="No prescriptions match your current search and filters."
              />
            )}
          </div>
        </div>

        {/* PAGINATION */}
        {!loading && pagination.total > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <span style={{ fontSize: 12.5, color: '#64748B' }}>
              Page {pagination.page} of {pagination.pages} · {pagination.total} total prescriptions
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: '1px solid #E2E8F0',
                  background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: pagination.page <= 1 ? 'default' : 'pointer', opacity: pagination.page <= 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={16} color="#334155" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={pagination.page >= pagination.pages}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: '1px solid #E2E8F0',
                  background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: pagination.page >= pagination.pages ? 'default' : 'pointer', opacity: pagination.page >= pagination.pages ? 0.4 : 1,
                }}
              >
                <ChevronRight size={16} color="#334155" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const PrescriptionRow = ({ rx, expanded, onToggle }) => {
  const [hovered, setHovered] = useState(false)
  const isRevoked = rx.status === 'revoked'
  const dispStatus = rx.dispensing?.status || 'pending'
  const dispStyle = dispensingStyle(dispStatus)

  return (
    <div style={{ borderBottom: '1px solid #F1F5F9' }}>
      <div
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'grid', gridTemplateColumns: '130px 1.1fr 1.1fr 1fr 90px 140px 150px 28px',
          alignItems: 'center', gap: 16, padding: '14px 24px', cursor: 'pointer',
          background: hovered || expanded ? '#F8FAFC' : '#FFFFFF', transition: 'background 0.2s ease',
        }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>{rx.prescriptionId || '—'}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <User size={13} color="#0EA5E9" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {rx.patient?.name || '—'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <Stethoscope size={13} color="#0EA5E9" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {rx.doctor?.name || '—'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {rx.hospital && <Building2 size={13} color="#64748B" style={{ flexShrink: 0 }} />}
          <span style={{ fontSize: 12.5, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {rx.hospital?.name || 'Independent'}
          </span>
        </div>

        <span style={{ fontSize: 12.5, color: '#475569' }}>{rx.medicines?.length || 0}</span>

        {isRevoked ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content', fontSize: 11.5, fontWeight: 700, color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', padding: '5px 10px', borderRadius: 99 }}>
            <ShieldAlert size={13} /> Revoked
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content', fontSize: 11.5, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', border: '1px solid #DCFCE7', padding: '5px 10px', borderRadius: 99 }}>
            <ShieldCheck size={13} /> Active
          </div>
        )}

        <span style={{ display: 'inline-flex', width: 'fit-content', fontSize: 11.5, fontWeight: 700, padding: '5px 10px', borderRadius: 99, ...dispStyle }}>
          {DISPENSING_LABELS[dispStatus] || 'Not Dispensed'}
        </span>

        {expanded ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
      </div>

      {expanded && (
        <div style={{ padding: '4px 24px 20px', background: '#F8FAFC' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Medications
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: rx.dispensingRecords?.length ? 16 : 0 }}>
              {(rx.medicines || []).map((m) => (
                <div key={m.medicineIndex} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 10, padding: '8px 12px' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0F172A' }}>{m.name || '—'}</span>
                  <span style={{ fontSize: 11.5, color: '#64748B' }}>
                    {m.dispensedQuantity}/{m.quantityPrescribed} dispensed · {m.remaining} remaining
                  </span>
                </div>
              ))}
            </div>

            {rx.dispensingRecords?.length > 0 && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                  Dispensing History
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {rx.dispensingRecords.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#475569' }}>
                      <PackageCheck size={13} color="#16A34A" style={{ flexShrink: 0 }} />
                      <span>
                        {entry.quantityDispensed}× {entry.medicineName} dispensed by {entry.pharmacyName || 'a pharmacy'} on {formatDate(entry.dispensedAt)}
                        {entry.notes ? ` — "${entry.notes}"` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(Prescriptions)
