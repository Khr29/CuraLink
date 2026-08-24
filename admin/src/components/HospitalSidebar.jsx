import React, { useContext, useMemo, useState, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Stethoscope,
  Building2,
  CalendarDays,
  MessageSquare,
  Images,
  UserCog,
  Settings,
  LogOut,
  UserCheck,
  Users
} from 'lucide-react'
import { HospitalContext } from '../context/HospitalContext'
import { revokeServerSession } from '../utils/logoutHelper'

const HospitalSidebar = () => {
  const { hToken, setHToken } = useContext(HospitalContext)
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const menuItems = useMemo(() => [
    { name: 'Dashboard', path: '/hospital-dashboard', icon: LayoutDashboard },
    { name: 'Doctors', path: '/hospital-my-doctors', icon: Stethoscope },
    { name: 'Doctor Requests', path: '/hospital-doctor-requests', icon: UserCheck },
    { name: 'Departments', path: '/hospital-departments', icon: Building2 },
    { name: 'Appointments', path: '/hospital-appointments', icon: CalendarDays },
    { name: 'Patients', path: '/hospital-patients', icon: Users },
    { name: 'Reviews', path: '/hospital-my-reviews', icon: MessageSquare },
    { name: 'Gallery', path: '/hospital-gallery', icon: Images },
    { name: 'Profile', path: '/hospital-profile', icon: UserCog },
    { name: 'Settings', path: '/hospital-settings', icon: Settings }
  ], [])

  const logout = useCallback(async () => {
    // Revoke the server-side session first — see utils/logoutHelper.js.
    await revokeServerSession('htoken', hToken)
    setHToken('')
    localStorage.removeItem('hToken')
    navigate('/')
  }, [hToken, setHToken, navigate])

  return (
    <div style={{
      height: '100%', flexShrink: 0,
      background: 'linear-gradient(180deg,#0F172A,#172554)',
      width: collapsed ? 68 : 240,
      minWidth: collapsed ? 68 : 240,
      transition: 'width 0.3s ease, min-width 0.3s ease',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      overflowY: 'auto'
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
            }}>H</div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{
                margin: 0, fontSize: 17, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.3px',
                background: 'linear-gradient(90deg,#2563EB,#14B8A6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                CuraLink
              </h2>
              <p style={{ color: '#64748B', fontSize: 10, margin: 0 }}>Hospital Panel</p>
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
      {hToken && (
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {!collapsed && (
            <p style={{ fontSize: 10, fontWeight: 700, color: '#334155', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 8 }}>
              Menu
            </p>
          )}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.name}>
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
                          <Icon size={16} color={isActive ? '#FFFFFF' : '#94A3B8'} />
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
              )
            })}
          </ul>
        </nav>
      )}

      {/* Footer / Logout */}
      <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
            transition: 'all 0.2s', fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
        >
          <LogOut size={16} color="#F87171" />
          {!collapsed && <span style={{ fontSize: 13, fontWeight: 600, color: '#F87171' }}>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default React.memo(HospitalSidebar)
