import { useState, useCallback } from "react";
import { toast } from 'react-toastify'
import { createContext } from "react";
import axios from 'axios'

export const HospitalContext = createContext()

const HospitalContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [hToken, setHToken] = useState(localStorage.getItem('hToken') || '')

    const [hospitalProfile, setHospitalProfile] = useState(false)
    const [dashData, setDashData] = useState(false)
    const [doctors, setDoctors] = useState([])
    const [appointments, setAppointments] = useState([])

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

    const value = {
        backendUrl,
        hToken, setHToken,
        config,
        hospitalProfile, setHospitalProfile, getHospitalProfile,
        dashData, setDashData, getDashData,
        doctors, setDoctors, getHospitalDoctors, deleteHospitalDoctor, toggleDoctorAvailability,
        appointments, setAppointments, getHospitalAppointments,
    }

    return (
        <HospitalContext.Provider value={value}>
            {props.children}
        </HospitalContext.Provider>
    )
}
export default HospitalContextProvider
