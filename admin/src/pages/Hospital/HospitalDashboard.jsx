import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HospitalContext } from '../../context/HospitalContext'
import {
  Stethoscope,
  Building2,
  CalendarDays,
  CalendarClock,
  Star,
  MessageSquare,
  BedDouble,
  Users,
  ShieldCheck,
  MapPin,
  Clock,
  UserPlus,
  Images,
  UserCog
} from 'lucide-react'
import StatCard from '../../components/StatCard'
import QuickAction from '../../components/QuickAction'

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
    <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
  </div>
)

const HospitalDashboard = () => {
  const { hToken, hospitalProfile, dashData, getDashData } = useContext(HospitalContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (hToken) getDashData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  if (!hospitalProfile || !dashData) return <PageLoader />

  const stats = [
    { icon: Stethoscope, label: 'Doctors', value: dashData.doctors, accent: { bg: '#EFF6FF', color: '#2563EB' } },
    { icon: Building2, label: 'Departments', value: dashData.departments, accent: { bg: '#F0FDFA', color: '#14B8A6' } },
    { icon: CalendarClock, label: "Today's Appointments", value: dashData.todaysAppointments, accent: { bg: '#FFFBEB', color: '#D97706' } },
    { icon: CalendarDays, label: 'Upcoming Appointments', value: dashData.upcomingAppointments, accent: { bg: '#EFF6FF', color: '#2563EB' } },
    { icon: Star, label: 'Average Rating', value: dashData.totalReviews > 0 ? dashData.averageRating.toFixed(1) : 'New', accent: { bg: '#FFFBEB', color: '#D97706' } },
    { icon: MessageSquare, label: 'Reviews', value: dashData.totalReviews, accent: { bg: '#F0FDF4', color: '#22C55E' } },
    { icon: BedDouble, label: 'Beds', value: dashData.beds, accent: { bg: '#F0FDFA', color: '#14B8A6' } },
    { icon: Users, label: 'Patients Served', value: dashData.patientsServed, accent: { bg: '#F0FDF4', color: '#22C55E' } },
  ]

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '32px 24px 48px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        {/* ══════════ HERO ══════════ */}
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 28,
          marginBottom: 28, boxShadow: '0 24px 60px rgba(15,23,42,0.28)',
          background: hospitalProfile.banner
            ? `linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,58,138,0.75) 45%, rgba(37,99,235,0.7) 75%, rgba(20,184,166,0.75) 100%), url(${hospitalProfile.banner}) center/cover`
            : 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 75%, #14B8A6 100%)',
          padding: '36px 32px'
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(20,184,166,0.20) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(37,99,235,0.20) 0%, transparent 50%)
            `
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <img
                src={hospitalProfile.logo || hospitalProfile.image}
                alt={hospitalProfile.name}
                style={{ width: 88, height: 88, borderRadius: 20, objectFit: 'cover', border: '4px solid rgba(255,255,255,0.85)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', flexShrink: 0, background: '#fff' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>{hospitalProfile.name}</h1>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)', color: '#E2F8F5', fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 99 }}>
                    {hospitalProfile.hospitalType}
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: hospitalProfile.active ? 'rgba(34,197,94,0.18)' : 'rgba(148,163,184,0.18)',
                    border: `1px solid ${hospitalProfile.active ? 'rgba(94,234,212,0.4)' : 'rgba(255,255,255,0.25)'}`,
                    color: hospitalProfile.active ? '#5EEAD4' : '#CBD5E1',
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em'
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: hospitalProfile.active ? '#5EEAD4' : '#94A3B8', display: 'inline-block', marginRight: 4 }} />
                    {hospitalProfile.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={14} color={i <= Math.round(hospitalProfile.averageRating) ? '#FBBF24' : 'rgba(255,255,255,0.3)'} fill={i <= Math.round(hospitalProfile.averageRating) ? '#FBBF24' : 'none'} />
                    ))}
                  </div>
                  <span style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 700 }}>
                    {hospitalProfile.totalReviews > 0 ? hospitalProfile.averageRating.toFixed(1) : 'New'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12.5 }}>
                    ({hospitalProfile.totalReviews || 0} review{hospitalProfile.totalReviews === 1 ? '' : 's'})
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, color: 'rgba(255,255,255,0.78)', fontSize: 12.5 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {hospitalProfile.address?.city}, {hospitalProfile.address?.state}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} /> {hospitalProfile.openingHours}</span>
                  {hospitalProfile.emergency && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><ShieldCheck size={13} /> Emergency Available</span>}
                  {hospitalProfile.insuranceAccepted && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><ShieldCheck size={13} /> Insurance Accepted</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ STATISTICS ══════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 18, marginBottom: 28 }}>
          {stats.map((s) => (
            <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} accent={s.accent} />
          ))}
        </div>

        {/* ══════════ QUICK ACTIONS ══════════ */}
        <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', padding: 22 }}>
          <p style={{ fontWeight: 700, color: '#0F172A', fontSize: 15, margin: '0 0 16px' }}>Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            <QuickAction icon={UserPlus} label="Add Doctor" description="Register a new doctor" onClick={() => navigate('/hospital-add-doctor')} />
            <QuickAction icon={Stethoscope} label="Manage Doctors" description="View & edit your doctors" onClick={() => navigate('/hospital-my-doctors')} />
            <QuickAction icon={Images} label="Gallery" description="Update banner, logo & photos" onClick={() => navigate('/hospital-gallery')} />
            <QuickAction icon={UserCog} label="Hospital Profile" description="Edit hospital information" onClick={() => navigate('/hospital-profile')} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default HospitalDashboard
