import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { AdminContext } from '../../context/AdminContext'
import {
  ScrollText,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  User,
  Stethoscope,
  Building2,
  ShieldCheck,
} from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import { SkeletonRow } from '../../components/Skeleton'

const ACTOR_TYPES = ['admin', 'doctor', 'hospital', 'user', 'system']
const STATUSES = ['success', 'failure']

const ACTOR_ICONS = {
  admin: ShieldCheck,
  doctor: Stethoscope,
  hospital: Building2,
  user: User,
  system: ScrollText,
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

const AuditLogs = () => {
  const { aToken, auditLogs, auditLogsPagination, getAuditLogs, exportAuditLogs } = useContext(AdminContext)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [actorType, setActorType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const params = useMemo(() => ({
    search: search.trim() || undefined,
    action: action || undefined,
    actorType: actorType || undefined,
    status: status || undefined,
    page,
    limit: 25,
  }), [search, action, actorType, status, page])

  // Single debounced fetch keyed on the full param set — covers typing,
  // dropdown changes, and pagination clicks with one consistent code path.
  // Page reset on filter change happens in the handlers below (event-driven,
  // not inside this effect), so this effect only ever synchronizes with the API.
  useEffect(() => {
    if (!aToken) return
    const timer = setTimeout(() => {
      setLoading(true)
      getAuditLogs(params).finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [aToken, getAuditLogs, params])

  const handleSearchChange = useCallback((e) => {
    setPage(1)
    setSearch(e.target.value)
  }, [])

  const handleFilterChange = useCallback((setter) => (e) => {
    setPage(1)
    setter(e.target.value)
  }, [])

  const handleExport = useCallback(() => {
    exportAuditLogs(params)
  }, [exportAuditLogs, params])

  const pagination = auditLogsPagination || { page: 1, pages: 1, total: 0 }

  const renderedLogs = useMemo(() => {
    return auditLogs?.map((log) => <LogRow key={log._id} log={log} />)
  }, [auditLogs])

  return (
    <div
      className="curalink-fade-in"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)',
        padding: '36px 24px'
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero
          icon={ScrollText}
          title="Audit Logs"
          description="A complete, searchable trail of every sensitive action taken across CuraLink."
          action={
            <button
              onClick={handleExport}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
                padding: '10px 20px',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#FFFFFF',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Download size={15} /> Export CSV
            </button>
          }
        />

        {/* FILTER BAR */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20,
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by actor, target, or reason…"
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                fontSize: 13.5,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <select value={actorType} onChange={handleFilterChange(setActorType)} style={selectStyle}>
            <option value="">All Actor Types</option>
            {ACTOR_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>

          <select value={status} onChange={handleFilterChange(setStatus)} style={selectStyle}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          <input
            value={action}
            onChange={handleFilterChange(setAction)}
            placeholder="Action (e.g. LOGIN)"
            style={{ ...selectStyle, width: 180 }}
          />
        </div>

        {/* DATA TABLE CONTAINER */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '150px 1.4fr 1.2fr 1.4fr 110px',
              gap: 16,
              padding: '16px 24px',
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              fontSize: 12,
              fontWeight: 700,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <span>Timestamp</span>
            <span>Actor</span>
            <span>Action</span>
            <span>Target</span>
            <span>Status</span>
          </div>

          <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : auditLogs?.length > 0 ? (
              renderedLogs
            ) : (
              <EmptyState
                icon={ScrollText}
                title="No Audit Logs Found"
                subtitle="No actions match your current search and filters."
              />
            )}
          </div>
        </div>

        {/* PAGINATION */}
        {!loading && pagination.total > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
            <span style={{ fontSize: 12.5, color: '#64748B' }}>
              Page {pagination.page} of {pagination.pages} · {pagination.total} total entries
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

const LogRow = ({ log }) => {
  const [hovered, setHovered] = useState(false)
  const ActorIcon = ACTOR_ICONS[log.actorType] || User
  const isSuccess = log.status === 'success'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '150px 1.4fr 1.2fr 1.4fr 110px',
        alignItems: 'center',
        gap: 16,
        padding: '14px 24px',
        borderBottom: '1px solid #F1F5F9',
        background: hovered ? '#F8FAFC' : '#FFFFFF',
        transition: 'background 0.2s ease',
      }}
    >
      <span style={{ fontSize: 12.5, color: '#64748B' }}>
        {new Date(log.createdAt).toLocaleString()}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, background: '#EFF6FF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <ActorIcon size={14} color="#2563EB" />
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#0F172A', margin: 0, fontSize: 13 }}>
            {log.actorLabel || 'Unknown'}
          </p>
          <p style={{ color: '#94A3B8', fontSize: 11, marginTop: 1, textTransform: 'capitalize' }}>
            {log.actorType}
          </p>
        </div>
      </div>

      <span style={{
        display: 'inline-flex', width: 'fit-content', fontSize: 11.5, fontWeight: 700,
        color: '#1D4ED8', background: '#EFF6FF', padding: '5px 10px', borderRadius: 99,
      }}>
        {log.action}
      </span>

      <span style={{ fontSize: 12.5, color: '#475569' }}>
        {log.target?.label || log.target?.type || '—'}
      </span>

      {isSuccess ? (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content',
          fontSize: 11.5, fontWeight: 700, color: '#10B981',
          background: '#ECFDF5', border: '1px solid #D1FAE5', padding: '5px 10px', borderRadius: 99,
        }}>
          <CheckCircle2 size={13} /> OK
        </div>
      ) : (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content',
          fontSize: 11.5, fontWeight: 700, color: '#EF4444',
          background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '5px 10px', borderRadius: 99,
        }}>
          <XCircle size={13} /> Failed
        </div>
      )}
    </div>
  )
}

export default React.memo(AuditLogs)
