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
    const [pharmacyScanLog, setPharmacyScanLog] = useState([])
    const [pharmacyScanLogPagination, setPharmacyScanLogPagination] = useState(null)

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

    // The pharmacy's own append-only scan/security log — every scan attempt
    // it made (verified, dispensed, dispense rejected, or unauthorized/not-
    // found), read-only. There is no update/delete counterpart by design.
    const getPharmacyScanLog = useCallback(async (params = {}) => {
        try {
            const { data } = await axios.get(backendUrl + '/api/medical-records/pharmacy/scan-log', {
                headers: { ptoken: pToken },
                params,
            })
            if (data.success) {
                setPharmacyScanLog(data.logs)
                setPharmacyScanLogPagination(data.pagination)
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
            return { success: false }
        }
    }, [backendUrl, pToken])

    // Looks up a prescription by its verification token (scanned via camera,
    // or pasted from the verify link) — the AUTHORIZED view, richer than the
    // public /verify/:token page, but still never the patient's diagnosis,
    // notes, attachments, or unrelated medical records.
    const lookupPrescription = useCallback(async (token) => {
        try {
            // A scanned QR that isn't a genuine CuraLink verify link can be
            // arbitrary text — a URL to some other site, plain text, anything
            // — and may contain "/" or other characters that would otherwise
            // split across multiple path segments and get misrouted by Express
            // before ever reaching pharmacyVerifyPrescription's real 404 JSON.
            // Encoding keeps it a single opaque path segment either way.
            const { data } = await axios.get(backendUrl + '/api/medical-records/pharmacy/verify/' + encodeURIComponent(token), { headers: { ptoken: pToken } })
            if (data.success) {
                setPharmacyLookupResult(data.prescription)
            } else {
                setPharmacyLookupResult(null)
                toast.error(data.message)
            }
            return data
        } catch (error) {
            setPharmacyLookupResult(null)
            // A "not found" token is a 404 (medicalRecordController.js#pharmacyVerifyPrescription),
            // so axios throws instead of resolving with data.success===false — the
            // response body (including `reason`, which PharmacyScan.jsx keys off of
            // to distinguish an invalid QR from an ordinary network error) still
            // needs to be surfaced from here, not swallowed.
            const body = error.response?.data
            toast.error(body?.message || error.message)
            return { success: false, message: body?.message, reason: body?.reason }
        }
    }, [backendUrl, pToken])

    // Dispenses `quantity` units of the medicine at `medicineIndex` in THIS
    // action (not the new total) — supports partial dispensing across
    // multiple visits. The backend rejects (success: false) if quantity
    // exceeds what's actually remaining, so the toast here surfaces that
    // rejection with the server's specific "only N remaining" message.
    const dispensePrescription = useCallback(async (token, medicineIndex, quantity, notes) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/medical-records/pharmacy/dispense/' + token,
                { medicineIndex, quantity, notes },
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
        pharmacyScanLog, pharmacyScanLogPagination, getPharmacyScanLog,
        pharmacyLookupResult, setPharmacyLookupResult, lookupPrescription, dispensePrescription,
    }

    return (
        <PharmacyContext.Provider value={value}>
            {props.children}
        </PharmacyContext.Provider>
    )
}
export default PharmacyContextProvider
