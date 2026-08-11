import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import {
  CalendarDays,
  Users,
  Star,
  IndianRupee,
  Award,
  MessageSquare,
  ShieldCheck,
  UserCog,
  CalendarClock,
  ToggleRight,
  Building2,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react'
import StatCard from '../../components/StatCard'
import EmptyState from '../../components/EmptyState'
import RatingDistribution from '../../components/RatingDistribution'
import QuickAction from '../../components/QuickAction'
import { formatExperience } from '../../utils/experience'

// ─── Shared visual primitives (mirrors the language already used across
// Dashboard.jsx / HospitalsList.jsx / DoctorReviews.jsx: white rounded-24
// cards, #E2E8F0 borders, blue→teal gradient icon badges, soft lift on
// hover) so this page reads as part of the same system, not a new one. ───

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
    <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
  </div>
)

const StarRow = ({ rating, size = 13 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size} color={i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0'} fill={i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0'} />
    ))}
  </div>
)

const DoctorDashboard = () => {
  const {
    dashData, getDashData, dToken,
    profileData, getProfileData, setProfileData,
    appointments, getAllAppointments,
    cancelAppointment, completeAppointment,
    backendUrl
  } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const navigate = useNavigate()

  const [hospital, setHospital] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState(null)
  const [togglingAvailability, setTogglingAvailability] = useState(false)

  useEffect(() => {
    if (dToken) {
      getDashData()
      getProfileData()
      getAllAppointments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken])

  useEffect(() => {
    const fetchHospital = async () => {
      if (!profileData?.hospitalId) return
      try {
        const { data } = await axios.get(`${backendUrl}/api/hospital/${profileData.hospitalId}`)
        if (data.success) setHospital(data.hospital)
      } catch (error) {
        console.error(error)
      }
    }
    fetchHospital()
  }, [profileData?.hospitalId, backendUrl])

  useEffect(() => {
    const fetchReviews = async () => {
      if (!profileData?._id) return
      try {
        const { data } = await axios.get(`${backendUrl}/api/review/doctor/${profileData._id}`, { params: { limit: 3 } })
        if (data.success) {
          setReviews(data.reviews)
          setReviewStats({ total: data.total, distribution: data.distribution })
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchReviews()
  }, [profileData?._id, backendUrl])

  const todayKey = useMemo(() => {
    const d = new Date()
    return `${d.getDate()}_${d.getMonth() + 1}_${d.getFullYear()}`
  }, [])

  const todaysAppointments = useMemo(
    () => appointments.filter(a => a.slotDate === todayKey && !a.cancelled),
    [appointments, todayKey]
  )

  const toggleAvailability = useCallback(async () => {
    if (!profileData) return
    setTogglingAvailability(true)
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        { fees: profileData.fees, address: profileData.address, available: !profileData.available },
        { headers: { dToken } }
      )
      if (data.success) {
        setProfileData(prev => ({ ...prev, available: !prev.available }))
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setTogglingAvailability(false)
    }
  }, [profileData, backendUrl, dToken, setProfileData])

  if (!dashData || !profileData) return <PageLoader />

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '32px 24px 48px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        {/* ══════════ HERO WELCOME CARD ══════════ */}
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 28,
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 75%, #14B8A6 100%)',
          padding: '36px 32px', marginBottom: 28,
          boxShadow: '0 24px 60px rgba(15,23,42,0.28)'
        }}>
          {/* mesh overlay, matches Homepage hero */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(20,184,166,0.20) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(37,99,235,0.20) 0%, transparent 50%)
            `
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <img
                src={profileData.image}
                alt={profileData.name}
                style={{
                  width: 88, height: 88, borderRadius: '50%', objectFit: 'cover',
                  border: '4px solid rgba(255,255,255,0.85)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', flexShrink: 0
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
                    Welcome back, {profileData.name}
                  </h1>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: profileData.available ? 'rgba(34,197,94,0.18)' : 'rgba(148,163,184,0.18)',
                    border: `1px solid ${profileData.available ? 'rgba(94,234,212,0.4)' : 'rgba(255,255,255,0.25)'}`,
                    color: profileData.available ? '#5EEAD4' : '#CBD5E1',
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em'
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: profileData.available ? '#5EEAD4' : '#94A3B8' }} />
                    {profileData.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, margin: '0 0 10px' }}>
                  {hospital ? hospital.name : 'Loading hospital…'} · {profileData.speciality}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRow rating={profileData.averageRating} size={14} />
                  <span style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 700 }}>
                    {profileData.totalReviews > 0 ? profileData.averageRating.toFixed(1) : 'New'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12.5 }}>
                    ({profileData.totalReviews || 0} review{profileData.totalReviews === 1 ? '' : 's'})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ STATISTICS ══════════ */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 18, marginBottom: 28
        }}>
          <StatCard icon={CalendarDays} label="Appointments" value={dashData.appointments} accent={{ bg: '#EFF6FF', color: '#2563EB' }} />
          <StatCard icon={Users} label="Patients" value={dashData.patients} accent={{ bg: '#F0FDFA', color: '#14B8A6' }} />
          <StatCard icon={MessageSquare} label="Reviews" value={profileData.totalReviews || 0} accent={{ bg: '#F0FDF4', color: '#22C55E' }} />
          <StatCard icon={Star} label="Average Rating" value={profileData.totalReviews > 0 ? profileData.averageRating.toFixed(1) : 'New'} accent={{ bg: '#FFFBEB', color: '#D97706' }} />
          <StatCard icon={IndianRupee} label="Consultation Fee" value={`${currency}${profileData.fees}`} accent={{ bg: '#EFF6FF', color: '#2563EB' }} />
          <StatCard icon={Award} label="Years Experience" value={formatExperience(profileData.experience)} accent={{ bg: '#F0FDFA', color: '#14B8A6' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, marginBottom: 28 }} className="curalink-dash-grid">
          {/* ══════════ TODAY'S APPOINTMENTS ══════════ */}
          <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CalendarClock size={17} color="#2563EB" />
                <p style={{ fontWeight: 700, color: '#0F172A', fontSize: 15, margin: 0 }}>Today's Appointments</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '4px 12px', borderRadius: 99 }}>
                {todaysAppointments.length} scheduled
              </span>
            </div>

            {todaysAppointments.length === 0 ? (
              <EmptyState compact icon={CalendarClock} title="No appointments today" subtitle="Enjoy the calm — new bookings will show up here." />
            ) : (
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                {todaysAppointments.map((item) => (
                  <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderBottom: '1px solid #F8FAFC' }}>
                    <img src={item.userData?.image} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: '#0F172A', fontSize: 13.5, margin: 0 }}>{item.userData?.name}</p>
                      <p style={{ color: '#94A3B8', fontSize: 11.5, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> {item.slotTime}
                      </p>
                    </div>
                    {item.isCompleted ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '4px 10px', borderRadius: 99 }}>Completed</span>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => cancelAppointment(item._id)} title="Cancel" style={{ background: '#FEE2E2', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <XCircle size={14} color="#EF4444" />
                        </button>
                        <button onClick={() => completeAppointment(item._id)} title="Mark complete" style={{ background: '#DCFCE7', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <CheckCircle2 size={14} color="#16A34A" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══════════ QUICK ACTIONS ══════════ */}
          <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Sparkles size={17} color="#14B8A6" />
              <p style={{ fontWeight: 700, color: '#0F172A', fontSize: 15, margin: 0 }}>Quick Actions</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <QuickAction icon={UserCog} label="Manage Profile" description="Edit your professional details" onClick={() => navigate('/doctor-profile')} />
              <QuickAction icon={CalendarDays} label="Appointments" description="View & manage your bookings" onClick={() => navigate('/doctor-appointments')} />
              <QuickAction
                icon={ToggleRight}
                label={togglingAvailability ? 'Updating…' : profileData.available ? 'Set Unavailable' : 'Set Available'}
                description="Toggle your booking availability"
                onClick={toggleAvailability}
              />
              <QuickAction icon={Building2} label="Hospital" description={hospital ? hospital.name : 'View hospital details'} onClick={() => navigate('/doctor-profile')} />
            </div>
          </div>
        </div>

        {/* ══════════ RECENT REVIEWS ══════════ */}
        <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={17} color="#22C55E" />
              <p style={{ fontWeight: 700, color: '#0F172A', fontSize: 15, margin: 0 }}>Recent Reviews</p>
            </div>
            <button
              onClick={() => navigate('/doctor-profile')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#2563EB', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              View All Reviews <ArrowRight size={13} />
            </button>
          </div>

          {reviewStats && reviewStats.total > 0 && (
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9' }}>
              <RatingDistribution
                distribution={reviewStats.distribution}
                total={reviewStats.total}
                averageRating={profileData.averageRating}
              />
            </div>
          )}

          {reviews.length === 0 ? (
            <EmptyState compact icon={MessageSquare} title="No reviews yet" subtitle="Reviews from your patients will appear here once submitted." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 1, background: '#F1F5F9' }}>
              {reviews.map((review) => (
                <div key={review._id} style={{ background: '#FFFFFF', padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {review.userId?.image ? (
                        <img src={review.userId.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#2563EB' }}>{review.userId?.name?.[0]?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{review.userId?.name || 'Patient'}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <StarRow rating={review.rating} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '8px 0 3px' }}>{review.title}</p>
                  <p style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .curalink-dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

export default DoctorDashboard
