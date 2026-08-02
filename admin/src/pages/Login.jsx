
// import React, { useContext, useState, useCallback } from 'react'
// import { assets } from '../assets/assets'
// import { AdminContext } from '../context/AdminContext'
// import { DoctorContext } from '../context/DoctorContext'
// import axios from 'axios'
// import { toast } from 'react-toastify'
// import { useNavigate } from 'react-router-dom'

// const Login = () => {

//   const [state, setState] = useState('Admin')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)

//   const { setAToken, backendUrl } = useContext(AdminContext)
//   const { setDToken } = useContext(DoctorContext)

//   const navigate = useNavigate()

//   const onSubmitHandler = useCallback(async (event) => {
//     event.preventDefault()
//     setLoading(true)

//     try {
//       const url =
//         state === 'Admin'
//           ? `${backendUrl}/api/admin/login`
//           : `${backendUrl}/api/doctor/login`

//       const { data } = await axios.post(url, { email, password })

//       if (data.success) {

//         if (state === 'Admin') {
//           // ✅ Save admin token
//           localStorage.setItem('aToken', data.token)

//           // 🔥 IMPORTANT: remove doctor token
//           localStorage.removeItem('dToken')

//           setAToken(data.token)

//           // 🔥 Redirect
//           navigate('/admin-dashboard')

//         } else {
//           // ✅ Save doctor token
//           localStorage.setItem('dToken', data.token)

//           // 🔥 IMPORTANT: remove admin token
//           localStorage.removeItem('aToken')

//           setDToken(data.token)

//           // 🔥 Redirect
//           navigate('/doctor-dashboard')
//         }

//         toast.success('Login successful 🚀')

//       } else {
//         toast.error(data.message)
//       }

//     } catch (error) {
//       console.error(error)
//       toast.error('Something went wrong')
//     } finally {
//       setLoading(false)
//     }

//   }, [state, email, password, backendUrl, setAToken, setDToken, navigate])

//   return (
//     <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4'>

//       <form
//         onSubmit={onSubmitHandler}
//         className='w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border'
//       >

//         {/* Title */}
//         <p className='text-2xl font-bold text-center mb-6'>
//           <span className='text-primary'>{state}</span> Login
//         </p>

//         {/* Email */}
//         <div className='mb-4'>
//           <label className='text-sm font-medium'>Email</label>
//           <input
//             type='email'
//             required
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className='w-full mt-1 p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
//             placeholder='Enter your email'
//           />
//         </div>

//         {/* Password */}
//         <div className='mb-4'>
//           <label className='text-sm font-medium'>Password</label>
//           <input
//             type='password'
//             required
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className='w-full mt-1 p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
//             placeholder='Enter your password'
//           />
//         </div>

//         {/* Button */}
//         <button
//           type='submit'
//           disabled={loading}
//           className='w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50'
//         >
//           {loading ? 'Logging in...' : 'Login'}
//         </button>

//         {/* Switch */}
//         <p className='text-sm text-center mt-4'>
//           {state === 'Admin' ? (
//             <>
//               Doctor Login?{' '}
//               <span
//                 className='text-primary font-medium cursor-pointer hover:underline'
//                 onClick={() => setState('Doctor')}
//               >
//                 Click here
//               </span>
//             </>
//           ) : (
//             <>
//               Admin Login?{' '}
//               <span
//                 className='text-primary font-medium cursor-pointer hover:underline'
//                 onClick={() => setState('Admin')}
//               >
//                 Click here
//               </span>
//             </>
//           )}
//         </p>

//       </form>
//     </div>
//   )
// }

// export default React.memo(Login)

import React, { useContext, useState, useCallback } from 'react'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { setAToken, backendUrl } = useContext(AdminContext)
  const { setDToken } = useContext(DoctorContext)
  const navigate = useNavigate()

  const onSubmitHandler = useCallback(async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const url = state === 'Admin'
        ? `${backendUrl}/api/admin/login`
        : `${backendUrl}/api/doctor/login`

      const { data } = await axios.post(url, { email, password })

      if (data.success) {
        if (state === 'Admin') {
          localStorage.setItem('aToken', data.token)
          localStorage.removeItem('dToken')
          setAToken(data.token)
          navigate('/admin-dashboard')
        } else {
          localStorage.setItem('dToken', data.token)
          localStorage.removeItem('aToken')
          setDToken(data.token)
          navigate('/doctor-dashboard')
        }
        toast.success('Login successful 🚀')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [state, email, password, backendUrl, setAToken, setDToken, navigate])

  const isAdmin = state === 'Admin'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#F8FAFC', fontFamily: 'Inter, sans-serif'
    }}>

      {/* ── Left Panel ── */}
      <div style={{
        display: 'none',
        flex: 1,
        background: 'linear-gradient(135deg, #0F172A 0%, #134E4A 60%, #0C4A6E 100%)',
        position: 'relative', overflow: 'hidden',
        alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        padding: 48
      }} className="left-panel">

        {/* Blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, background: 'rgba(20,184,166,0.15)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, background: 'rgba(99,102,241,0.12)', borderRadius: '50%', filter: 'blur(60px)' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 360 }}>
          {/* Logo */}
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #14B8A6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 auto 24px' }}>M</div>

          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2, margin: '0 0 16px' }}>
            Medilink<br />
            <span style={{ background: 'linear-gradient(90deg, #5EEAD4, #BAE6FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Dashboard
            </span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.7, margin: '0 0 40px' }}>
            Manage doctors, appointments, and patients from one unified platform.
          </p>

          {/* Feature list */}
          {[
            { icon: '🩺', text: 'Doctor & Patient Management' },
            { icon: '📅', text: 'Appointment Scheduling' },
            { icon: '📊', text: 'Real-time Analytics' },
            { icon: '🔒', text: 'Role-Based Access Control' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel / Form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #14B8A6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 auto 14px' }}>M</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 6 }}>Sign in to your {state} account</p>
          </div>

          {/* Role Toggle */}
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {['Admin', 'Doctor'].map((role) => (
              <button key={role} type="button" onClick={() => setState(role)} style={{
                flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                background: state === role
                  ? role === 'Admin'
                    ? 'linear-gradient(135deg, #6366F1, #4F46E5)'
                    : 'linear-gradient(135deg, #14B8A6, #0D9488)'
                  : 'transparent',
                color: state === role ? '#FFFFFF' : '#64748B',
                boxShadow: state === role ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                fontFamily: 'Inter, sans-serif'
              }}>
                {role === 'Admin' ? '🛡️' : '🩺'} {role}
              </button>
            ))}
          </div>

          {/* Form Card */}
          <form onSubmit={onSubmitHandler} style={{
            background: '#FFFFFF', borderRadius: 20,
            border: '1px solid #F1F5F9',
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            padding: 28
          }}>

            {/* Role badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isAdmin ? '#6366F1' : '#14B8A6' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: isAdmin ? '#4F46E5' : '#0D9488', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {state} Portal
              </span>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 7, letterSpacing: '0.02em' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 15 }}>✉️</div>
                <input
                  type='email' required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Enter your email'
                  style={{
                    width: '100%', padding: '11px 14px 11px 40px',
                    background: '#F8FAFC', border: '1.5px solid #E2E8F0',
                    borderRadius: 10, fontSize: 14, color: '#0F172A',
                    outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={e => { e.target.style.borderColor = isAdmin ? '#6366F1' : '#14B8A6'; e.target.style.boxShadow = `0 0 0 3px ${isAdmin ? 'rgba(99,102,241,0.12)' : 'rgba(20,184,166,0.12)'}` }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 7, letterSpacing: '0.02em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔒</div>
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Enter your password'
                  style={{
                    width: '100%', padding: '11px 44px 11px 40px',
                    background: '#F8FAFC', border: '1.5px solid #E2E8F0',
                    borderRadius: 10, fontSize: 14, color: '#0F172A',
                    outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={e => { e.target.style.borderColor = isAdmin ? '#6366F1' : '#14B8A6'; e.target.style.boxShadow = `0 0 0 3px ${isAdmin ? 'rgba(99,102,241,0.12)' : 'rgba(20,184,166,0.12)'}` }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                />
                {/* Show/hide toggle */}
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: 2
                }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type='submit' disabled={loading} style={{
              width: '100%', padding: '13px',
              background: isAdmin
                ? loading ? '#A5B4FC' : 'linear-gradient(135deg, #6366F1, #4F46E5)'
                : loading ? '#5EEAD4' : 'linear-gradient(135deg, #14B8A6, #0D9488)',
              color: '#FFFFFF', border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : `0 4px 14px ${isAdmin ? 'rgba(99,102,241,0.35)' : 'rgba(20,184,166,0.35)'}`,
              transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Signing in...
                </>
              ) : (
                `Sign in as ${state}`
              )}
            </button>

          </form>

          {/* Footer note */}
          <p style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 20 }}>
            🔐 Secured with role-based access control
          </p>

        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .left-panel { display: flex !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default React.memo(Login)