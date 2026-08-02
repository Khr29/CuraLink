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
    if (aToken) {
      setAToken('')
      localStorage.removeItem('atoken')
    }

    if (dToken) {
      setDToken('')
      localStorage.removeItem('dToken')
    }

    navigate('/')
  }, [aToken, dToken, setAToken, setDToken, navigate])

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
            background: role === 'Admin' ? '#EEF2FF' : '#F0FDF4',
            border: `1px solid ${
              role === 'Admin' ? '#C7D2FE' : '#BBF7D0'
            }`
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: role === 'Admin' ? '#6366F1' : '#22C55E'
            }}
          />

          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: role === 'Admin' ? '#4F46E5' : '#16A34A'
            }}
          >
            {role}
          </span>
        </div>
      </div>

      {/* Right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#14B8A6,#6366F1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700
          }}
        >
          {role === 'Admin' ? 'A' : 'D'}
        </div>

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 15px',
            borderRadius: 999,
            border: '1px solid #FECACA',
            background: '#FFF1F2',
            color: '#E11D48',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: '0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FFE4E6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFF1F2'
          }}
        >
          <svg
            width="13"
            height="13"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
            />
          </svg>

          Logout
        </button>
      </div>
    </div>
  )
}

export default React.memo(Navbar)