import React, { useContext, useEffect, useMemo, useState } from 'react'
import { PharmacyContext } from '../../context/PharmacyContext'
import {
  ShieldAlert, ShieldCheck, PackageCheck, PackageX, ChevronLeft, ChevronRight
} from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'

const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'

// Every action this page can show, mapped to a plain-language label, icon,
// and color — kept separate from the raw AUDIT_ACTIONS/reason strings
// (backend/utils/auditLog.js, medicalRecordController.js) so this view stays
// readable without a pharmacist needing to know the internal vocabulary.
const ACTION_META = {
  PRESCRIPTION_ACCESSED_BY_PHARMACY: { label: 'Scanned', icon: ShieldCheck, color: '#2563EB', bg: '#EFF6FF' },
  PRESCRIPTION_DISPENSED: { label: 'Dispensed', icon: PackageCheck, color: '#16A34A', bg: '#F0FDF4' },
  PRESCRIPTION_DISPENSE_REJECTED: { label: 'Dispense Rejected', icon: PackageX, color: '#D97706', bg: '#FFFBEB' },
  UNAUTHORIZED_ACCESS_ATTEMPT: { label: 'Invalid / Unauthorized Scan', icon: ShieldAlert, color: '#DC2626', bg: '#FEF2F2' },
}

const REASON_LABELS = {
  valid: 'Valid prescription',
  partially_dispensed: 'Partially dispensed',
  already_dispensed: 'Already fully dispensed',
  revoked: 'Revoked prescription',
  expired: 'Expired prescription',
  not_found: 'QR not recognized',
  not_active: 'Prescription not active',
  medicine_not_found: 'Medicine not found',
  already_fully_dispensed: 'Already fully dispensed',
  over_dispense_attempt: 'Requested more than remaining',
}

const PharmacyScanLog = () => {
  const { pToken, pharmacyScanLog, pharmacyScanLogPagination, getPharmacyScanLog } = useContext(PharmacyContext)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!pToken) return
    setLoading(true)
    getPharmacyScanLog({ page, limit: 25 }).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pToken, page])

  const pagination = pharmacyScanLogPagination || { page: 1, pages: 1, total: 0 }

  const rows = useMemo(() => pharmacyScanLog.map((log) => {
    const meta = ACTION_META[log.action] || { label: log.action, icon: ShieldAlert, color: '#64748B', bg: '#F8FAFC' }
    return { ...log, meta }
  }), [pharmacyScanLog])

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '32px 24px 48px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <PageHero
          icon={ShieldAlert}
          title="Scan History & Security Log"
          description="A read-only record of every prescription scan this pharmacy has attempted — valid, rejected, or unauthorized. You cannot edit or remove entries here."
        />

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: 68, borderRadius: 16, background: '#FFFFFF', border: '1px solid #F1F5F9' }} />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={ShieldAlert} title="No scan activity yet" subtitle="Every prescription you scan — valid or not — will be recorded here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map((log) => {
              const Icon = log.meta.icon
              return (
                <div key={log._id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: log.meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color={log.meta.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{log.meta.label}</span>
                      {log.target?.label && log.target.label !== 'unknown token' && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0D9488', background: '#F0FDFA', padding: '2px 8px', borderRadius: 99 }}>
                          {log.target.label}
                        </span>
                      )}
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
                        color: log.status === 'success' ? '#16A34A' : '#DC2626',
                        background: log.status === 'success' ? '#F0FDF4' : '#FEF2F2',
                      }}>
                        {log.status === 'success' ? 'OK' : 'Failed'}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748B', margin: '3px 0 0' }}>
                      {REASON_LABELS[log.reason] || log.reason || '—'}
                    </p>
                  </div>
                  <span style={{ fontSize: 11.5, color: '#94A3B8', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {!loading && pagination.total > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <span style={{ fontSize: 12.5, color: '#64748B' }}>
              Page {pagination.page} of {pagination.pages} · {pagination.total} total scans
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: pagination.page <= 1 ? 'default' : 'pointer', opacity: pagination.page <= 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={16} color="#334155" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={pagination.page >= pagination.pages}
                style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #E2E8F0', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: pagination.page >= pagination.pages ? 'default' : 'pointer', opacity: pagination.page >= pagination.pages ? 0.4 : 1 }}
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

export default PharmacyScanLog
