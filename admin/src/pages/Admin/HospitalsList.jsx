import React, { useContext, useEffect, useCallback, useMemo, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Trash2, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Building 
} from 'lucide-react'

const HospitalsList = () => {
  const {
    hospitals,
    aToken,
    getAllHospitals,
    changeHospitalStatus,
    deleteHospital
  } = useContext(AdminContext)

  // Fetch hospitals
  useEffect(() => {
    if (aToken) {
      getAllHospitals()
    }
  }, [aToken, getAllHospitals])

  // Stable handlers
  const handleStatusChange = useCallback((id) => {
    changeHospitalStatus(id)
  }, [changeHospitalStatus])

  const handleDelete = useCallback((id) => {
    deleteHospital(id)
  }, [deleteHospital])

  // Memoized hospital card list rendering
  const renderedHospitals = useMemo(() => {
    return hospitals?.map((item) => (
      <HospitalCard 
        key={item._id} 
        item={item} 
        onStatusChange={handleStatusChange} 
        onDelete={handleDelete} 
      />
    ))
  }, [hospitals, handleStatusChange, handleDelete])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)',
        padding: '36px 24px'
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        
        {/* PAGE HEADER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(37,99,235,0.25)'
              }}
            >
              <Building2 size={26} color="#FFFFFF" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                All Hospitals
              </h1>
              <p style={{ fontSize: 14, color: '#64748B', marginTop: 3 }}>
                Manage registered hospitals, network status, and directory listings.
              </p>
            </div>
          </div>

          {/* HOSPITAL COUNTER BADGE */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '10px 20px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 4px 12px rgba(15,23,42,0.03)'
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14B8A6' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
              Total Hospitals: <span style={{ color: '#2563EB' }}>{hospitals?.length || 0}</span>
            </span>
          </div>
        </div>

        {/* HOSPITALS GRID CONTAINER */}
        {hospitals?.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 380px))',
              justifyContent: 'start',
              gap: 24,
            }}
          >
            {renderedHospitals}
          </div>
        ) : (
          /* EMPTY STATE CARD */
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 24,
              padding: '60px 24px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(15,23,42,0.04)'
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}
            >
              <Building2 size={32} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
              No Hospitals Found
            </h3>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
              There are currently no registered hospitals available in the network.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

// CURALINK DESIGN SYSTEM HOSPITAL CARD COMPONENT
const HospitalCard = ({ item, onStatusChange, onDelete }) => {
  const [hovered, setHovered] = useState(false)
  const [deleteHovered, setDeleteHovered] = useState(false)

  // Derived properties from backend data
  const isActive = item.active ?? item.available ?? false
  const city = item.address?.city || item.city || ''
  const state = item.address?.state || item.state || ''
  const locationText = [city, state].filter(Boolean).join(', ') || 'Location N/A'
  const deptCount = item.departments?.length || 0
  const facilityCount = item.facilities?.length || 0
  const rating = item.rating || 4.5

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 24,
        overflow: 'hidden',
        width: '330px',
        maxWidth: '100%',

        boxShadow: hovered ? '0 12px 32px rgba(15,23,42,0.08)' : '0 8px 24px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* CARD TOP IMAGE */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 210,
          background: 'linear-gradient(135deg, #EFF6FF, #E0F2FE)',
          overflow: 'hidden'
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.5s ease'
          }}
        />

        {/* DELETE ACTION BUTTON */}
        <button
          onClick={() => onDelete(item._id)}
          onMouseEnter={() => setDeleteHovered(true)}
          onMouseLeave={() => setDeleteHovered(false)}
          title="Delete Hospital"
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: deleteHovered ? '#EF4444' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            border: deleteHovered ? '1px solid #EF4444' : '1px solid rgba(226,232,240,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            zIndex: 2
          }}
        >
          <Trash2 size={16} color={deleteHovered ? '#FFFFFF' : '#EF4444'} />
        </button>

        {/* RATING BADGE */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            padding: '5px 10px',
            borderRadius: 99,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Star size={12} color="#FBBF24" fill="#FBBF24" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#FFFFFF', paddingTop: 1 }}>
            {rating}
          </span>
        </div>
      </div>

      {/* CARD DETAILS */}
      <div
        style={{
          padding: '20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 8px 0',
              letterSpacing: '-0.01em',
              lineHeight: 1.3
            }}
          >
            {item.name}
          </h3>

          {/* TAGS (TYPE & LOCATION) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: '#EEF2FF',
                padding: '4px 10px',
                borderRadius: 99
              }}
            >
              <Activity size={12} color="#4F46E5" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#4F46E5' }}>
                {item.hospitalType || 'Hospital'}
              </span>
            </div>
            
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: '#F1F5F9',
                padding: '4px 10px',
                borderRadius: 99
              }}
            >
              <MapPin size={12} color="#64748B" />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>
                {locationText}
              </span>
            </div>
          </div>
        </div>

        {/* CONTACT INFO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {item.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={14} color="#94A3B8" />
              <span style={{ fontSize: 13, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.email}
              </span>
            </div>
          )}
          {item.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={14} color="#94A3B8" />
              <span style={{ fontSize: 13, color: '#475569' }}>
                {item.phone}
              </span>
            </div>
          )}
        </div>

        {/* DEPARTMENTS & FACILITIES */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
             <Building size={16} color="#64748B" />
             <div>
               <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{deptCount}</div>
               <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>Depts</div>
             </div>
          </div>
          <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
             <Activity size={16} color="#64748B" />
             <div>
               <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{facilityCount}</div>
               <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>Facilities</div>
             </div>
          </div>
        </div>

        {/* STATUS TOGGLE CONTROL */}
        <div
          style={{
            marginTop: 4,
            padding: '12px 14px',
            borderRadius: 16,
            background: isActive ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${isActive ? '#DCFCE7' : '#FEE2E2'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.25s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isActive ? (
              <CheckCircle2 size={16} color="#16A34A" />
            ) : (
              <XCircle size={16} color="#DC2626" />
            )}
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: isActive ? '#15803D' : '#B91C1C'
              }}
            >
              {isActive ? 'Active Status' : 'Inactive Status'}
            </span>
          </div>

          {/* TOGGLE SWITCH INPUT */}
          <label
            style={{
              position: 'relative',
              display: 'inline-block',
              width: 44,
              height: 24,
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => onStatusChange(item._id)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: isActive ? '#16A34A' : '#CBD5E1',
                borderRadius: 99,
                transition: '0.25s ease',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  height: 18,
                  width: 18,
                  left: isActive ? 23 : 3,
                  bottom: 3,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  transition: '0.25s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default React.memo(HospitalsList)