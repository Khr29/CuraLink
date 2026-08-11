// import React, { useContext, useEffect, useState } from 'react'
// import { AppContext } from '../context/AppContext'
// import { toast } from 'react-toastify'
// import { useNavigate } from "react-router-dom";
// import axios from 'axios';

// const Login = () => {
//   const navigate = useNavigate();

//   const {backendUrl, token, setToken } = useContext(AppContext)

//   const [state, setState] = useState('Sign Up')

//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [name, setName] = useState('')

//   const onSubmitHandler = async (event) => {
//     event.preventDefault()

//     try {

//       if(state === 'Sign Up'){
//         const {data} =await axios.post(backendUrl + '/api/user/register', {name,password,email})
//         if(data.success){
//           localStorage.setItem('token',data.token)
//           setToken(data.token)
//         }else{
//           toast.error(data.message)
//         }
//       }
//       else{
//            const {data} =await axios.post(backendUrl + '/api/user/login', {password,email})
//         if(data.success){
//           localStorage.setItem('token',data.token)
//           setToken(data.token)
//         }else{
//           toast.error(data.message)
//         }
//       }
      
//     } catch (error) {
//       toast.error(error.message)
//     }
//   }

//   useEffect(() => {
//     if(token){
//       navigate('/')
//     }
//   },[token])
//   return (
//     <form onSubmit={onSubmitHandler} className='min-h-[8vh] flex items-center mt-11'>
//       <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
//         <p className='text-2xl font-semibold'>{state === 'Sign Up'? "Create Account" : "Login"}</p>
//         <p>Please {state === 'Sign Up' ? "sign up" : "log in"} to book appointment</p>

//         {
//           state === "Sign Up" && 
//           <div className='w-full'>
//           <p>Full Name</p>
//           <input className='border border-zinc-300 rounded w-full p-2 mt-1' type='text' onChange={(e) => setName(e.target.value)} value={name} required />
//         </div>
//         }

       

//          <div className='w-full'>
//           <p>Email</p>
//           <input  className='border border-zinc-300 rounded w-full p-2 mt-1' type='email' onChange={(e) => setEmail(e.target.value)} value={email} required />
//         </div>

//          <div className='w-full'>
//           <p>Password</p>
//           <input  className='border border-zinc-300 rounded w-full p-2 mt-1' type='password' onChange={(e) => setPassword(e.target.value)} value={password} required />
//         </div>
//         <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>{state === "Sign Up" ? "Create Account" : "Login"}</button>
//         {
//           state === "Sign Up"
//           ? <p>Already Have an Account? <span onClick={()=>setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
//           : <p>Create an new account? <span onClick={()=>setState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
//         }
//       </div>

//     </form>
//   )
// }

// export default Login

import React, { useContext, useEffect, useState, useCallback, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';

const Login = () => {

  const navigate = useNavigate()

  const { backendUrl, token, setToken } = useContext(AppContext)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // A ref, not just the `submitting` state, guards the actual double-submit
  // check: two clicks fired faster than React can commit a re-render would
  // otherwise both read `submitting` as still false from the same stale
  // closure and both get through. Refs update synchronously, so the second
  // click always sees the first's lock.
  const submittingRef = useRef(false)

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
    if (submittingRef.current) return
    submittingRef.current = true

    setSubmitting(true)
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
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (token) navigate('/dashboard')
  }, [token, navigate])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[8vh] flex items-center mt-11'>

      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>

        <p className='text-2xl font-semibold'>
          Login
        </p>

        <p>
          Please log in to book appointment
        </p>

        <div className='w-full'>
          <p>Email</p>
          <input
            name="email"
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type='email'
            value={email}
            onChange={handleChange}
            required
          />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input
            name="password"
            className='border border-zinc-300 rounded w-full p-2 mt-1'
            type='password'
            value={password}
            onChange={handleChange}
            required
          />
        </div>

        <div className='w-full flex items-center justify-between text-xs'>
          <label className='flex items-center gap-1.5 cursor-pointer select-none'>
            <input
              type='checkbox'
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className='cursor-pointer'
            />
            Remember me
          </label>
          <Link to="/forgot-password" className='text-primary underline cursor-pointer'>
            Forgot password?
          </Link>
        </div>

        <button
          type='submit'
          disabled={submitting}
          className='bg-primary text-white w-full py-2 rounded-md text-base disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        <p>
          Create a new account?{" "}
          <Link to="/register" className='text-primary underline cursor-pointer'>
            Click here
          </Link>
        </p>

      </div>
    </form>
  )
}

export default Login