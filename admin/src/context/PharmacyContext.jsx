import { useState, useCallback, useEffect } from "react";
import { toast } from 'react-toastify'
import { createContext } from "react";
import axios from 'axios'
import { installAuthInterceptor, registerTokenSetter } from "../utils/axiosAuth.js";

export const PharmacyContext = createContext()

const PharmacyContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [pToken, setPToken] = useState(localStorage.getItem('pToken') || '')

    const [pharmacyProfile, setPharmacyProfile] = useState(false)
    const [pharmacyStats, setPharmacyStats] = useState(null)
    const [pharmacyHistory, setPharmacyHistory] = useState([])
    const [pharmacyLookupResult, setPharmacyLookupResult] = useState(null)

    // Silently refreshes the 15-min access token using the httpOnly refresh
    // cookie whenever a request comes back 401.
    useEffect(() => {
        installAuthInterceptor(backendUrl)
        registerTokenSetter('ptoken', setPToken)
    }, [backendUrl])

    const config = { headers: { ptoken: pToken } }

    const getPharmacyProfile = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/pharmacy/self/profile', { headers: { ptoken: pToken } })
            if (data.success) {
                setPharmacyProfile(data.pharmacy)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, pToken])

    const updatePharmacyProfile = useCallback(async (updateData) => {
        try {
            const { data } = await axios.put(backendUrl + '/api/pharmacy/self/profile', updateData, { headers: { ptoken: pToken } })
            if (data.success) {
                toast.success(data.message)
                setPharmacyProfile(data.pharmacy)
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
            return { success: false }
        }
    }, [backendUrl, pToken])

    const changePharmacyPassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/pharmacy/self/password',
                { currentPassword, newPassword, confirmPassword },
                { headers: { ptoken: pToken } }
            )
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
            return { success: false }
        }
    }, [backendUrl, pToken])

    const getPharmacyStats = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/medical-records/pharmacy/stats', { headers: { ptoken: pToken } })
            if (data.success) {
                setPharmacyStats(data.stats)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, pToken])

    const getPharmacyHistory = useCallback(async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/medical-records/pharmacy/history', { headers: { ptoken: pToken } })
            if (data.success) {
                setPharmacyHistory(data.history)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [backendUrl, pToken])

    // Looks up a prescription by its verification token (scanned via camera,
    // or pasted from the verify link) — the AUTHORIZED view, richer than the
    // public /verify/:token page, but still never the patient's diagnosis,
    // notes, attachments, or unrelated medical records.
    const lookupPrescription = useCallback(async (token) => {
        try {
            const { data } = await axios.get(backendUrl + '/api/medical-records/pharmacy/verify/' + token, { headers: { ptoken: pToken } })
            if (data.success) {
                setPharmacyLookupResult(data.prescription)
            } else {
                setPharmacyLookupResult(null)
                toast.error(data.message)
            }
            return data
        } catch (error) {
            setPharmacyLookupResult(null)
            toast.error(error.response?.data?.message || error.message)
            return { success: false }
        }
    }, [backendUrl, pToken])

    const dispensePrescription = useCallback(async (token, status, notes) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/medical-records/pharmacy/dispense/' + token,
                { status, notes },
                { headers: { ptoken: pToken } }
            )
            if (data.success) {
                toast.success(data.message)
                await lookupPrescription(token)
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
            return { success: false }
        }
    }, [backendUrl, pToken, lookupPrescription])

    const value = {
        backendUrl,
        pToken, setPToken,
        config,
        pharmacyProfile, setPharmacyProfile, getPharmacyProfile, updatePharmacyProfile, changePharmacyPassword,
        pharmacyStats, getPharmacyStats,
        pharmacyHistory, getPharmacyHistory,
        pharmacyLookupResult, setPharmacyLookupResult, lookupPrescription, dispensePrescription,
    }

    return (
        <PharmacyContext.Provider value={value}>
            {props.children}
        </PharmacyContext.Provider>
    )
}
export default PharmacyContextProvider
