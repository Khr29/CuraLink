// import axios from "axios";
// import { createContext, useState } from "react";
// import { toast } from "react-toastify";

// export const AdminContext = createContext()

// const AdminContextProvider = (props) => {

//     // const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken'):'')
//     const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '')

//     const [doctors, setDoctors] = useState([])
//     const [appointments,setAppointments] = useState([])
//     const [dashData, setDashData] = useState(false)
//     const backendUrl = import.meta.env.VITE_BACKEND_URL

//     const getAllDoctors = async () => {
//         try {
//             const {data} = await axios.post(backendUrl + '/api/admin/all-doctors' ,{}, {headers: { atoken: aToken }})
//             if(data.success){
//                 setDoctors(data.doctors)
//                 console.log(data.doctors)
//             }else{
//                 toast.error(data.message)
//             }
//         } catch (error) {
//             toast.error(error.message)
//         }
//     }

//     const changeAvailability = async (docId) => {
//         try {
//             const {data} = await axios.post(backendUrl + '/api/admin/change-availability',{docId}, {headers: { atoken: aToken }})
//             if(data.success){
//                 toast.success(data.message)
//                 getAllDoctors()
//             }else{
//                 toast.error(data.message)
//             }
//         } catch (error) {
//             toast.error(error.message)
//         }
//     }

//     const getAllAppointments = async () => {
//         try {
//             const {data} = await axios.get(backendUrl + '/api/admin/appointments',{headers: { atoken: aToken }})
//             if (data.success) {
//                 setAppointments(data.appointments)
                
//             }else{
//                 toast.error(data.message)
//             }
//         } catch (error) {
//          toast.error(error.message)   
//         }
//     }

//     const cancelAppointment = async (appointmentId) => {
//         try {
//             const {data} = await axios.post(backendUrl + '/api/admin/cancel-appointment',{appointmentId},{headers: { atoken: aToken }})
//             if(data.success){
//                 toast.success(data.message)
//                 getAllAppointments()
//             }else{
//                 toast.error(data.message)
//             }
//         } catch (error) {
//             toast.error(error.message)
            
//         }
//     }

//     const getDashData = async () =>{
//         try {
//             const {data}= await axios.get(backendUrl + '/api/admin/dashboard',{headers: { atoken: aToken }})
//             if(data.success){
//                 setDashData(data.dashData)
//             }else{
//                 toast.error(data.message)
//             }
            
//         } catch (error) {
//             toast.error(error.message)
//         }
//     }



//     const value = {
//         aToken,setAToken,
//         backendUrl,
//         doctors,getAllDoctors,changeAvailability,
//         appointments,setAppointments,getAllAppointments,
//         cancelAppointment,
//         getDashData,dashData

//     }
//     return(
//         <AdminContext.Provider value={value}>
//             {props.children}
//         </AdminContext.Provider>
//     )
// }
// export default AdminContextProvider


import axios from "axios";
import { createContext, useState, useCallback } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '')
    const [doctors, setDoctors] = useState([])
    const [appointments,setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    // 🔥 common config (avoid repeat)
    const config = {
          headers: { atoken: aToken }
    }

    // ✅ GET ALL DOCTORS (memoized)
    const getAllDoctors = useCallback(async () => {
        try {
            const {data} = await axios.post(backendUrl + '/api/admin/all-doctors', {}, config)

            if(data.success){
                setDoctors(data.doctors)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [aToken])


    // ✅ CHANGE AVAILABILITY (optimistic UI 🚀)
    const changeAvailability = async (docId) => {
        try {
            // 🔥 optimistic update (UI fast feel)
            // setDoctors(prev =>
            //     prev.map(doc =>
            //         doc._id === docId
            //             ? { ...doc, available: !doc.available }
            //             : doc
            //     )
            // )

            const {data} = await axios.post(
                backendUrl + '/api/admin/change-availability',
                {docId},
                config
            )

            if(data.success){
                toast.success(data.message)
                getAllDoctors()
            }else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }


    // ✅ GET ALL APPOINTMENTS
    const getAllAppointments = useCallback(async () => {
        try {
            const {data} = await axios.get(
                backendUrl + '/api/admin/appointments',
                config
            )

            if (data.success) {
                setAppointments(data.appointments)
            }else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }, [aToken])


    // ✅ CANCEL APPOINTMENT (optimistic 🚀)
    const cancelAppointment = async (appointmentId) => {
        try {

            // 🔥 instant UI update
            setAppointments(prev =>
                prev.map(app =>
                    app._id === appointmentId
                        ? { ...app, cancelled: true }
                        : app
                )
            )

            const {data} = await axios.post(
                backendUrl + '/api/admin/cancel-appointment',
                {appointmentId},
                config
            )

            if(data.success){
                toast.success(data.message)
            }else{
                toast.error(data.message)
                getAllAppointments() // fallback
            }

        } catch (error) {
            toast.error(error.message)
            getAllAppointments() // rollback
        }
    }


    // ✅ DASHBOARD
    const getDashData = useCallback(async () =>{
        try {
            const {data}= await axios.get(
                backendUrl + '/api/admin/dashboard',
                config
            )

            if(data.success){
                setDashData(data.dashData)
            }else{
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }, [aToken])


    const value = {
        aToken,setAToken,
        backendUrl,
        doctors,getAllDoctors,changeAvailability,
        appointments,setAppointments,getAllAppointments,
        cancelAppointment,
        getDashData,dashData
    }

    return(
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider