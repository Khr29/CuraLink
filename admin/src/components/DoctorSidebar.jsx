import React, { useContext, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'

const DoctorSidebar = () => {
  const { dToken } = useContext(DoctorContext)
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = useMemo(() => [
    { name: 'Dashboard', path: '/doctor-dashboard', icon: assets.home_icon },
    { name: 'Appointments', path: '/doctor-appointments', icon: assets.appointment_icon },
    { name: 'Profile', path: '/doctor-profile', icon: assets.people_icon }
  ], [])

  return (
    <div style={{
      height: '100vh', flexShrink: 0,
      background: 'linear-gradient(180deg,#0F172A,#172554)',
      width: collapsed ? 68 : 240,
      minWidth: collapsed ? 68 : 240,
      transition: 'width 0.3s ease, min-width 0.3s ease',
      display: 'flex', flexDirection: 'column',
      position: 'relative'
    }}>

      {/* Logo area */}
      <div style={{
        padding: collapsed ? '16px' : '16px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: '#fff'
            }}>D</div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{
                margin: 0, fontSize: 17, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.3px',
                background: 'linear-gradient(90deg,#2563EB,#14B8A6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                CuraLink
              </h2>
              <p style={{ color: '#64748B', fontSize: 10, margin: 0 }}>Doctor Panel</p>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: 32, height: 32, borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.05)',
            color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: '.2s', flexShrink: 0
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.05)')}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            }
          </svg>
        </button>
      </div>

      {/* Menu */}
      {dToken && (
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {!collapsed && (
            <p style={{ fontSize: 10, fontWeight: 700, color: '#334155', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 8 }}>
              Menu
            </p>
          )}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {menuItems.map((item, index) => (
              <li key={index}>
                <NavLink to={item.path} style={{ textDecoration: 'none' }}>
                  {({ isActive }) => (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      background: isActive ? 'linear-gradient(135deg, rgba(37,99,235,0.20), rgba(20,184,166,0.15))' : 'transparent',
                      border: isActive ? '1px solid rgba(20,184,166,0.3)' : '1px solid transparent',
                      transition: 'all 0.2s'
                    }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: isActive ? 'linear-gradient(135deg, #2563EB, #14B8A6)' : 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s'
                      }}>
                        <img src={item.icon} alt={item.name} style={{ width: 16, height: 16, filter: isActive ? 'brightness(10)' : 'brightness(0.6)' }} />
                      </div>
                      {!collapsed && (
                        <span style={{
                          fontSize: 13, fontWeight: isActive ? 600 : 500,
                          color: isActive ? '#FFFFFF' : '#94A3B8',
                          transition: 'color 0.2s'
                        }}>
                          {item.name}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Footer */}
      {!collapsed && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff'
            }}>Dr</div>
            <div>
              <p style={{ color: '#E2E8F0', fontSize: 12, fontWeight: 600, margin: 0 }}>Doctor</p>
              <p style={{ color: '#475569', fontSize: 10, margin: 0 }}>Online</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(DoctorSidebar)
