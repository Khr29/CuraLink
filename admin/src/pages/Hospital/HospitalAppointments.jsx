import React, { useContext, useEffect, useState, useMemo } from 'react'
import { HospitalContext } from '../../context/HospitalContext'
import { AppContext } from '../../context/AppContext'
import { CalendarDays, Clock, Wallet, Search, CheckCircle2, Ban, Stethoscope } from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import { SkeletonRow } from '../../components/Skeleton'

const selectStyle = {
  height: 40, background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12,
  padding: '0 12px', fontSize: 13, color: '#0F172A', outline: 'none',
  fontFamily: 'Inter, sans-serif', cursor: 'pointer'
}

const cols = '48px 1.6fr 1.2fr 1.4fr 90px 130px'

const HospitalAppointments = () => {
  const { hToken, appointments, getHospitalAppointments } = useContext(HospitalContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (hToken) getHospitalAppointments().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return [...appointments].reverse().filter((a) => {
      if (statusFilter === 'completed' && !a.isCompleted) return false
      if (statusFilter === 'cancelled' && !a.cancelled) return false
      if (statusFilter === 'upcoming' && (a.cancelled || a.isCompleted)) return false
      if (query) {
        const haystack = `${a.userData?.name || ''} ${a.docData?.name || ''} ${a.docData?.speciality || ''}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [appointments, search, statusFilter])

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero
          icon={CalendarDays}
          title="Appointments"
          description="All appointments across your hospital's doctors."
          action={
            <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', padding: '10px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14B8A6' }} />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>
                Total: {appointments.length}
              </span>
            </div>
          }
        />

        {/* TOOLBAR */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16,
          padding: 14, marginBottom: 20, boxShadow: '0 4px 12px rgba(15,23,42,0.03)'
        }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient or doctor..."
              style={{ ...selectStyle, width: '100%', paddingLeft: 36, cursor: 'text' }}
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: cols, gap: 16,
            padding: '16px 24px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
            fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            <span>#</span>
            <span>Patient</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Stethoscope size={14} /> Doctor / Department</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> Date & Time</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Wallet size={14} /> Fees</span>
            <span>Status</span>
          </div>

          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length > 0 ? (
              filtered.map((item, index) => <AppointmentRow key={item._id} item={item} index={index} calculateAge={calculateAge} slotDateFormat={slotDateFormat} currency={currency} />)
            ) : (
              <EmptyState icon={CalendarDays} title="No Appointments Found" subtitle="Appointments booked with your doctors will appear here." />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const AppointmentRow = ({ item, index, calculateAge, slotDateFormat, currency }) => {
  const [hovered, setHovered] = useState(false)
  const patient = item.userData || {}
  const doctor = item.docData || {}

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: cols, alignItems: 'center', gap: 16,
        padding: '14px 24px', borderBottom: '1px solid #F1F5F9',
        background: hovered ? '#F8FAFC' : '#FFFFFF', transition: 'background 0.2s ease'
      }}
    >
      <span style={{ color: '#94A3B8', fontWeight: 600, fontSize: 13 }}>{(index + 1).toString().padStart(2, '0')}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={patient.image} alt={patient.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }} />
        <div>
          <p style={{ fontWeight: 700, color: '#0F172A', margin: 0, fontSize: 13.5 }}>{patient.name}</p>
          <p style={{ color: '#64748B', fontSize: 11.5, marginTop: 1 }}>{calculateAge(patient)} yrs</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={doctor.image} alt={doctor.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', background: '#EFF6FF', border: '2px solid #E2E8F0' }} />
        <div>
          <p style={{ fontWeight: 700, color: '#0F172A', margin: 0, fontSize: 13.5 }}>{doctor.name}</p>
          <p style={{ color: '#64748B', fontSize: 11.5, marginTop: 1 }}>{doctor.speciality}</p>
        </div>
      </div>

      <div>
        <p style={{ color: '#0F172A', fontWeight: 600, fontSize: 13, margin: 0 }}>{slotDateFormat(item.slotDate)}</p>
        <p style={{ color: '#2563EB', fontWeight: 500, fontSize: 12, marginTop: 2 }}>{item.slotTime}</p>
      </div>

      <span style={{ fontWeight: 800, color: '#14B8A6', fontSize: 14 }}>{currency}{item.amount}</span>

      <div>
        {item.cancelled ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '5px 10px', borderRadius: 99 }}>
            <Ban size={13} /> Cancelled
          </div>
        ) : item.isCompleted ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#10B981', background: '#ECFDF5', border: '1px solid #D1FAE5', padding: '5px 10px', borderRadius: 99 }}>
            <CheckCircle2 size={13} /> Completed
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', padding: '5px 10px', borderRadius: 99 }}>
            <Clock size={13} /> Upcoming
          </div>
        )}
      </div>
    </div>
  )
}

export default HospitalAppointments
