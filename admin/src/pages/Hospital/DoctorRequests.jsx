import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { HospitalContext } from '../../context/HospitalContext'
import { UserCheck, Search, Send, Check, X, Clock, Mail, ArrowRightLeft, LogIn } from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import { SkeletonRow } from '../../components/Skeleton'
import ConfirmDialog from '../../components/ConfirmDialog'

const STATUS_TABS = ['pending', 'approved', 'rejected', 'cancelled']

const TYPE_ICON = { join: LogIn, transfer: ArrowRightLeft, invite: Mail }

const DoctorRequests = () => {
  const {
    hToken, doctorRequests, getDoctorRequests, approveDoctorRequest, rejectDoctorRequest,
    allDoctors, getAllDoctorsForInvite, inviteDoctor, hospitalProfile,
  } = useContext(HospitalContext)

  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  useEffect(() => {
    if (hToken) getDoctorRequests().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  const filteredRequests = useMemo(
    () => doctorRequests.filter((r) => r.status === statusFilter),
    [doctorRequests, statusFilter]
  )

  const handleApprove = useCallback((id) => {
    approveDoctorRequest(id)
  }, [approveDoctorRequest])

  const handleConfirmReject = useCallback(async () => {
    if (!rejectTarget) return
    await rejectDoctorRequest(rejectTarget._id)
    setRejectTarget(null)
  }, [rejectTarget, rejectDoctorRequest])

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero
          icon={UserCheck}
          title="Doctor Requests"
          description="Approve join/transfer requests, and invite independent doctors to your hospital."
          action={
            <button
              onClick={() => { setInviteModalOpen(true); getAllDoctorsForInvite() }}
              className="shine"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.95)', color: '#0F172A', border: 'none',
                borderRadius: 12, padding: '11px 20px', fontSize: 13.5, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', fontFamily: 'Inter, sans-serif'
              }}
            >
              <Send size={15} /> Invite Doctor
            </button>
          }
        />

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

        {/* LIST */}
        <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <RequestRow
                key={request._id}
                request={request}
                onApprove={() => handleApprove(request._id)}
                onReject={() => setRejectTarget(request)}
              />
            ))
          ) : (
            <EmptyState
              icon={UserCheck}
              title={`No ${statusFilter} requests`}
              subtitle="Requests from doctors wanting to join or transfer will show up here."
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject this request?"
        message={rejectTarget ? `${rejectTarget.doctorId?.name || 'This doctor'}'s ${rejectTarget.type} request will be rejected.` : ''}
        confirmLabel="Reject Request"
        onConfirm={handleConfirmReject}
        onClose={() => setRejectTarget(null)}
      />

      {inviteModalOpen && (
        <InviteDoctorModal
          allDoctors={allDoctors}
          hospitalId={hospitalProfile?._id}
          onInvite={inviteDoctor}
          onClose={() => setInviteModalOpen(false)}
        />
      )}
    </div>
  )
}

const RequestRow = ({ request, onApprove, onReject }) => {
  const [hovered, setHovered] = useState(false)
  const doctor = request.doctorId || {}
  const TypeIcon = TYPE_ICON[request.type] || Clock
  const isHospitalInitiated = request.requestedBy === 'hospital'

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
        <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{doctor.speciality}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#1D4ED8', background: '#EFF6FF', padding: '5px 12px', borderRadius: 99, textTransform: 'capitalize', flexShrink: 0 }}>
        <TypeIcon size={13} /> {request.type}
      </div>
      {request.fromHospitalId?.name && (
        <span style={{ fontSize: 11.5, color: '#94A3B8', flexShrink: 0 }}>from {request.fromHospitalId.name}</span>
      )}
      <span style={{ fontSize: 11.5, color: '#94A3B8', flexShrink: 0 }}>{new Date(request.createdAt).toLocaleDateString()}</span>

      {request.status === 'pending' ? (
        isHospitalInitiated ? (
          <span style={{ fontSize: 11.5, color: '#D97706', fontWeight: 600, flexShrink: 0 }}>Awaiting doctor response</span>
        ) : (
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
        )
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

const InviteDoctorModal = ({ allDoctors, hospitalId, onInvite, onClose }) => {
  const [search, setSearch] = useState('')
  const [inviting, setInviting] = useState(null)

  const eligible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allDoctors
      .filter((d) => d.hospitalId?._id !== hospitalId && d.hospitalId !== hospitalId)
      .filter((d) => !q || d.name.toLowerCase().includes(q) || d.speciality?.toLowerCase().includes(q))
      .slice(0, 20)
  }, [allDoctors, search, hospitalId])

  const handleInvite = async (doctorId) => {
    setInviting(doctorId)
    await onInvite(doctorId)
    setInviting(null)
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 24px 60px rgba(15,23,42,0.28)', width: '100%', maxWidth: 480, padding: 28, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>Invite a Doctor</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color="#64748B" />
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or speciality…"
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {eligible.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, padding: '20px 0' }}>No matching doctors found.</p>
          ) : eligible.map((doctor) => (
            <div key={doctor._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, border: '1px solid #F1F5F9' }}>
              <img src={doctor.image} alt={doctor.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{doctor.name}</p>
                <p style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>{doctor.speciality}</p>
              </div>
              <button
                onClick={() => handleInvite(doctor._id)}
                disabled={inviting === doctor._id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, border: 'none',
                  background: '#EFF6FF', color: '#2563EB', fontSize: 12, fontWeight: 700,
                  cursor: inviting === doctor._id ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0,
                }}
              >
                <Send size={12} /> {inviting === doctor._id ? 'Sending…' : 'Invite'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DoctorRequests
