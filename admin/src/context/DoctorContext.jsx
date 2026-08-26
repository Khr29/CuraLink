import { useState, useEffect } from "react";
import { toast } from 'react-toastify'
import { createContext } from "react";
import axios from 'axios'
import { installAuthInterceptor, registerTokenSetter } from "../utils/axiosAuth.js";
export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    // const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')4
    const [dToken, setDToken] = useState(localStorage.getItem('dToken') || '')
    const [dashData, setDashData] = useState(false)
     const [profileData, setProfileData] = useState(false)

    // Silently refreshes the 15-min access token using the httpOnly refresh
    // cookie whenever a request comes back 401.
    useEffect(() => {
        installAuthInterceptor(backendUrl)
        registerTokenSetter('dtoken', setDToken)
    }, [backendUrl])


    const [appointments, setAppointments] = useState([])
    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } })
            if (data.success) {
                setAppointments(data.appointments)
                console.log(data.appointments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            // res.json({success:false, message:error.message})
        }
    }

    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } })
            if (data.success) {
                setDashData(data.dashData)
                console.log(data.dashData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getProfileData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/doctor/profile',{headers:{dToken}})
            if(data.success){
                setProfileData(data.profileData)
                console.log(data.profileData)

            }
        } catch (error) {
             console.log(error)
            toast.error(error.message)
        }
    }

    // Submits the doctor's official reply to a patient review (one reply per review).
    const replyToReview = async (reviewId, text) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/review/doctor/' + reviewId + '/reply', { text }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
            return { success: false, message: error.message }
        }
    }

    // Edits the doctor's existing reply to a review.
    const editReviewReply = async (reviewId, text) => {
        try {
            const { data } = await axios.put(backendUrl + '/api/review/doctor/' + reviewId + '/reply', { text }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
            return { success: false, message: error.message }
        }
    }

    // ==========================
    // Hospital Affiliation
    // ==========================
    const [hospitals, setHospitals] = useState([])
    const [hospitalRequests, setHospitalRequests] = useState([])

    const getHospitalOptions = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/hospital/list')
            if (data.success) setHospitals(data.hospitals)
        } catch (error) {
            console.log(error)
        }
    }

    const getMyHospitalRequests = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/hospital-requests', { headers: { dToken } })
            if (data.success) {
                setHospitalRequests(data.requests)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const requestHospital = async (hospitalId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/request-hospital', { hospitalId }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
                getMyHospitalRequests()
                getProfileData()
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return { success: false }
        }
    }

    const leaveHospital = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/leave-hospital', {}, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
                getMyHospitalRequests()
                getProfileData()
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            return { success: false }
        }
    }

    const cancelHospitalRequest = async (requestId) => {
        try {
            const { data } = await axios.delete(backendUrl + '/api/doctor/hospital-requests/' + requestId, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
                getMyHospitalRequests()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const respondToInvite = async (requestId, accept) => {
        try {
            const { data } = await axios.patch(backendUrl + '/api/doctor/hospital-requests/' + requestId + '/respond', { accept }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.message)
                getMyHospitalRequests()
                getProfileData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const value = {
        dToken, setDToken,
        backendUrl,
        appointments, setAppointments, getAllAppointments,
        completeAppointment, cancelAppointment,
        dashData,setDashData,getDashData,
        profileData,setProfileData,getProfileData,
        replyToReview, editReviewReply,
        hospitals, getHospitalOptions,
        hospitalRequests, getMyHospitalRequests,
        requestHospital, leaveHospital, cancelHospitalRequest, respondToInvite
    }
    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}
export default DoctorContextProvider