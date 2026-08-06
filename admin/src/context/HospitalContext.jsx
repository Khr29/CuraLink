import { useState, useCallback, useEffect } from "react";
import { toast } from 'react-toastify'
import { createContext } from "react";
import axios from 'axios'
import { installAuthInterceptor, registerTokenSetter } from "../utils/axiosAuth.js";

export const HospitalContext = createContext()

const HospitalContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [hToken, setHToken] = useState(localStorage.getItem('hToken') || '')

    const [hospitalProfile, setHospitalProfile] = useState(false)
    const [dashData, setDashData] = useState(false)
    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])

    // Silently refreshes the 15-min access token using the httpOnly refresh
    // cookie whenever a request comes back 401.
    useEffect(() => {
        installAuthInterceptor(backendUrl)
        registerTokenSetter('htoken', setHToken)
    }, [backendUrl])

    const config = { headers: { htoken: hToken } }

    const getHospitalProfile = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/hospital/self/profile', { headers: { htoken: hToken } })
            if (data.success) {
                setHospitalProfile(data.hospital)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, hToken])

    const getDashData = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/hospital/self/dashboard', { headers: { htoken: hToken } })
            if (data.success) {
                setDashData(data.dashData)
                setHospitalProfile(data.hospital)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, hToken])

    const getHospitalDoctors = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/hospital/self/doctors', { headers: { htoken: hToken } })
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, hToken])

    const deleteHospitalDoctor = useCallback(async (doctorId) => {
        try {
            const { data } = await axios.delete(backendUrl + '/api/hospital/self/doctors/' + doctorId, { headers: { htoken: hToken } })
            if (data.success) {
                toast.success(data.message)
                getHospitalDoctors()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, hToken, getHospitalDoctors])

    const toggleDoctorAvailability = useCallback(async (doctorId, nextAvailable) => {
        try {
            const formData = new FormData()
            formData.append('available', nextAvailable)
            const { data } = await axios.put(
                backendUrl + '/api/hospital/self/doctors/' + doctorId,
                formData,
                { headers: { htoken: hToken } }
            )
            if (data.success) {
                getHospitalDoctors()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, hToken, getHospitalDoctors])

    const getHospitalAppointments = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/hospital/self/appointments', { headers: { htoken: hToken } })
            if (data.success) {
                setAppointments(data.appointments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, hToken])

    // Submits the hospital's official reply to a patient review (one reply per review).
    const replyToReview = useCallback(async (reviewId, text) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/review/hospital/' + reviewId + '/reply', { text }, { headers: { htoken: hToken } })
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
    }, [backendUrl, hToken])

    // Edits the hospital's existing reply to a review.
    const editReviewReply = useCallback(async (reviewId, text) => {
        try {
            const { data } = await axios.put(backendUrl + '/api/review/hospital/' + reviewId + '/reply', { text }, { headers: { htoken: hToken } })
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
    }, [backendUrl, hToken])

    // ==========================
    // Doctor Requests (join/transfer inbox + invites sent)
    // ==========================
    const [doctorRequests, setDoctorRequests] = useState([])
    const [allDoctors, setAllDoctors] = useState([])

    const getDoctorRequests = useCallback(async (status) => {
        try {
            const { data } = await axios.get(backendUrl + '/api/hospital/self/doctor-requests', {
                headers: { htoken: hToken },
                params: status ? { status } : {},
            })
            if (data.success) {
                setDoctorRequests(data.requests)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, hToken])

    const approveDoctorRequest = useCallback(async (requestId) => {
        try {
            const { data } = await axios.patch(backendUrl + '/api/hospital/self/doctor-requests/' + requestId + '/approve', {}, { headers: { htoken: hToken } })
            if (data.success) {
                toast.success(data.message)
                getDoctorRequests()
                getHospitalDoctors()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, hToken, getDoctorRequests, getHospitalDoctors])

    const rejectDoctorRequest = useCallback(async (requestId, reason) => {
        try {
            const { data } = await axios.patch(backendUrl + '/api/hospital/self/doctor-requests/' + requestId + '/reject', { reason }, { headers: { htoken: hToken } })
            if (data.success) {
                toast.success(data.message)
                getDoctorRequests()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, hToken, getDoctorRequests])

    const getAllDoctorsForInvite = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) setAllDoctors(data.doctors)
        } catch (error) {
            console.log(error)
        }
    }, [backendUrl])

    const inviteDoctor = useCallback(async (doctorId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/hospital/self/invite-doctor', { doctorId }, { headers: { htoken: hToken } })
            if (data.success) {
                toast.success(data.message)
                getDoctorRequests()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, hToken, getDoctorRequests])

    const value = {
        backendUrl,
        hToken, setHToken,
        config,
        hospitalProfile, setHospitalProfile, getHospitalProfile,
        dashData, setDashData, getDashData,
        doctors, setDoctors, getHospitalDoctors, deleteHospitalDoctor, toggleDoctorAvailability,
        appointments, setAppointments, getHospitalAppointments,
        replyToReview, editReviewReply,
        doctorRequests, getDoctorRequests, approveDoctorRequest, rejectDoctorRequest,
        allDoctors, getAllDoctorsForInvite, inviteDoctor,
    }

    return (
        <HospitalContext.Provider value={value}>
            {props.children}
        </HospitalContext.Provider>
    )
}
export default HospitalContextProvider
