import React, { useState } from 'react'
import { Plus, X, Clock, Coffee, CalendarOff, Loader2, Save } from 'lucide-react'
import { formLabelStyle, formInputStyle, formFocusHandlers } from './formStyles'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SLOT_DURATIONS = [15, 20, 30, 60]

// A sensible starting draft for a doctor with no schedule configured yet —
// Mon-Fri 09:00-17:00, weekends off. Purely a UI starting point; nothing is
// persisted until Save is pressed.
const defaultWeeklyPattern = () =>
  DAY_NAMES.map((_, dayOfWeek) => ({
    dayOfWeek,
    isWorking: dayOfWeek >= 1 && dayOfWeek <= 5,
    shifts: dayOfWeek >= 1 && dayOfWeek <= 5 ? [{ startTime: '09:00', endTime: '17:00' }] : [],
    breaks: [],
  }))

// Merges a saved pattern onto a full 7-day skeleton so a partially-saved
// pattern still renders every day (missing days show as not-working).
const initialWeeklyPattern = (schedule) => {
  if (!schedule?.weeklyPattern?.length) return defaultWeeklyPattern()
  const byDay = new Map(schedule.weeklyPattern.map((d) => [d.dayOfWeek, d]))
  return DAY_NAMES.map((_, dayOfWeek) => byDay.get(dayOfWeek) || { dayOfWeek, isWorking: false, shifts: [], breaks: [] })
}

const timeInputStyle = { ...formInputStyle, height: 38, padding: '0 10px', fontSize: 12.5, width: 110 }

// `schedule`: the fetched doctorSchedule doc, or null if none exists yet.
// Callers only mount this once `schedule` has finished loading (both
// HospitalDoctorSchedule and DoctorSchedule show a spinner until then), so
// draft state is safely seeded once from props at mount — no need to
// re-sync via an effect afterward, since a post-save `schedule` update from
// the parent already matches what the user's local draft just submitted.
// `onSave(payload)`: called with { weeklyPattern, slotDurationMinutes, unavailableDates } on Save.
// `readOnly`: renders a plain summary instead of editable controls (the
// default for a hospital-employed doctor viewing their own schedule).
const ScheduleEditor = ({ schedule, onSave, saving = false, readOnly = false }) => {
  const [weeklyPattern, setWeeklyPattern] = useState(() => initialWeeklyPattern(schedule))
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(() => schedule?.slotDurationMinutes || 30)
  const [unavailableDates, setUnavailableDates] = useState(() => schedule?.unavailableDates || [])
  const [newDate, setNewDate] = useState('')

  const updateDay = (dayOfWeek, patch) => {
    setWeeklyPattern((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)))
  }

  const addShift = (dayOfWeek) => {
    updateDay(dayOfWeek, {
      shifts: [...weeklyPattern.find((d) => d.dayOfWeek === dayOfWeek).shifts, { startTime: '09:00', endTime: '17:00' }],
    })
  }
  const updateShift = (dayOfWeek, index, field, value) => {
    const day = weeklyPattern.find((d) => d.dayOfWeek === dayOfWeek)
    const shifts = day.shifts.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    updateDay(dayOfWeek, { shifts })
  }
  const removeShift = (dayOfWeek, index) => {
    const day = weeklyPattern.find((d) => d.dayOfWeek === dayOfWeek)
    updateDay(dayOfWeek, { shifts: day.shifts.filter((_, i) => i !== index) })
  }

  const addBreak = (dayOfWeek) => {
    const day = weeklyPattern.find((d) => d.dayOfWeek === dayOfWeek)
    updateDay(dayOfWeek, { breaks: [...day.breaks, { startTime: '13:00', endTime: '13:30', label: 'Break' }] })
  }
  const updateBreak = (dayOfWeek, index, field, value) => {
    const day = weeklyPattern.find((d) => d.dayOfWeek === dayOfWeek)
    const breaks = day.breaks.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    updateDay(dayOfWeek, { breaks })
  }
  const removeBreak = (dayOfWeek, index) => {
    const day = weeklyPattern.find((d) => d.dayOfWeek === dayOfWeek)
    updateDay(dayOfWeek, { breaks: day.breaks.filter((_, i) => i !== index) })
  }

  const addUnavailableDate = () => {
    if (!newDate || unavailableDates.includes(newDate)) return
    setUnavailableDates((prev) => [...prev, newDate].sort())
    setNewDate('')
  }
  const removeUnavailableDate = (date) => setUnavailableDates((prev) => prev.filter((d) => d !== date))

  const handleSave = () => onSave({ weeklyPattern, slotDurationMinutes, unavailableDates })

  if (readOnly) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>
          Slot duration: <strong style={{ color: '#0F172A' }}>{slotDurationMinutes} minutes</strong>
        </p>
        {weeklyPattern.map((day) => (
          <div key={day.dayOfWeek} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ width: 90, flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{DAY_NAMES[day.dayOfWeek]}</span>
            {!day.isWorking || day.shifts.length === 0 ? (
              <span style={{ fontSize: 12.5, color: '#94A3B8' }}>Not working</span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {day.shifts.map((s, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#2563EB', background: '#EFF6FF', padding: '4px 10px', borderRadius: 99 }}>
                    <Clock size={11} /> {s.startTime}–{s.endTime}
                  </span>
                ))}
                {day.breaks.map((b, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#B45309', background: '#FFFBEB', padding: '4px 10px', borderRadius: 99 }}>
                    <Coffee size={11} /> {b.label || 'Break'} {b.startTime}–{b.endTime}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {unavailableDates.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '4px 0 8px' }}>Unavailable Dates</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {unavailableDates.map((d) => (
                <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', padding: '4px 10px', borderRadius: 99 }}>
                  <CalendarOff size={11} /> {d}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ maxWidth: 220 }}>
        <label style={formLabelStyle}>Slot Duration</label>
        <select
          value={slotDurationMinutes}
          onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
          style={formInputStyle}
          {...formFocusHandlers}
        >
          {SLOT_DURATIONS.map((d) => <option key={d} value={d}>{d} minutes</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {weeklyPattern.map((day) => (
          <div key={day.dayOfWeek} style={{ border: '1px solid #E2E8F0', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: day.isWorking ? 12 : 0 }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{DAY_NAMES[day.dayOfWeek]}</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>{day.isWorking ? 'Working' : 'Off'}</span>
                <span style={{ position: 'relative', display: 'inline-block', width: 38, height: 21 }}>
                  <input type="checkbox" checked={day.isWorking} onChange={(e) => updateDay(day.dayOfWeek, { isWorking: e.target.checked })} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', inset: 0, background: day.isWorking ? '#16A34A' : '#CBD5E1', borderRadius: 99, transition: '0.2s' }}>
                    <span style={{ position: 'absolute', height: 15, width: 15, left: day.isWorking ? 20 : 3, bottom: 3, background: '#FFF', borderRadius: '50%', transition: '0.2s' }} />
                  </span>
                </span>
              </label>
            </div>

            {day.isWorking && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 6px' }}>Shifts</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {day.shifts.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="time" value={s.startTime} onChange={(e) => updateShift(day.dayOfWeek, i, 'startTime', e.target.value)} style={timeInputStyle} {...formFocusHandlers} />
                        <span style={{ color: '#94A3B8', fontSize: 12 }}>to</span>
                        <input type="time" value={s.endTime} onChange={(e) => updateShift(day.dayOfWeek, i, 'endTime', e.target.value)} style={timeInputStyle} {...formFocusHandlers} />
                        <button type="button" onClick={() => removeShift(day.dayOfWeek, i)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addShift(day.dayOfWeek)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, background: 'none', border: 'none', color: '#2563EB', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}>
                    <Plus size={12} /> Add shift
                  </button>
                </div>

                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 6px' }}>Breaks</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {day.breaks.map((b, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="time" value={b.startTime} onChange={(e) => updateBreak(day.dayOfWeek, i, 'startTime', e.target.value)} style={timeInputStyle} {...formFocusHandlers} />
                        <span style={{ color: '#94A3B8', fontSize: 12 }}>to</span>
                        <input type="time" value={b.endTime} onChange={(e) => updateBreak(day.dayOfWeek, i, 'endTime', e.target.value)} style={timeInputStyle} {...formFocusHandlers} />
                        <input type="text" value={b.label} placeholder="Label" onChange={(e) => updateBreak(day.dayOfWeek, i, 'label', e.target.value)} style={{ ...timeInputStyle, width: 100 }} {...formFocusHandlers} />
                        <button type="button" onClick={() => removeBreak(day.dayOfWeek, i)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addBreak(day.dayOfWeek)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, background: 'none', border: 'none', color: '#B45309', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}>
                    <Plus size={12} /> Add break
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <label style={formLabelStyle}>Unavailable Dates (holidays, leave)</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} style={{ ...formInputStyle, maxWidth: 200 }} {...formFocusHandlers} />
          <button type="button" onClick={addUnavailableDate} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', borderRadius: 12, border: '1.5px solid #E2E8F0', background: '#FFFFFF', color: '#2563EB', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            <Plus size={14} /> Add
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {unavailableDates.map((d) => (
            <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', padding: '4px 8px 4px 10px', borderRadius: 99 }}>
              <CalendarOff size={11} /> {d}
              <button type="button" onClick={() => removeUnavailableDate(d)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', display: 'flex', padding: 0 }}><X size={11} /></button>
            </span>
          ))}
        </div>
      </div>

      <button
        type="button" onClick={handleSave} disabled={saving}
        style={{
          alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 24px', borderRadius: 12, border: 'none',
          background: saving ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #14B8A6)',
          color: '#FFFFFF', fontSize: 13.5, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          boxShadow: saving ? 'none' : '0 8px 20px rgba(37,99,235,0.25)', fontFamily: 'Inter, sans-serif'
        }}
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        {saving ? 'Saving…' : 'Save Schedule'}
      </button>
    </div>
  )
}

export default ScheduleEditor
