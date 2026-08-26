import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'
import { installAuthInterceptor, registerUserTokenSetter } from '../utils/axiosAuth.js'

// create context
export const AppContext = createContext()


const AppContextProvider = (props) => {


    const currencySymbol = '$'

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    // VITE_BACKEND_URL is inlined at build time — a missing/stale value here
    // isn't a runtime bug to catch-and-continue from, it means every API call
    // below silently resolves against the frontend's own origin (or "undefined/...")
    // instead of the backend. Fail loudly in the console so a bad build's env
    // config is obvious immediately instead of surfacing as "0 doctors" with no clue why.
    if (!backendUrl) {
      console.error(
        '[CuraLink] VITE_BACKEND_URL is not set — this build has no backend to call. ' +
        'Set VITE_BACKEND_URL in the frontend host\'s build environment and redeploy.'
      )
    } else if (/^https?:\/\/localhost/i.test(backendUrl) && import.meta.env.PROD) {
      console.error(
        `[CuraLink] Production build is configured with a localhost backend (${backendUrl}). ` +
        'Set VITE_BACKEND_URL to the deployed backend URL and redeploy.'
      )
    }

      const [doctors, setDoctors] = useState([])
      const [hospitals, setHospitals] = useState([])
      const [platformStats, setPlatformStats] = useState(null)
      const [token, setToken] = useState(localStorage.getItem('token')? localStorage.getItem('token'): false)
      const [userData, setUserData] = useState(false)

      // Silently refreshes the 15-min access token using the httpOnly
      // refresh cookie whenever a request comes back 401, so the short TTL
      // never surfaces as an unexpected logout.
      useEffect(() => {
        installAuthInterceptor(backendUrl)
        registerUserTokenSetter(setToken)
      }, [backendUrl])



    const getDoctorsData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/doctor/list')
            if(data.success){
                setDoctors(data.doctors)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getHospitalsData = async () => {
    try {

        const { data } = await axios.get(
            backendUrl + "/api/hospital/list"
        )

        if (data.success) {
            setHospitals(data.hospitals)
        }

    } catch (error) {
        console.log(error)
        toast.error(error.message)
    }
}

    // Live homepage stats (patients, doctors, hospitals, appointments,
    // reviews, average rating). Fetched once and shared via context so
    // every homepage section reads the same numbers with a single request.
    const getPlatformStats = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/stats')
            if (data.success) {
                setPlatformStats(data.stats)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const loadUserProfileData = async () => {
        try {

            const {data} =await axios.get(backendUrl + '/api/user/get-profile', {headers:{token}})
            if(data.success){
                setUserData(data.userData)
            }else{
                // Token was rejected by the backend (expired/invalid/stale secret) -
                // clear it instead of leaving the user stuck with a token that will
                // never work, so they can simply log in again.
                localStorage.removeItem('token')
                setToken(false)
                toast.error(data.message)
            }

        } catch (error) {
             console.log(error)
            toast.error(error.message)
        }
    }

      const value = {

    doctors,
    getDoctorsData,

    hospitals,
    getHospitalsData,

    platformStats,
    getPlatformStats,

    currencySymbol,

    setToken,
    token,

    backendUrl,

    userData,
    setUserData,

    loadUserProfileData
}
    useEffect(()=> {
        getDoctorsData()
        getHospitalsData()
        getPlatformStats()
    },[])

    useEffect(() => {
        if(token){
            loadUserProfileData()
        }else{
            setUserData(false)
        }
    },[token])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider