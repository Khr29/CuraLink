import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { ArrowRightLeft, Check, X, Clock, Mail, LogIn, UserCog, UserMinus, Zap } from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import { SkeletonRow } from '../../components/Skeleton'
import ConfirmDialog from '../../components/ConfirmDialog'

const STATUS_TABS = ['pending', 'approved', 'rejected', 'cancelled']
const TYPE_ICON = { join: LogIn, transfer: ArrowRightLeft, invite: Mail }

const selectStyle = {
  height: 44, background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: 12,
  padding: '0 12px', fontSize: 13, color: '#0F172A', outline: 'none',
  fontFamily: 'Inter, sans-serif', cursor: 'pointer', width: '100%', boxSizing: 'border-box',
}

const DoctorRequests = () => {
  const {
    aToken, doctors, getAllDoctors, hospitals, getAllHospitals,
    doctorRequests, getAllDoctorRequests, assignDoctorToHospital,
    removeDoctorFromHospital, transferDoctor, adminApproveRequest, adminRejectRequest,
  } = useContext(AdminContext)

  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [rejectTarget, setRejectTarget] = useState(null)

  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedHospital, setSelectedHospital] = useState('')
  const [confirmAction, setConfirmAction] = useState(null) // { type: 'remove'|'force', label }

  useEffect(() => {
    if (aToken) {
      Promise.all([getAllDoctorRequests(), getAllDoctors(), getAllHospitals()]).finally(() => setLoading(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken])

  const filteredRequests = useMemo(
    () => doctorRequests.filter((r) => r.status === statusFilter),
    [doctorRequests, statusFilter]
  )

  const selectedDoctorObj = useMemo(
    () => doctors.find((d) => d._id === selectedDoctor),
    [doctors, selectedDoctor]
  )

  const handleAssign = useCallback(() => {
    if (!selectedDoctor || !selectedHospital) return
    assignDoctorToHospital(selectedDoctor, selectedHospital)
    setSelectedDoctor('')
    setSelectedHospital('')
  }, [selectedDoctor, selectedHospital, assignDoctorToHospital])

  const handleRequestTransfer = useCallback(() => {
    if (!selectedDoctor || !selectedHospital) return
    transferDoctor(selectedDoctor, selectedHospital, false)
    setSelectedDoctor('')
    setSelectedHospital('')
  }, [selectedDoctor, selectedHospital, transferDoctor])

  const handleForceTransfer = useCallback(() => {
    if (!selectedDoctor || !selectedHospital) return
    setConfirmAction({ type: 'force' })
  }, [selectedDoctor, selectedHospital])

  const handleRemove = useCallback(() => {
    if (!selectedDoctor) return
    setConfirmAction({ type: 'remove' })
  }, [selectedDoctor])

  const handleConfirm = useCallback(async () => {
    if (confirmAction?.type === 'force') {
      await transferDoctor(selectedDoctor, selectedHospital, true)
      setSelectedDoctor('')
      setSelectedHospital('')
    } else if (confirmAction?.type === 'remove') {
      await removeDoctorFromHospital(selectedDoctor)
      setSelectedDoctor('')
    }
    setConfirmAction(null)
  }, [confirmAction, selectedDoctor, selectedHospital, transferDoctor, removeDoctorFromHospital])

  const handleConfirmReject = useCallback(async () => {
    if (!rejectTarget) return
    await adminRejectRequest(rejectTarget._id)
    setRejectTarget(null)
  }, [rejectTarget, adminRejectRequest])

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero
          icon={UserCog}
          title="Doctor Assignments"
          description="Assign, transfer, or remove doctors from hospitals, and arbitrate pending requests across the network."
        />

        {/* QUICK ACTIONS */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, boxShadow: '0 8px 24px rgba(15,23,42,0.04)', padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 16px' }}>Direct Assignment</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>Doctor</label>
              <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} style={selectStyle}>
                <option value="">Select doctor…</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} {d.hospitalId?.name ? `(${d.hospitalId.name})` : '(Independent)'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>Hospital</label>
              <select value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)} style={selectStyle}>
                <option value="">Select hospital…</option>
                {hospitals.map((h) => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={handleAssign}
                disabled={!selectedDoctor || !selectedHospital}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, height: 44, padding: '0 16px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #2563EB, #14B8A6)', color: '#FFFFFF', fontSize: 12.5, fontWeight: 700,
                  cursor: (!selectedDoctor || !selectedHospital) ? 'not-allowed' : 'pointer',
                  opacity: (!selectedDoctor || !selectedHospital) ? 0.5 : 1, fontFamily: 'Inter, sans-serif',
                }}
              >
                <Check size={14} /> Assign (Direct)
              </button>
              <button
                onClick={handleRequestTransfer}
                disabled={!selectedDoctor || !selectedHospital}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, height: 44, padding: '0 16px', borderRadius: 12,
                  border: '1.5px solid #2563EB', background: '#EFF6FF', color: '#2563EB', fontSize: 12.5, fontWeight: 700,
                  cursor: (!selectedDoctor || !selectedHospital) ? 'not-allowed' : 'pointer',
                  opacity: (!selectedDoctor || !selectedHospital) ? 0.5 : 1, fontFamily: 'Inter, sans-serif',
                }}
              >
                <ArrowRightLeft size={14} /> Request Transfer
              </button>
              <button
                onClick={handleForceTransfer}
                disabled={!selectedDoctor || !selectedHospital}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, height: 44, padding: '0 16px', borderRadius: 12,
                  border: '1.5px solid #F59E0B', background: '#FFFBEB', color: '#B45309', fontSize: 12.5, fontWeight: 700,
                  cursor: (!selectedDoctor || !selectedHospital) ? 'not-allowed' : 'pointer',
                  opacity: (!selectedDoctor || !selectedHospital) ? 0.5 : 1, fontFamily: 'Inter, sans-serif',
                }}
              >
                <Zap size={14} /> Force Transfer
              </button>
              <button
                onClick={handleRemove}
                disabled={!selectedDoctor}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, height: 44, padding: '0 16px', borderRadius: 12,
                  border: '1.5px solid #FCA5A5', background: '#FFFFFF', color: '#DC2626', fontSize: 12.5, fontWeight: 700,
                  cursor: !selectedDoctor ? 'not-allowed' : 'pointer', opacity: !selectedDoctor ? 0.5 : 1, fontFamily: 'Inter, sans-serif',
                }}
              >
                <UserMinus size={14} /> Remove from Hospital
              </button>
            </div>
          </div>
          <p style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 12, margin: '12px 0 0' }}>
            "Assign" moves the doctor immediately — no approval needed. "Request Transfer" sends a pending request the hospital (or you, below) must approve. "Force Transfer" bypasses approval immediately. "Remove" sets the doctor to independent practice.
          </p>
        </div>

        {/* STATUS TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab
            const count = doctorRequests.filter((r) => r.status === tab).length
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '9px 18px', borderRadius: 99, border: active ? '1.5px solid #2563EB' : '1.5px solid #E2E8F0',
                  background: active ? '#EFF6FF' : '#FFFFFF', color: active ? '#2563EB' : '#475569',
                  fontSize: 12.5, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
                  display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, sans-serif',
                }}
              >
                {tab} {count > 0 && <span style={{ fontSize: 10.5, background: active ? '#2563EB' : '#E2E8F0', color: active ? '#FFFFFF' : '#64748B', padding: '1px 7px', borderRadius: 99 }}>{count}</span>}
              </button>
            )
          })}
        </div>

        {/* HISTORY / REQUEST LIST */}
        <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <RequestRow
                key={request._id}
                request={request}
                onApprove={() => adminApproveRequest(request._id)}
                onReject={() => setRejectTarget(request)}
              />
            ))
          ) : (
            <EmptyState
              icon={ArrowRightLeft}
              title={`No ${statusFilter} requests`}
              subtitle="Doctor <-> hospital affiliation requests across the network will show up here."
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.type === 'force' ? 'Force transfer this doctor?' : 'Remove this doctor from their hospital?'}
        message={
          confirmAction?.type === 'force'
            ? `${selectedDoctorObj?.name || 'This doctor'} will be moved immediately, bypassing hospital approval.`
            : `${selectedDoctorObj?.name || 'This doctor'} will become an independent practitioner immediately.`
        }
        confirmLabel={confirmAction?.type === 'force' ? 'Force Transfer' : 'Remove'}
        onConfirm={handleConfirm}
        onClose={() => setConfirmAction(null)}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject this request?"
        message={rejectTarget ? `${rejectTarget.doctorId?.name || 'This doctor'}'s ${rejectTarget.type} request to ${rejectTarget.hospitalId?.name || 'the hospital'} will be rejected.` : ''}
        confirmLabel="Reject Request"
        onConfirm={handleConfirmReject}
        onClose={() => setRejectTarget(null)}
      />
    </div>
  )
}

const RequestRow = ({ request, onApprove, onReject }) => {
  const [hovered, setHovered] = useState(false)
  const doctor = request.doctorId || {}
  const TypeIcon = TYPE_ICON[request.type] || Clock

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px',
        borderBottom: '1px solid #F1F5F9', background: hovered ? '#F8FAFC' : '#FFFFFF', transition: 'background 0.2s ease',
      }}
    >
      <img
        src={doctor.image}
        alt={doctor.name}
        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0', flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>{doctor.name || 'Unknown Doctor'}</p>
        <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
          {request.fromHospitalId?.name ? `${request.fromHospitalId.name} → ` : ''}{request.hospitalId?.name || 'Unknown hospital'}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#1D4ED8', background: '#EFF6FF', padding: '5px 12px', borderRadius: 99, textTransform: 'capitalize', flexShrink: 0 }}>
        <TypeIcon size={13} /> {request.type}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'capitalize', flexShrink: 0 }}>via {request.requestedBy}</span>
      <span style={{ fontSize: 11.5, color: '#94A3B8', flexShrink: 0 }}>{new Date(request.createdAt).toLocaleDateString()}</span>

      {request.status === 'pending' ? (
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={onReject}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 99, border: '1.5px solid #FCA5A5', background: '#FFFFFF', color: '#DC2626', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            <X size={13} /> Reject
          </button>
          <button
            onClick={onApprove}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 99, border: 'none', background: 'linear-gradient(135deg, #2563EB, #14B8A6)', color: '#FFFFFF', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
          >
            <Check size={13} /> Approve
          </button>
        </div>
      ) : (
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: 'capitalize', flexShrink: 0,
          color: request.status === 'approved' ? '#16A34A' : request.status === 'rejected' ? '#DC2626' : '#64748B',
          background: request.status === 'approved' ? '#F0FDF4' : request.status === 'rejected' ? '#FEF2F2' : '#F8FAFC',
          border: `1px solid ${request.status === 'approved' ? '#BBF7D0' : request.status === 'rejected' ? '#FECACA' : '#E2E8F0'}`,
          padding: '4px 12px', borderRadius: 99,
        }}>
          {request.status}
        </span>
      )}
    </div>
  )
}

export default DoctorRequests
