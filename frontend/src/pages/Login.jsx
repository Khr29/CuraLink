import React, { useContext, useEffect, useState, useCallback } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const Login = () => {

  const navigate = useNavigate()

  const { backendUrl, token, setToken } = useContext(AppContext)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)

  const { email, password } = formData

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {

      const { data } = await axios.post(`${backendUrl}/api/user/login`, { email, password, rememberMe })

      if (data.success) {
        localStorage.setItem("token", data.token)
        setToken(data.token)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (token) navigate('/dashboard')
  }, [token, navigate])

  return (
    <div className='min-h-[70vh] flex items-center justify-center py-12'>
      <Card className="w-full max-w-sm shadow-card-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-text-primary">Login</CardTitle>
          <CardDescription>Please log in to book appointment</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                value={password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <Label htmlFor="remember-me" className="gap-1.5 cursor-pointer select-none font-normal text-text-secondary">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                />
                Remember me
              </Label>
              <Link to="/forgot-password" className='text-primary underline cursor-pointer'>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="gradient" className="w-full mt-1">
              Login
            </Button>

            <p className="text-center text-sm text-text-muted">
              Create a new account?{" "}
              <Link to="/register" className='text-primary underline cursor-pointer'>
                Click here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
