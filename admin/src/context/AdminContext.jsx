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

    const [hospitals, setHospitals] = useState([])

    const [reviews, setReviews] = useState([])

    const [auditLogs, setAuditLogs] = useState([])
    const [auditLogsPagination, setAuditLogsPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 })

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

    
    const getAllHospitals = useCallback(async () => {
    try {

        const { data } = await axios.get(
            backendUrl + "/api/admin/all-hospitals",
            config
        )

        if (data.success) {
            setHospitals(data.hospitals)
        } else {
            toast.error(data.message)
        }

    } catch (error) {
        toast.error(error.message)
    }
}, [aToken])


const deleteHospital = async (hospitalId) => {
    try {

        const { data } = await axios.delete(
            backendUrl + "/api/admin/delete-hospital/" + hospitalId,
            config
        )

        if (data.success) {
            toast.success(data.message)
            getAllHospitals()
        } else {
            toast.error(data.message)
        }

    } catch (error) {
        toast.error(error.message)
    }
}


const changeHospitalStatus = async (hospitalId) => {
    try {

        const { data } = await axios.patch(
           backendUrl + "/api/admin/hospital-status/" + hospitalId,
            {},
            config
        )

        if (data.success) {
            toast.success(data.message)
            getAllHospitals()
        } else {
            toast.error(data.message)
        }

    } catch (error) {
        toast.error(error.message)
    }
}


    // ✅ DELETE DOCTOR
    const deleteDoctor = async (docId) => {
        try {
            const { data } = await axios.delete(
                backendUrl + '/api/admin/delete-doctor/' + docId,
                config
            )

            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }


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


    // ✅ GET ALL REVIEWS (moderation)
    const getAllReviews = useCallback(async () => {
        try {
            const { data } = await axios.get(
                backendUrl + '/api/review/admin/all?limit=100',
                config
            )

            if (data.success) {
                setReviews(data.reviews)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }, [aToken])


    const toggleReviewVisibility = async (reviewId) => {
        try {
            const { data } = await axios.patch(
                backendUrl + '/api/review/admin/' + reviewId + '/visibility',
                {},
                config
            )

            if (data.success) {
                toast.success(data.message)
                getAllReviews()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }


    const replyToReview = async (reviewId, reply) => {
        try {
            const { data } = await axios.patch(
                backendUrl + '/api/review/admin/' + reviewId + '/reply',
                { reply },
                config
            )

            if (data.success) {
                toast.success(data.message)
                getAllReviews()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }


    const deleteReview = async (reviewId) => {
        try {
            const { data } = await axios.delete(
                backendUrl + '/api/review/admin/' + reviewId,
                config
            )

            if (data.success) {
                toast.success(data.message)
                getAllReviews()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }


    // ✅ AUDIT LOGS (paginated + filterable)
    const getAuditLogs = useCallback(async (params = {}) => {
        try {
            const { data } = await axios.get(
                backendUrl + '/api/admin/audit-logs',
                { ...config, params }
            )

            if (data.success) {
                setAuditLogs(data.logs)
                setAuditLogsPagination(data.pagination)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }, [aToken])


    const exportAuditLogs = async (params = {}) => {
        try {
            const response = await axios.get(
                backendUrl + '/api/admin/audit-logs/export',
                { ...config, params, responseType: 'blob' }
            )

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `audit-logs-${Date.now()}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

        } catch (error) {
            toast.error(error.message || 'Export failed')
        }
    }


    const value = {
    aToken,
    setAToken,

    backendUrl,

    // Doctors
    doctors,
    getAllDoctors,
    changeAvailability,
    deleteDoctor,

    // Hospitals
    hospitals,
    setHospitals,
    getAllHospitals,
    deleteHospital,
    changeHospitalStatus,

    // Appointments
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,

    // Reviews
    reviews,
    getAllReviews,
    toggleReviewVisibility,
    replyToReview,
    deleteReview,

    // Dashboard
    getDashData,
    dashData,

    // Audit Logs
    auditLogs,
    auditLogsPagination,
    getAuditLogs,
    exportAuditLogs,
}

    return(
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}

export default AdminContextProvider