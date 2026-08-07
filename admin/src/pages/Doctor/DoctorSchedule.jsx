import React, { useState, useContext, useCallback, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctorContext } from '../../context/DoctorContext'
import { CalendarClock, Lock } from 'lucide-react'
import PageHero from '../../components/PageHero'
import FormCard from '../../components/FormCard'
import ScheduleEditor from '../../components/ScheduleEditor'

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
    <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
  </div>
)

const DoctorSchedule = () => {
  const { dToken, backendUrl, profileData, getProfileData } = useContext(DoctorContext)

  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (dToken && !profileData) getProfileData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken])

  const fetchSchedule = useCallback(async () => {
    if (!profileData?._id) return
    setLoading(true)
    try {
      const { data } = await axios.get(`${backendUrl}/api/schedule/doctor/${profileData._id}`, { headers: { dToken } })
      if (data.success) setSchedule(data.schedule)
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }, [backendUrl, dToken, profileData?._id])

  useEffect(() => { fetchSchedule() }, [fetchSchedule])

  const canEdit = profileData && (profileData.employmentType === 'independent' || !profileData.hospitalId || Boolean(schedule?.doctorCanEdit))

  const handleSave = async (payload) => {
    setSaving(true)
    try {
      const { data } = await axios.put(`${backendUrl}/api/schedule/doctor/${profileData._id}`, payload, { headers: { dToken } })
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

  if (loading || !profileData) return <PageLoader />

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <PageHero
          icon={CalendarClock}
          title="My Schedule"
          description={canEdit
            ? "Set your shifts, breaks, slot duration, and unavailable dates."
            : "Your hospital manages this schedule. You can view it below, but editing is turned off."}
        />

        {!canEdit && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#B45309', borderRadius: 12, padding: '10px 16px', fontSize: 12.5, fontWeight: 600, marginBottom: 20 }}>
            <Lock size={14} /> View-only — ask your hospital to grant edit access if you need to make changes.
          </div>
        )}

        <FormCard title="Weekly Schedule" icon={CalendarClock}>
          <ScheduleEditor schedule={schedule} onSave={handleSave} saving={saving} readOnly={!canEdit} />
        </FormCard>
      </div>
    </div>
  )
}

export default DoctorSchedule
