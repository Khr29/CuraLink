import React, { useContext, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AdminContext } from '../context/AdminContext'

const ROLE_ROUTES = {
  Doctor: { forgot: '/api/doctor/forgot-password', reset: '/api/doctor/reset-password' },
  Hospital: { forgot: '/api/hospital/forgot-password', reset: '/api/hospital/reset-password' },
  Pharmacy: { forgot: '/api/pharmacy/forgot-password', reset: '/api/pharmacy/reset-password' },
}

const ForgotPassword = () => {
  const { backendUrl } = useContext(AdminContext)
  const location = useLocation()
  const navigate = useNavigate()

  const [role, setRole] = useState(
    location.state?.role === 'Hospital' ? 'Hospital' : location.state?.role === 'Pharmacy' ? 'Pharmacy' : 'Doctor'
  )
  const [step, setStep] = useState('request') // 'request' | 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const requestCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post(`${backendUrl}${ROLE_ROUTES[role].forgot}`, { email })
      toast.success(data.message)
      setStep('reset')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await axios.post(`${backendUrl}${ROLE_ROUTES[role].reset}`, {
        email, otp, newPassword, confirmPassword,
      })
      if (data.success) {
        toast.success(data.message)
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: '#F8FAFC',
    border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14,
    color: '#0F172A', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif', marginTop: 6,
  }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#475569' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', fontFamily: 'Inter, sans-serif', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#FFFFFF', borderRadius: 20, border: '1px solid #F1F5F9', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>Reset your password</h2>
        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px' }}>
          {step === 'request' ? "We'll email you a 6-digit code." : `Enter the code sent to ${email}.`}
        </p>

        {step === 'request' && (
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 12, padding: 4, marginBottom: 20 }}>
            {['Doctor', 'Hospital', 'Pharmacy'].map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)} style={{
                flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: role === r ? '#0EA5E9' : 'transparent', color: role === r ? '#fff' : '#64748B',
              }}>
                {r}
              </button>
            ))}
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={requestCode}>
            <label style={labelStyle}>Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="you@example.com" />
            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 20, padding: 12, background: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Sending...' : 'Send reset code'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword}>
            <label style={labelStyle}>Verification Code</label>
            <input required value={otp} onChange={(e) => setOtp(e.target.value)} style={inputStyle} placeholder="6-digit code" maxLength={6} />
            <label style={{ ...labelStyle, display: 'block', marginTop: 14 }}>New Password</label>
            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} placeholder="At least 8 characters" />
            <label style={{ ...labelStyle, display: 'block', marginTop: 14 }}>Confirm Password</label>
            <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} />
            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 20, padding: 12, background: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: 13, marginTop: 20 }}>
          <Link to="/" style={{ color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' }}>Back to login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
