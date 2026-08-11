import React, { useContext, useState, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const ForgotPassword = () => {
  const { backendUrl } = useContext(AppContext)
  const navigate = useNavigate()

  const [step, setStep] = useState('request') // 'request' | 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // A ref, not just the `submitting` state, guards the actual double-submit
  // check: two clicks fired faster than React can commit a re-render would
  // otherwise both read `submitting` as still false from the same stale
  // closure and both get through. Refs update synchronously, so the second
  // click always sees the first's lock. Shared by both steps since only one
  // form is ever visible/submittable at a time.
  const submittingRef = useRef(false)

  const requestCode = async (event) => {
    event.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/forgot-password`, { email })
      toast.success(data.message)
      setStep('reset')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const resetPassword = async (event) => {
    event.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/reset-password`, {
        email, otp, newPassword, confirmPassword,
      })
      if (data.success) {
        toast.success(data.message)
        navigate('/login')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className='min-h-[8vh] flex items-center mt-11'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>Reset Password</p>
        <p>{step === 'request' ? "We'll email you a 6-digit code." : `Enter the code sent to ${email}.`}</p>

        {step === 'request' ? (
          <form onSubmit={requestCode} className='w-full flex flex-col gap-3'>
            <div className='w-full'>
              <p>Email</p>
              <input
                className='border border-zinc-300 rounded w-full p-2 mt-1'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type='submit' disabled={submitting} className='bg-primary text-white w-full py-2 rounded-md text-base disabled:opacity-70 disabled:cursor-not-allowed'>
              {submitting ? 'Sending...' : 'Send reset code'}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className='w-full flex flex-col gap-3'>
            <div className='w-full'>
              <p>Verification Code</p>
              <input
                className='border border-zinc-300 rounded w-full p-2 mt-1'
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <div className='w-full'>
              <p>New Password</p>
              <input
                className='border border-zinc-300 rounded w-full p-2 mt-1'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className='w-full'>
              <p>Confirm Password</p>
              <input
                className='border border-zinc-300 rounded w-full p-2 mt-1'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type='submit' disabled={submitting} className='bg-primary text-white w-full py-2 rounded-md text-base disabled:opacity-70 disabled:cursor-not-allowed'>
              {submitting ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}

        <p>
          <Link to="/login" className='text-primary underline cursor-pointer'>Back to login</Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
