import React, { useContext, useState } from 'react'
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

  const requestCode = async (event) => {
    event.preventDefault()
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/forgot-password`, { email })
      toast.success(data.message)
      setStep('reset')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const resetPassword = async (event) => {
    event.preventDefault()
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
            <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>
              Send reset code
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
            <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>
              Reset password
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
