import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HospitalContext } from '../../context/HospitalContext'
import { Stethoscope, Search, Star, CheckCircle2, XCircle, Pencil, Trash2, Eye, UserPlus } from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'

const selectStyle = {
  height: 40, background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12,
  padding: '0 12px', fontSize: 13, color: '#0F172A', outline: 'none',
  fontFamily: 'Inter, sans-serif', cursor: 'pointer'
}

const HospitalDoctors = () => {
  const { hToken, doctors, getHospitalDoctors, deleteHospitalDoctor, toggleDoctorAvailability } = useContext(HospitalContext)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialityFilter, setSpecialityFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    if (hToken) getHospitalDoctors().finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  const specialities = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.speciality).filter(Boolean))),
    [doctors]
  )

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase()
    return doctors.filter((d) => {
      if (specialityFilter !== 'all' && d.speciality !== specialityFilter) return false
      if (availabilityFilter === 'available' && !d.available) return false
      if (availabilityFilter === 'unavailable' && d.available) return false
      if (query && !d.name.toLowerCase().includes(query)) return false
      return true
    })
  }, [doctors, search, specialityFilter, availabilityFilter])

  const handleDelete = useCallback((doctorId, name) => {
    if (window.confirm(`Remove Dr. ${name} from your hospital? This cannot be undone.`)) {
      deleteHospitalDoctor(doctorId)
    }
  }, [deleteHospitalDoctor])

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero
          icon={Stethoscope}
          title="Doctors"
          description="Manage the doctors registered under your hospital."
          action={
            <button
              onClick={() => navigate('/hospital-add-doctor')}
              className="shine"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.95)', color: '#0F172A', border: 'none',
                borderRadius: 12, padding: '11px 20px', fontSize: 13.5, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', fontFamily: 'Inter, sans-serif'
              }}
            >
              <UserPlus size={15} /> Add Doctor
            </button>
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
              placeholder="Search doctors by name..."
              style={{ ...selectStyle, width: '100%', paddingLeft: 36, cursor: 'text' }}
            />
          </div>
          <select value={specialityFilter} onChange={(e) => setSpecialityFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Specialities</option>
            {specialities.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 24 }}>
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onEdit={() => navigate(`/hospital-edit-doctor/${doctor._id}`)}
                onDelete={() => handleDelete(doctor._id, doctor.name)}
                onToggleAvailability={() => toggleDoctorAvailability(doctor._id, !doctor.available)}
              />
            ))}
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
            <EmptyState
              icon={Stethoscope}
              title={doctors.length > 0 ? 'No Matching Doctors' : 'No Doctors Yet'}
              subtitle={doctors.length > 0 ? 'Try adjusting your search or filters.' : 'Add your first doctor to get started.'}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const DoctorCard = ({ doctor, onEdit, onDelete, onToggleAvailability }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, overflow: 'hidden',
        boxShadow: hovered ? '0 12px 32px rgba(15,23,42,0.08)' : '0 8px 24px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column'
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: 190, background: 'linear-gradient(135deg, #EFF6FF, #E0F2FE)', overflow: 'hidden' }}>
        <img
          src={doctor.image}
          alt={doctor.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.5s ease' }}
        />
        <div style={{
          position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
          padding: '5px 12px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 6,
          border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <Stethoscope size={13} color="#2563EB" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>{doctor.speciality}</span>
        </div>
      </div>

      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>{doctor.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <Star size={13} color="#FBBF24" fill="#FBBF24" />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
              {doctor.totalReviews > 0 ? doctor.averageRating.toFixed(1) : 'New'}
            </span>
            {doctor.totalReviews > 0 && <span style={{ fontSize: 11.5, color: '#94A3B8' }}>({doctor.totalReviews})</span>}
          </div>
        </div>

        <div style={{
          marginTop: 16, padding: '10px 12px', borderRadius: 14,
          background: doctor.available ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${doctor.available ? '#DCFCE7' : '#FEE2E2'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {doctor.available ? <CheckCircle2 size={14} color="#16A34A" /> : <XCircle size={14} color="#DC2626" />}
            <span style={{ fontSize: 12, fontWeight: 700, color: doctor.available ? '#15803D' : '#B91C1C' }}>
              {doctor.available ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: 38, height: 21, cursor: 'pointer' }}>
            <input type="checkbox" checked={doctor.available} onChange={onToggleAvailability} style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{ position: 'absolute', inset: 0, backgroundColor: doctor.available ? '#16A34A' : '#CBD5E1', borderRadius: 99, transition: '0.25s ease' }}>
              <span style={{ position: 'absolute', height: 15, width: 15, left: doctor.available ? 20 : 3, bottom: 3, backgroundColor: '#FFFFFF', borderRadius: '50%', transition: '0.25s ease' }} />
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={onEdit} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#EFF6FF', border: 'none', borderRadius: 10, padding: '8px 0', fontSize: 12.5, fontWeight: 700, color: '#2563EB', cursor: 'pointer' }}>
            <Pencil size={13} /> Edit
          </button>
          <a href={`${import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'}/appointment/${doctor._id}`} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#F0FDFA', border: 'none', borderRadius: 10, padding: '8px 0', fontSize: 12.5, fontWeight: 700, color: '#0D9488', cursor: 'pointer', textDecoration: 'none' }}>
            <Eye size={13} /> View
          </a>
          <button onClick={onDelete} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEF2F2', border: 'none', borderRadius: 10, padding: '8px 12px', cursor: 'pointer' }}>
            <Trash2 size={13} color="#EF4444" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default HospitalDoctors
