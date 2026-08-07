import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className='min-h-[70vh] flex items-center justify-center py-12'>
      <Card className="w-full max-w-sm shadow-card-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-text-primary">Reset Password</CardTitle>
          <CardDescription>
            {step === 'request' ? "We'll email you a 6-digit code." : `Enter the code sent to ${email}.`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'request' ? (
            <form onSubmit={requestCode} className='flex flex-col gap-4'>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fp-email">Email</Label>
                <Input
                  id="fp-email"
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="gradient" className="w-full">
                Send reset code
              </Button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className='flex flex-col gap-4'>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fp-otp">Verification Code</Label>
                <Input
                  id="fp-otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fp-new-password">New Password</Label>
                <Input
                  id="fp-new-password"
                  type='password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fp-confirm-password">Confirm Password</Label>
                <Input
                  id="fp-confirm-password"
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="gradient" className="w-full">
                Reset password
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-text-muted mt-4">
            <Link to="/login" className='text-primary underline cursor-pointer'>Back to login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword
