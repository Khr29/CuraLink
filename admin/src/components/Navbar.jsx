
import React, { useContext, useCallback, useMemo } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext)
  const { dToken, setDToken } = useContext(DoctorContext)
  const navigate = useNavigate()

  const role = useMemo(() => (aToken ? 'Admin' : 'Doctor'), [aToken])

  const logout = useCallback(() => {
    if (aToken) { setAToken(''); localStorage.removeItem('atoken') }
    if (dToken) { setDToken(''); localStorage.removeItem('dToken') }
    navigate('/')
  }, [aToken, dToken, setAToken, setDToken, navigate])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', height: 60,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #F1F5F9',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      position: 'sticky', top: 0, zIndex: 50
    }}>

      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img
          src={assets.admin_logo}
          alt='Logo'
          style={{ height: 32, cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        />

        <div style={{ width: 1, height: 20, background: '#E2E8F0' }} />

        {/* Role badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '4px 12px', borderRadius: 99,
          background: role === 'Admin' ? '#EEF2FF' : '#F0FDF4',
          border: `1px solid ${role === 'Admin' ? '#C7D2FE' : '#BBF7D0'}`
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: role === 'Admin' ? '#6366F1' : '#22C55E'
          }} />
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: role === 'Admin' ? '#4F46E5' : '#16A34A',
            letterSpacing: '0.04em'
          }}>
            {role}
          </span>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg, #14B8A6, #6366F1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
          flexShrink: 0
        }}>
          {role === 'Admin' ? 'A' : 'D'}
        </div>

        {/* Logout */}
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: '#FFF1F2', border: '1px solid #FECDD3',
          color: '#E11D48', fontSize: 13, fontWeight: 600,
          padding: '7px 16px', borderRadius: 99, cursor: 'pointer',
          transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FFE4E6'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#FFF1F2'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )
}

export default React.memo(Navbar)