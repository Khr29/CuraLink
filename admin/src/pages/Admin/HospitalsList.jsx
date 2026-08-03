import React, { useContext, useEffect, useCallback, useMemo } from 'react'
import { AdminContext } from '../../context/AdminContext'

const HospitalsList = () => {
  const {
    hospitals,
    aToken,
    getAllHospitals,
    changeHospitalStatus,
    deleteHospital
  } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) getAllHospitals()
  }, [aToken, getAllHospitals])

  const handleStatusChange = useCallback((id) => {
    changeHospitalStatus(id)
  }, [changeHospitalStatus])

  const handleDelete = useCallback((id) => {
    deleteHospital(id)
  }, [deleteHospital])

  const renderedHospitals = useMemo(() => {
    return hospitals?.map((item) => {
      const isActive = item.active ?? item.available ?? false
      const city = item.address?.city || item.city || ''
      const state = item.address?.state || item.state || ''
      const locationText = [city, state].filter(Boolean).join(', ') || 'Location N/A'
      const deptCount = item.departments?.length || 0
      const facilityCount = item.facilities?.length || 0
      const rating = item.rating || 4.5

      return (
        <div
          key={item._id}
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            transition: 'box-shadow 0.25s, transform 0.25s',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(20,184,166,0.14)'
            e.currentTarget.style.transform = 'translateY(-4px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {/* Hospital Image Container */}
          <div style={{ overflow: 'hidden', height: 200, background: '#F0FDFA', position: 'relative' }}>
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />

            {/* Delete Button Overlay */}
            <button
              onClick={() => handleDelete(item._id)}
              title="Delete Hospital"
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #FECDD3',
                color: '#EF4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#EF4444'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
                e.currentTarget.style.color = '#EF4444'
              }}
            >
              🗑️
            </button>

            {/* Rating Tag */}
            <div style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              color: '#FFD700',
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: 99,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span>★</span>
              <span style={{ color: '#FFFFFF' }}>{rating}</span>
            </div>
          </div>

          {/* Content Body */}
          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <p style={{ fontWeight: 700, color: '#0F172A', fontSize: 15, margin: 0 }}>{item.name}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#6366F1',
                  background: '#EEF2FF',
                  padding: '3px 10px',
                  borderRadius: 99
                }}>
                  {item.hospitalType || 'Hospital'}
                </span>
                
                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
                  📍 {locationText}
                </span>
              </div>
            </div>

            {/* Contact Info */}
            <div style={{ fontSize: 12, color: '#64748B', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {item.email && <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✉️ {item.email}</div>}
              {item.phone && <div>📞 {item.phone}</div>}
            </div>

            {/* Departments & Facilities Badge Count */}
            <div style={{ display: 'flex', gap: 8, fontSize: 11, fontWeight: 600, color: '#475569' }}>
              <span style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: 6 }}>
                🩺 {deptCount} Depts
              </span>
              <span style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: 6 }}>
                🏢 {facilityCount} Facilities
              </span>
            </div>

            {/* Status Toggle Box */}
           <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 12,
              marginTop: 'auto',
              background: isActive ? '#F0FDF4' : '#FFF1F2',
              border: `1px solid ${isActive ? '#BBF7D0' : '#FECDD3'}`
            }}
          >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1 }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isActive ? '#22C55E' : '#EF4444'
                }} />
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isActive ? '#16A34A' : '#DC2626'
                }}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Toggle Switch */}
              <div
                onClick={() => handleStatusChange(item._id)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 99,
                  cursor: 'pointer',
                  background: isActive ? '#22C55E' : '#CBD5E1',
                  padding: 3,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.25s ease'
                }}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transform: isActive ? 'translateX(20px)' : 'translateX(0px)',
                  transition: 'transform 0.25s ease'
                }} />
              </div>
            </div>

          </div>
        </div>
      )
    })
  }, [hospitals, handleStatusChange, handleDelete])

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '28px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>All Hospitals</h1>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Manage registered hospitals and their status</p>
          </div>
          <span style={{ background: '#F0FDF4', color: '#16A34A', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 99 }}>
            {hospitals?.length || 0} Hospitals
          </span>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {hospitals?.length > 0 ? renderedHospitals : (
            <p style={{ color: '#94A3B8', gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
              No hospitals found
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default React.memo(HospitalsList)