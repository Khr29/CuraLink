import { useState } from "react";
import { toast } from 'react-toastify'
import { createContext } from "react";
import axios from 'axios'
export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    // const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')4
    const [dToken, setDToken] = useState(localStorage.getItem('dToken') || '')
    const [dashData, setDashData] = useState(false)
     const [profileData, setProfileData] = useState(false)


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

    const getProfileData = async (req,res) => {
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
 
    const value = {
        dToken, setDToken,
        backendUrl,
        appointments, setAppointments, getAllAppointments,
        completeAppointment, cancelAppointment,
        dashData,setDashData,getDashData,
        profileData,setProfileData,getProfileData
    }
    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}
export default DoctorContextProvider