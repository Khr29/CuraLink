import React, { useContext, useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { AdminContext } from '../../context/AdminContext'
import {
  Pill,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Pencil,
  Power,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  X,
  PackageCheck,
  Store,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import StatCard from '../../components/StatCard'
import ConfirmDialog from '../../components/ConfirmDialog'
import { SkeletonRow } from '../../components/Skeleton'
import { formLabelStyle, formInputStyle, formFocusHandlers } from '../../components/formStyles'

const PAGE_SIZE = 10

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

const buttonStyle = (primary) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 18px',
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  border: primary ? 'none' : '1px solid #E2E8F0',
  background: primary ? 'linear-gradient(135deg, #2563EB, #14B8A6)' : '#FFFFFF',
  color: primary ? '#FFFFFF' : '#334155',
})

const cardStyle = {
  background: '#FFFFFF',
  borderRadius: 20,
  border: '1px solid #E2E8F0',
  boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
}

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

const formatAddress = (a) =>
  a ? [a.line1, a.line2, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', ') : ''

const StatusBadge = ({ active }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 999,
      fontSize: 11.5,
      fontWeight: 700,
      color: active ? '#16A34A' : '#64748B',
      background: active ? '#F0FDF4' : '#F1F5F9',
      border: active ? '1px solid #DCFCE7' : '1px solid #E2E8F0',
    }}
  >
    {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
    {active ? 'Active' : 'Inactive'}
  </span>
)

const Pager = ({ pagination, onPage }) => {
  if (!pagination || pagination.pages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: 12.5, color: '#64748B' }}>
        Page {pagination.page} of {pagination.pages} · {pagination.total} total
      </span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" aria-label="Previous page" disabled={pagination.page <= 1} onClick={() => onPage(pagination.page - 1)} style={{ ...buttonStyle(false), padding: '8px 10px', opacity: pagination.page <= 1 ? 0.5 : 1 }}>
          <ChevronLeft size={16} />
        </button>
        <button type="button" aria-label="Next page" disabled={pagination.page >= pagination.pages} onClick={() => onPage(pagination.page + 1)} style={{ ...buttonStyle(false), padding: '8px 10px', opacity: pagination.page >= pagination.pages ? 0.5 : 1 }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

const EMPTY_FORM = { name: '', email: '', password: '', licenseNumber: '', phone: '', line1: '', city: '', state: '', pincode: '' }

// Add / edit modal. Password is only collected on create; on edit the
// field is optional and, when filled, sets a new password.
const PharmacyForm = ({ pharmacy, onClose, onSaved }) => {
  const { pharmacyRequest } = useContext(AdminContext)
  const editing = Boolean(pharmacy)
  const [form, setForm] = useState(() =>
    pharmacy
      ? {
          ...EMPTY_FORM,
          name: pharmacy.name || '',
          email: pharmacy.email || '',
          licenseNumber: pharmacy.licenseNumber || '',
          phone: pharmacy.phone || '',
          line1: pharmacy.address?.line1 || '',
          city: pharmacy.address?.city || '',
          state: pharmacy.address?.state || '',
          pincode: pharmacy.address?.pincode || '',
        }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const body = {
      name: form.name,
      email: form.email,
      licenseNumber: form.licenseNumber,
      phone: form.phone,
      address: { line1: form.line1, city: form.city, state: form.state, pincode: form.pincode },
    }
    if (form.password) body.password = form.password
    const data = editing
      ? await pharmacyRequest('put', `/update/${pharmacy._id}`, body)
      : await pharmacyRequest('post', '/add', body)
    setSaving(false)
    if (data.success) {
      toast.success(data.message)
      onSaved()
    } else {
      toast.error(data.message)
    }
  }

  const field = (key, label, props = {}) => (
    <div>
      <label style={formLabelStyle}>{label}</label>
      <input value={form[key]} onChange={set(key)} style={formInputStyle} {...formFocusHandlers} {...props} />
    </div>
  )

  return (
    <div role="dialog" aria-modal="true" aria-label={editing ? 'Edit pharmacy' : 'Add pharmacy'} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <form onSubmit={submit} style={{ ...cardStyle, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{editing ? 'Edit Pharmacy' : 'Add Pharmacy'}</h2>
          <button type="button" aria-label="Close" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {field('name', 'Pharmacy name', { required: true, maxLength: 120 })}
          {field('email', 'Email', { type: 'email', required: true, maxLength: 254 })}
          {field('password', editing ? 'New password (optional)' : 'Password', { type: 'password', required: !editing, autoComplete: 'new-password' })}
          {field('licenseNumber', 'License number', { maxLength: 60 })}
          {field('phone', 'Phone', { type: 'tel', maxLength: 20 })}
          {field('line1', 'Address', { maxLength: 120 })}
          {field('city', 'City', { maxLength: 120 })}
          {field('state', 'State', { maxLength: 120 })}
          {field('pincode', 'Pincode', { maxLength: 120 })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button type="button" onClick={onClose} style={buttonStyle(false)}>Cancel</button>
          <button type="submit" disabled={saving} style={{ ...buttonStyle(true), opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create pharmacy'}
          </button>
        </div>
      </form>
    </div>
  )
}

const InfoRow = (props) => {
  const Icon = props.icon
  return props.children ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: '#334155' }}>
      <Icon size={16} color="#94A3B8" />
      <span>{props.children}</span>
    </div>
  ) : null
}

const PharmacyDetail = ({ id, onBack, onEdit, onToggle }) => {
  const { pharmacyRequest } = useContext(AdminContext)
  const [pharmacy, setPharmacy] = useState(null)
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadHistory = useCallback(
    async (page = 1) => {
      const data = await pharmacyRequest('get', `/history/${id}`, undefined, { page, limit: PAGE_SIZE })
      if (data.success) {
        setHistory(data.history)
        setPagination(data.pagination)
      } else {
        toast.error(data.message)
      }
    },
    [id, pharmacyRequest]
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const [p, s] = await Promise.all([
        pharmacyRequest('get', `/detail/${id}`),
        pharmacyRequest('get', '/stats', undefined, { pharmacyId: id }),
      ])
      if (cancelled) return
      if (p.success) setPharmacy(p.pharmacy)
      else toast.error(p.message)
      if (s.success) setStats(s.stats)
      await loadHistory(1)
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [id, pharmacyRequest, loadHistory])

  return (
    <>
      <button type="button" onClick={onBack} style={{ ...buttonStyle(false), marginBottom: 16 }}>
        <ArrowLeft size={16} /> All pharmacies
      </button>

      {loading && !pharmacy ? (
        <SkeletonRow />
      ) : !pharmacy ? (
        <EmptyState icon={Store} title="Pharmacy not found" subtitle="It may have been removed." compact />
      ) : (
        <>
          <div style={{ ...cardStyle, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A' }}>{pharmacy.name}</h2>
                  <StatusBadge active={pharmacy.active} />
                </div>
                <InfoRow icon={Mail}>{pharmacy.email}</InfoRow>
                <InfoRow icon={Phone}>{pharmacy.phone}</InfoRow>
                <InfoRow icon={BadgeCheck}>{pharmacy.licenseNumber && `License ${pharmacy.licenseNumber}`}</InfoRow>
                <InfoRow icon={MapPin}>{formatAddress(pharmacy.address)}</InfoRow>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>
                  Created {formatDateTime(pharmacy.createdAt)} · Updated {formatDateTime(pharmacy.updatedAt)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <button type="button" onClick={() => onEdit(pharmacy)} style={buttonStyle(false)}>
                  <Pencil size={15} /> Edit
                </button>
                <button type="button" onClick={() => onToggle(pharmacy)} style={buttonStyle(false)}>
                  <Power size={15} /> {pharmacy.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>

          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
              <StatCard icon={PackageCheck} label="Dispensing events" value={stats.dispensingEvents} accent={{ bg: '#EFF6FF', color: '#2563EB' }} />
              <StatCard icon={Pill} label="Units dispensed" value={stats.unitsDispensed} accent={{ bg: '#F0FDFA', color: '#0D9488' }} />
              <StatCard icon={BadgeCheck} label="Prescriptions served" value={stats.prescriptionsServed} accent={{ bg: '#FFFBEB', color: '#D97706' }} />
            </div>
          )}

          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', fontWeight: 800, color: '#0F172A' }}>Dispensing history</div>
            {history.length === 0 ? (
              <EmptyState icon={PackageCheck} title="No dispensing yet" subtitle="Confirmed dispenses by this pharmacy will appear here." compact />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#64748B', fontSize: 12 }}>
                      {['Prescription', 'Medicine', 'Quantity', 'Dispensed at', 'Notes'].map((h) => (
                        <th key={h} style={{ padding: '10px 20px', fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row, i) => (
                      <tr key={`${row.prescriptionId}-${row.dispensedAt}-${i}`} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 20px', fontWeight: 700, color: '#0F172A' }}>{row.prescriptionId}</td>
                        <td style={{ padding: '12px 20px' }}>{row.medicineName || '—'}</td>
                        <td style={{ padding: '12px 20px' }}>{row.quantityDispensed}</td>
                        <td style={{ padding: '12px 20px' }}>{formatDateTime(row.dispensedAt)}</td>
                        <td style={{ padding: '12px 20px', color: '#64748B' }}>{row.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pager pagination={pagination} onPage={loadHistory} />
          </div>
        </>
      )}
    </>
  )
}

const Pharmacies = () => {
  const { aToken, pharmacyRequest } = useContext(AdminContext)
  const [pharmacies, setPharmacies] = useState([])
  const [counts, setCounts] = useState({ total: 0, active: 0, inactive: 0 })
  const [pagination, setPagination] = useState(null)
  const [loadedKey, setLoadedKey] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [formFor, setFormFor] = useState(undefined) // undefined = closed, null = add, object = edit
  const [pendingToggle, setPendingToggle] = useState(null)
  const [toggling, setToggling] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const queryKey = `${page}|${status}|${debouncedSearch}|${reloadKey}`
  const loading = loadedKey !== queryKey

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (!aToken) return undefined
    let cancelled = false
    pharmacyRequest('get', '/list', undefined, { page, limit: PAGE_SIZE, status: status || undefined, search: debouncedSearch || undefined }).then((data) => {
      if (cancelled) return
      if (data.success) {
        setPharmacies(data.pharmacies)
        setCounts(data.counts)
        setPagination(data.pagination)
      } else {
        toast.error(data.message)
      }
      setLoadedKey(queryKey)
    })
    return () => {
      cancelled = true
    }
  }, [aToken, page, status, debouncedSearch, queryKey, pharmacyRequest])

  const reload = () => setReloadKey((k) => k + 1)

  const confirmToggle = async () => {
    if (!pendingToggle) return
    setToggling(true)
    const data = await pharmacyRequest('patch', `/status/${pendingToggle._id}`)
    setToggling(false)
    if (data.success) {
      toast.success(data.message)
      setPendingToggle(null)
      reload()
    } else {
      toast.error(data.message)
    }
  }

  const afterSaved = () => {
    setFormFor(undefined)
    reload()
  }

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <PageHero
          icon={Store}
          title="Pharmacy Management"
          description="Onboard pharmacies, control who can dispense, and review each pharmacy's confirmed dispensing activity."
          action={
            <button type="button" onClick={() => setFormFor(null)} style={buttonStyle(false)}>
              <Plus size={16} /> Add Pharmacy
            </button>
          }
        />

        {selectedId ? (
          <PharmacyDetail
            key={`${selectedId}-${reloadKey}`}
            id={selectedId}
            onBack={() => setSelectedId(null)}
            onEdit={(p) => setFormFor(p)}
            onToggle={(p) => setPendingToggle(p)}
          />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
              <StatCard icon={Store} label="Total pharmacies" value={counts.total} accent={{ bg: '#EFF6FF', color: '#2563EB' }} />
              <StatCard icon={CheckCircle2} label="Active" value={counts.active} accent={{ bg: '#F0FDF4', color: '#16A34A' }} />
              <StatCard icon={XCircle} label="Inactive" value={counts.inactive} accent={{ bg: '#F1F5F9', color: '#64748B' }} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, license, phone, or city…"
                  aria-label="Search pharmacies"
                  style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <select
                aria-label="Filter by status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPage(1)
                }}
                style={selectStyle}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ ...cardStyle, overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: 20, display: 'grid', gap: 12 }}>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : pharmacies.length === 0 ? (
                <EmptyState icon={Store} title="No pharmacies found" subtitle="Try a different search or filter, or add a pharmacy." compact />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#64748B', fontSize: 12 }}>
                        {['Pharmacy', 'License', 'Contact', 'City', 'Status', ''].map((h) => (
                          <th key={h} style={{ padding: '12px 20px', fontWeight: 700 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pharmacies.map((p) => (
                        <tr key={p._id} style={{ borderTop: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 20px' }}>
                            <button type="button" onClick={() => setSelectedId(p._id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 700, color: '#0F172A', fontSize: 13.5, textAlign: 'left' }}>
                              {p.name}
                            </button>
                            <div style={{ fontSize: 12, color: '#94A3B8' }}>{p.email}</div>
                          </td>
                          <td style={{ padding: '14px 20px' }}>{p.licenseNumber || '—'}</td>
                          <td style={{ padding: '14px 20px' }}>{p.phone || '—'}</td>
                          <td style={{ padding: '14px 20px' }}>{p.address?.city || '—'}</td>
                          <td style={{ padding: '14px 20px' }}><StatusBadge active={p.active} /></td>
                          <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                            <button type="button" aria-label={`Edit ${p.name}`} onClick={() => setFormFor(p)} style={{ ...buttonStyle(false), padding: '6px 10px', marginRight: 8 }}>
                              <Pencil size={14} />
                            </button>
                            <button type="button" aria-label={`${p.active ? 'Deactivate' : 'Activate'} ${p.name}`} onClick={() => setPendingToggle(p)} style={{ ...buttonStyle(false), padding: '6px 10px' }}>
                              <Power size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Pager pagination={pagination} onPage={setPage} />
            </div>
          </>
        )}
      </div>

      {formFor !== undefined && (
        <PharmacyForm pharmacy={formFor} onClose={() => setFormFor(undefined)} onSaved={afterSaved} />
      )}

      <ConfirmDialog
        open={Boolean(pendingToggle)}
        title={pendingToggle?.active ? 'Deactivate pharmacy?' : 'Activate pharmacy?'}
        message={
          pendingToggle?.active
            ? `${pendingToggle?.name} will no longer be able to sign in or dispense medication.`
            : `${pendingToggle?.name} will be able to sign in and dispense medication again.`
        }
        confirmLabel={pendingToggle?.active ? 'Deactivate' : 'Activate'}
        destructive={Boolean(pendingToggle?.active)}
        loading={toggling}
        onConfirm={confirmToggle}
        onClose={() => setPendingToggle(null)}
      />
    </div>
  )
}

export default Pharmacies
