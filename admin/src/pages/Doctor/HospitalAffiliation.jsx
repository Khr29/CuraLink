import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import { SectionCard, inputStyle, focusTeal, blurDefault, RequestBadge } from '../../components/ProfileUI'
import {
  Building2, Mail, Ban, Send, History, ArrowRightLeft
} from 'lucide-react'

// Standalone "Hospital Affiliation" page, promoted out of the bottom of
// DoctorProfile into its own sidebar destination. Same context/handlers as
// before (requestHospital, leaveHospital, cancelHospitalRequest, respondToInvite) -
// only the navigation location changed, not the functionality.
const HospitalAffiliation = () => {
  const {
    dToken, profileData, getProfileData,
    hospitals, getHospitalOptions, hospitalRequests, getMyHospitalRequests,
    requestHospital, leaveHospital, cancelHospitalRequest, respondToInvite,
  } = useContext(DoctorContext)

  const [selectedHospitalId, setSelectedHospitalId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmingLeave, setConfirmingLeave] = useState(false)
  const [respondingToInvite, setRespondingToInvite] = useState(false)
  const [cancellingRequest, setCancellingRequest] = useState(false)

  useEffect(() => {
    if (dToken) {
      getProfileData()
      getHospitalOptions()
      getMyHospitalRequests()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken])

  if (!profileData) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
        <style>{'@keyframes curalink-spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    )
  }

  const pendingInvite = hospitalRequests.find(r => r.status === 'pending' && r.type === 'invite')
  const pendingOwnRequest = hospitalRequests.find(r => r.status === 'pending' && r.type !== 'invite')
  const history = hospitalRequests.filter(r => r.status !== 'pending')

  const isIndependent = !profileData.hospitalId
  const availableHospitals = hospitals.filter(h => h._id !== profileData.hospitalId)

  const handleSend = async () => {
    if (!selectedHospitalId) return
    setSubmitting(true)
    await requestHospital(selectedHospitalId)
    setSubmitting(false)
    setSelectedHospitalId('')
  }

  const handleLeave = async () => {
    setSubmitting(true)
    await leaveHospital()
    setSubmitting(false)
    setConfirmingLeave(false)
  }

  const handleRespondToInvite = async (accept) => {
    setRespondingToInvite(true)
    try {
      await respondToInvite(pendingInvite._id, accept)
    } finally {
      setRespondingToInvite(false)
    }
  }

  const handleCancelRequest = async () => {
    setCancellingRequest(true)
    try {
      await cancelHospitalRequest(pendingOwnRequest._id)
    } finally {
      setCancellingRequest(false)
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <PageHero
        icon={Building2}
        title="Hospital Affiliation"
        description={isIndependent
          ? "You're currently practicing independently. Send a request to join a hospital below."
          : "Manage your current hospital affiliation, transfer requests, and history."}
      />

      <SectionCard title="Affiliation Status" icon={ArrowRightLeft}>
        {pendingInvite && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            background: 'linear-gradient(135deg, #EFF6FF, #F0FDFA)', border: '1px solid #BFDBFE',
            borderRadius: 16, padding: '16px 18px', marginBottom: 18,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={17} color="#2563EB" />
              </div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {pendingInvite.hospitalId?.name || 'A hospital'} invited you to join
                </p>
                <p style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Accept to switch your affiliation immediately.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleRespondToInvite(false)}
                disabled={respondingToInvite}
                style={{ padding: '9px 18px', borderRadius: 99, border: '1.5px solid #E2E8F0', background: '#FFFFFF', color: '#475569', fontSize: 12.5, fontWeight: 700, cursor: respondingToInvite ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: respondingToInvite ? 0.6 : 1 }}
              >
                Decline
              </button>
              <button
                onClick={() => handleRespondToInvite(true)}
                disabled={respondingToInvite}
                style={{ padding: '9px 18px', borderRadius: 99, border: 'none', background: 'linear-gradient(135deg, #2563EB, #14B8A6)', color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, cursor: respondingToInvite ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: respondingToInvite ? 0.7 : 1 }}
              >
                {respondingToInvite ? 'Please wait…' : 'Accept'}
              </button>
            </div>
          </div>
        )}

        {pendingOwnRequest ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: '16px 18px', marginBottom: 18,
          }}>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: 0, textTransform: 'capitalize' }}>
                {pendingOwnRequest.type} request to {pendingOwnRequest.hospitalId?.name || 'hospital'} pending
              </p>
              <p style={{ fontSize: 11.5, color: '#92400E', marginTop: 2 }}>Waiting for the hospital to respond.</p>
            </div>
            <button
              onClick={handleCancelRequest}
              disabled={cancellingRequest}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 99, border: '1.5px solid #FCA5A5', background: '#FFFFFF', color: '#DC2626', fontSize: 12.5, fontWeight: 700, cursor: cancellingRequest ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: cancellingRequest ? 0.6 : 1 }}
            >
              <Ban size={14} /> {cancellingRequest ? 'Cancelling…' : 'Cancel Request'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12, marginBottom: 18 }}>
            <div style={{ flex: '1 1 240px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
                {isIndependent ? 'Join a Hospital' : 'Transfer to Another Hospital'}
              </p>
              <select
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                style={inputStyle}
                onFocus={focusTeal} onBlur={blurDefault}
              >
                <option value="">Select a hospital…</option>
                {availableHospitals.map(h => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSend}
              disabled={submitting || !selectedHospitalId}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #2563EB, #14B8A6)', color: '#FFFFFF', fontSize: 13, fontWeight: 700,
                cursor: (submitting || !selectedHospitalId) ? 'not-allowed' : 'pointer', opacity: (submitting || !selectedHospitalId) ? 0.6 : 1,
                fontFamily: 'Inter, sans-serif', height: 48,
              }}
            >
              <Send size={14} /> {isIndependent ? 'Send Request' : 'Request Transfer'}
            </button>

            {!isIndependent && (
              confirmingLeave ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#64748B' }}>Leave your current hospital?</span>
                  <button
                    onClick={handleLeave}
                    disabled={submitting}
                    style={{ padding: '10px 16px', borderRadius: 12, border: 'none', background: '#DC2626', color: '#FFFFFF', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', height: 48, fontFamily: 'Inter, sans-serif' }}
                  >
                    Confirm Leave
                  </button>
                  <button
                    onClick={() => setConfirmingLeave(false)}
                    style={{ padding: '10px 16px', borderRadius: 12, border: '1.5px solid #E2E8F0', background: '#FFFFFF', color: '#475569', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', height: 48, fontFamily: 'Inter, sans-serif' }}
                  >
                    Never mind
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingLeave(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, border: '1.5px solid #FCA5A5', background: '#FFFFFF', color: '#DC2626', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', height: 48 }}
                >
                  <Ban size={14} /> Leave Hospital
                </button>
              )
            )}
          </div>
        )}

        {history.length > 0 ? (
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <History size={12} /> Request History
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map(r => (
                <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: '#475569', padding: '8px 0', borderBottom: '1px solid #F8FAFC' }}>
                  <span style={{ textTransform: 'capitalize' }}>{r.type} — {r.hospitalId?.name || 'Unknown hospital'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#94A3B8', fontSize: 11 }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                    <RequestBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !pendingInvite && !pendingOwnRequest && isIndependent && (
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 4 }}>
            <EmptyState icon={History} title="No affiliation history yet" subtitle="Requests and transfers you make will be tracked here." compact />
          </div>
        )}
      </SectionCard>
    </div>
  )
}

export default HospitalAffiliation
