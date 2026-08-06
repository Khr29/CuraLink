import React, { useContext, useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { HospitalContext } from '../context/HospitalContext'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, ChevronDown } from 'lucide-react'

const ROLE_BADGE = {
  Admin: { bg: '#F0F9FF', border: '#BAE6FD', dot: '#0EA5E9', text: '#0284C7', avatar: 'A' },
  Doctor: { bg: '#F0FDF4', border: '#BBF7D0', dot: '#22C55E', text: '#16A34A', avatar: 'D' },
  Hospital: { bg: '#EFF6FF', border: '#BFDBFE', dot: '#2563EB', text: '#1D4ED8', avatar: 'H' },
}

// Role-aware destination for the "My Profile" menu item. Admin has no
// dedicated profile page in the current route set, so it's simply omitted
// for that role rather than linking somewhere invalid.
const PROFILE_PATH = { Doctor: '/doctor-profile', Hospital: '/hospital-profile' }

const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext)
  const { dToken, setDToken } = useContext(DoctorContext)
  const { hToken, setHToken } = useContext(HospitalContext)
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const role = useMemo(() => (aToken ? 'Admin' : dToken ? 'Doctor' : 'Hospital'), [aToken, dToken])
  const badge = ROLE_BADGE[role]
  const profilePath = PROFILE_PATH[role]

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    const onEscape = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  const logout = useCallback(() => {
    if (aToken) {
      setAToken('')
      localStorage.removeItem('atoken')
    }

    if (dToken) {
      setDToken('')
      localStorage.removeItem('dToken')
    }

    if (hToken) {
      setHToken('')
      localStorage.removeItem('hToken')
    }

    navigate('/')
  }, [aToken, dToken, hToken, setAToken, setDToken, setHToken, navigate])

  const goToProfile = useCallback(() => {
    setMenuOpen(false)
    if (profilePath) navigate(profilePath)
  }, [profilePath, navigate])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 62,
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* Left */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <img
            src={assets.admin_logo}
            alt="CuraLink"
            style={{
              width: 36,
              height: 36,
              objectFit: 'contain',
              display: 'block'
            }}
          />

          <h2
            style={{
              margin: 0,
              lineHeight: 1,
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(90deg,#2563EB,#14B8A6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            CuraLink
          </h2>
        </div>

        {/* Role Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '5px 14px',
            borderRadius: 999,
            background: badge.bg,
            border: `1px solid ${badge.border}`
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: badge.dot
            }}
          />

          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: badge.text
            }}
          >
            {role}
          </span>
        </div>
      </div>

      {/* Right — profile dropdown, same shape/animation across Admin/Doctor/Hospital */}
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-label="Account menu"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 10px 5px 5px', borderRadius: 999,
            border: `1px solid ${menuOpen ? '#BFDBFE' : '#E5E7EB'}`,
            background: menuOpen ? '#EFF6FF' : '#fff',
            cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={(e) => { if (!menuOpen) e.currentTarget.style.background = '#F8FAFC' }}
          onMouseLeave={(e) => { if (!menuOpen) e.currentTarget.style.background = '#fff' }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#14B8A6,#0EA5E9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0
            }}
          >
            {badge.avatar}
          </div>
          <ChevronDown size={15} color="#64748B" style={{ transition: 'transform 0.2s', transform: menuOpen ? 'rotate(180deg)' : 'none' }} />
        </button>

        {menuOpen && (
          <div
            className="curalink-navbar-dropdown"
            style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 220, background: '#FFFFFF', borderRadius: 18,
              border: '1px solid #F1F5F9', boxShadow: '0 20px 44px rgba(15,23,42,0.16)',
              padding: 8, zIndex: 60
            }}
          >
            <div style={{ padding: '8px 10px 10px', marginBottom: 4, borderBottom: '1px solid #F1F5F9' }}>
              <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, margin: 0 }}>Signed in as</p>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '2px 0 0' }}>{role}</p>
            </div>

            {profilePath && (
              <button
                onClick={goToProfile}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 10, border: 'none', background: 'transparent',
                  color: '#334155', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', transition: 'background 0.15s', textAlign: 'left'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <User size={15} color="#64748B" /> My Profile
              </button>
            )}

            <div style={{ height: 1, background: '#F1F5F9', margin: '6px 4px' }} />

            <button
              onClick={logout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 10, border: 'none', background: 'transparent',
                color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', transition: 'background 0.15s', textAlign: 'left'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <LogOut size={15} color="#DC2626" /> Logout
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes curalink-dropdown-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .curalink-navbar-dropdown { animation: curalink-dropdown-in 0.16s ease-out; transform-origin: top right; }
      `}</style>
    </div>
  )
}

export default React.memo(Navbar)
