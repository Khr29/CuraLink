import React, { useState, useContext, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { HospitalContext } from '../../context/HospitalContext'
import { CalendarClock, ArrowLeft, ShieldCheck } from 'lucide-react'
import PageHero from '../../components/PageHero'
import FormCard from '../../components/FormCard'
import ScheduleEditor from '../../components/ScheduleEditor'

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
    <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
  </div>
)

const HospitalDoctorSchedule = () => {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { backendUrl, hToken, doctors, getHospitalDoctors } = useContext(HospitalContext)

  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [togglingPermission, setTogglingPermission] = useState(false)

  const doctor = doctors.find((d) => d._id === doctorId)

  useEffect(() => {
    if (hToken && doctors.length === 0) getHospitalDoctors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  const fetchSchedule = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${backendUrl}/api/schedule/doctor/${doctorId}`, { headers: { htoken: hToken } })
      if (data.success) setSchedule(data.schedule)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }, [backendUrl, hToken, doctorId])

  useEffect(() => { if (hToken) fetchSchedule() }, [hToken, fetchSchedule])

  const handleSave = async (payload) => {
    setSaving(true)
    try {
      const { data } = await axios.put(`${backendUrl}/api/schedule/doctor/${doctorId}`, payload, { headers: { htoken: hToken } })
      if (data.success) {
        toast.success('Schedule updated')
        setSchedule(data.schedule)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setSaving(false)
    }
  }

  const togglePermission = async () => {
    setTogglingPermission(true)
    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/schedule/doctor/${doctorId}/permission`,
        { doctorCanEdit: !schedule?.doctorCanEdit },
        { headers: { htoken: hToken } }
      )
      if (data.success) {
        toast.success(data.schedule.doctorCanEdit ? 'Doctor can now edit their schedule' : 'Doctor edit access revoked')
        setSchedule(data.schedule)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setTogglingPermission(false)
    }
  }

  if (loading || !doctor) return <PageLoader />

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <button
          onClick={() => navigate(`/hospital-edit-doctor/${doctorId}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#2563EB', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 16, padding: 0, fontFamily: 'Inter, sans-serif' }}
        >
          <ArrowLeft size={14} /> Back to Dr. {doctor.name}
        </button>

        <PageHero icon={CalendarClock} title={`${doctor.name}'s Schedule`} description="Set shifts, breaks, slot duration, and unavailable dates. Patients can only book generated slots." />

        <FormCard
          title="Doctor Edit Access"
          icon={ShieldCheck}
          action={
            <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: togglingPermission ? 'default' : 'pointer' }}>
              <input type="checkbox" checked={Boolean(schedule?.doctorCanEdit)} disabled={togglingPermission} onChange={togglePermission} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{ position: 'absolute', inset: 0, background: schedule?.doctorCanEdit ? '#16A34A' : '#CBD5E1', borderRadius: 99, transition: '0.2s' }}>
                <span style={{ position: 'absolute', height: 18, width: 18, left: schedule?.doctorCanEdit ? 23 : 3, bottom: 3, background: '#FFF', borderRadius: '50%', transition: '0.2s' }} />
              </span>
            </label>
          }
        >
          <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>
            By default only your hospital can edit this schedule. Turn this on to let the doctor manage their own shifts and breaks.
          </p>
        </FormCard>

        <div style={{ height: 20 }} />

        <FormCard title="Weekly Schedule" icon={CalendarClock}>
          <ScheduleEditor schedule={schedule} onSave={handleSave} saving={saving} readOnly={false} />
        </FormCard>
      </div>
    </div>
  )
}

export default HospitalDoctorSchedule
