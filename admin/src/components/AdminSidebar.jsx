

// import React, { useContext, useMemo } from 'react'
// import { AdminContext } from '../context/AdminContext'
// import { NavLink } from 'react-router-dom'
// import { assets } from '../assets/assets'

// const AdminSidebar = () => {
//   const { aToken } = useContext(AdminContext)

//   // menu config (clean + scalable)
//   const menuItems = useMemo(() => [
//     { name: 'Dashboard', path: '/admin-dashboard', icon: assets.home_icon },
//     { name: 'Appointments', path: '/all-appointments', icon: assets.appointment_icon },
//     { name: 'Add Doctor', path: '/add-doctor', icon: assets.add_icon },
//     { name: 'Doctor List', path: '/doctor-list', icon: assets.people_icon }
//   ], [])

//   return (
//     <div className='h-screen flex-shrink-0 bg-white border-r shadow-sm 
//                 w-16 md:w-64 min-w-[64px] md:min-w-[256px] transition-all duration-300'>

//       {aToken && (
//         <ul className='text-gray-600 mt-5 space-y-2'>

//           {menuItems.map((item, index) => (
//             <NavLink
//               key={index}
//               to={item.path}
//               className={({ isActive }) =>
//                 `flex items-center gap-4 py-3 px-3 md:px-6 cursor-pointer rounded-l-full transition-all duration-200
//                 ${isActive
//                   ? 'bg-indigo-50 text-primary border-r-4 border-primary shadow-sm'
//                   : 'hover:bg-gray-100'
//                 }`
//               }
//             >
//               <img
//                 src={item.icon}
//                 alt={item.name}
//                 className='w-5 h-5 min-w-[20px]'
//               />

//               {/* Hide text on small screens */}
//               <p className='hidden md:block text-sm font-medium'>
//                 {item.name}
//               </p>
//             </NavLink>
//           ))}

//         </ul>
//       )}
//     </div>
//   )
// }

// export default React.memo(AdminSidebar)
import React, { useContext, useMemo, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const AdminSidebar = () => {
  const { aToken } = useContext(AdminContext)
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = useMemo(() => [
    { name: 'Dashboard', path: '/admin-dashboard', icon: assets.home_icon },
    { name: 'Appointments', path: '/all-appointments', icon: assets.appointment_icon },
    { name: 'Add Doctor', path: '/add-doctor', icon: assets.add_icon },
    { name: 'Doctor List', path: '/doctor-list', icon: assets.people_icon }
  ], [])

  return (
    <div style={{
      height: '100vh', flexShrink: 0,
      background: '#0F172A',
      width: collapsed ? 68 : 240,
      minWidth: collapsed ? 68 : 240,
      transition: 'width 0.3s ease, min-width 0.3s ease',
      display: 'flex', flexDirection: 'column',
      position: 'relative'
    }}>

      {/* Logo area */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 10
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #14B8A6, #6366F1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: '#fff'
            }}>M</div>
            <div>
              <p style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 15, margin: 0 }}>Medilink</p>
              <p style={{ color: '#64748B', fontSize: 10, margin: 0 }}>Admin Panel</p>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, width: 28, height: 28, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94A3B8', flexShrink: 0, transition: 'background 0.2s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
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
      {aToken && (
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {!collapsed && (
            <p style={{ fontSize: 10, fontWeight: 700, color: '#334155', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 8 }}>
              Main Menu
            </p>
          )}
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {menuItems.map((item, index) => (
              <li key={index}>
                <NavLink to={item.path} style={{ textDecoration: 'none' }}>
                  {({ isActive }) => (
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: 12, padding: collapsed ? '10px 14px' : '10px 14px',
                      borderRadius: 10, cursor: 'pointer',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      background: isActive ? 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(99,102,241,0.15))' : 'transparent',
                      border: isActive ? '1px solid rgba(20,184,166,0.3)' : '1px solid transparent',
                      transition: 'all 0.2s'
                    }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: isActive ? 'linear-gradient(135deg, #14B8A6, #6366F1)' : 'rgba(255,255,255,0.06)',
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
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #14B8A6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>A</div>
            <div>
              <p style={{ color: '#E2E8F0', fontSize: 12, fontWeight: 600, margin: 0 }}>Admin</p>
              <p style={{ color: '#475569', fontSize: 10, margin: 0 }}>Administrator</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(AdminSidebar)