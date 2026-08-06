import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { HospitalContext } from '../../context/HospitalContext'
import { Users, Search, Mail, CalendarDays, Stethoscope, ArrowRight } from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'

const HospitalPatients = () => {
  const { hToken, patients, getHospitalPatients } = useContext(HospitalContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (hToken) {
      getHospitalPatients().finally(() => setLoading(false))
    }
  }, [hToken, getHospitalPatients])

  const filteredPatients = useMemo(() => {
    let list = patients || []
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((p) => p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => (b.appointmentCount || 0) - (a.appointmentCount || 0))
  }, [patients, search])

  const goToPatient = useCallback((id) => navigate(`/hospital-patients/${id}`), [navigate])

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero
          icon={Users}
          title="Patients"
          description="Every patient who has booked an appointment at your hospital."
          action={
            <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', padding: '10px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14B8A6' }} />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>Total Patients: {patients?.length || 0}</span>
            </div>
          }
        />

        <div style={{ marginBottom: 24, position: 'relative', maxWidth: 360 }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#FFFFFF', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredPatients.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {filteredPatients.map((patient) => (
              <PatientCard key={patient._id} patient={patient} onClick={() => goToPatient(patient._id)} />
            ))}
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
            <EmptyState icon={Users} title="No Patients Found" subtitle="Patients who book with your hospital's doctors will appear here." />
          </div>
        )}
      </div>
    </div>
  )
}

const PatientCard = ({ patient, onClick }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, overflow: 'hidden',
        boxShadow: hovered ? '0 12px 32px rgba(15,23,42,0.08)' : '0 8px 24px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer', padding: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={patient.image} alt={patient.name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0', flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <Mail size={11} color="#94A3B8" />
            <span style={{ fontSize: 11.5, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.email}</span>
          </div>
        </div>
        <ArrowRight size={15} color="#94A3B8" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarDays size={15} color="#64748B" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{patient.appointmentCount}</div>
            <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 3 }}>Appointments</div>
          </div>
        </div>
        <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stethoscope size={15} color="#64748B" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{patient.doctorCount}</div>
            <div style={{ fontSize: 10.5, color: '#64748B', marginTop: 3 }}>Doctor{patient.doctorCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(HospitalPatients)
