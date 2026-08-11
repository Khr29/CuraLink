import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HospitalContext } from '../../context/HospitalContext'
import {
  ArrowLeft,
  Mail,
  Phone,
  Stethoscope,
  FileText,
  Pill,
  Paperclip,
  Lock,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Droplet,
  AlertTriangle,
  UserRound,
  ShieldAlert,
  LayoutGrid,
  ClipboardList,
  History as HistoryIcon,
  StickyNote,
  Image as ImageIcon,
  File as FileIcon,
  Eye,
} from 'lucide-react'
import EmptyState from '../../components/EmptyState'

const months = [' ', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const formatSlotDate = (slotDate) => {
  if (!slotDate) return ''
  const [d, m, y] = slotDate.split('_')
  return `${d} ${months[Number(m)]} ${y}`
}
const formatDateTime = (value) => {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return { date: '—', time: '' }
  return {
    date: d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  }
}
const calculateAge = (dob) => {
  if (!dob || dob === 'Not Selected') return null
  const birthDate = new Date(dob)
  if (Number.isNaN(birthDate.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
  return age >= 0 ? age : null
}
const attachmentIcon = (fileType) => {
  const t = (fileType || '').toLowerCase()
  if (t.includes('pdf')) return FileText
  if (t.includes('image')) return ImageIcon
  return FileIcon
}

const STATUS_STYLES = {
  cancelled: { icon: XCircle, color: '#EF4444', bg: '#FEF2F2', label: 'Cancelled' },
  completed: { icon: CheckCircle2, color: '#16A34A', bg: '#F0FDF4', label: 'Completed' },
  upcoming: { icon: Clock, color: '#2563EB', bg: '#EFF6FF', label: 'Upcoming' },
}
const appointmentStatus = (appt) => (appt.cancelled ? 'cancelled' : appt.isCompleted ? 'completed' : 'upcoming')

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.upcoming
  const StatIcon = s.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap' }}>
      <StatIcon size={11} /> {s.label}
    </span>
  )
}

const RecordStatusBadge = ({ status }) =>
  status === 'finalized' ? (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: '#B45309', background: '#FFFBEB', padding: '3px 9px', borderRadius: 99, whiteSpace: 'nowrap' }}>
      <Lock size={10} /> Finalized
    </span>
  ) : (
    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', background: '#F1F5F9', padding: '3px 9px', borderRadius: 99, whiteSpace: 'nowrap' }}>Draft</span>
  )

const SectionCard = (props) => (
  <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', overflow: 'hidden', marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <props.icon size={16} color="#2563EB" />
        <p style={{ fontWeight: 700, color: '#0F172A', fontSize: 14, margin: 0 }}>{props.title}</p>
      </div>
      {props.action}
    </div>
    <div style={{ padding: 24 }}>{props.children}</div>
  </div>
)

const FactCell = (props) => (
  <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: '10px 14px' }}>
    <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
      <props.icon size={11} /> {props.label}
    </p>
    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{props.value || '—'}</p>
  </div>
)

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'diagnoses', label: 'Diagnoses', icon: Stethoscope },
  { key: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { key: 'notes', label: 'Doctor Notes', icon: StickyNote },
  { key: 'attachments', label: 'Attachments', icon: Paperclip },
  { key: 'timeline', label: 'Timeline', icon: ClipboardList },
  { key: 'history', label: 'History', icon: HistoryIcon },
]

const HospitalPatientDetail = () => {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const {
    hToken, patientDetail, setPatientDetail, getHospitalPatientDetail,
    hospitalProfile, getHospitalProfile,
  } = useContext(HospitalContext)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [scrollTarget, setScrollTarget] = useState(null)
  const recordRefs = useRef({})

  useEffect(() => {
    // Guards against a slower response for the PREVIOUS patientId landing
    // after a newer one and overwriting patientDetail/notFound with the
    // wrong patient's data — e.g. clicking through two patients quickly.
    let cancelled = false
    setPatientDetail(null)
    if (!hToken) return undefined
    getHospitalPatientDetail(patientId).then((res) => {
      if (cancelled) return
      if (!res?.success) setNotFound(true)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [hToken, patientId, getHospitalPatientDetail, setPatientDetail])

  useEffect(() => {
    if (hToken) getHospitalProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  useEffect(() => {
    if (!scrollTarget) return
    const el = recordRefs.current[scrollTarget]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setScrollTarget(null)
  }, [activeTab, scrollTarget])

  const { patient, appointments, records, doctors } = patientDetail || {}

  const timelineEvents = useMemo(() => {
    if (!appointments || !records) return []
    const recordByAppointment = new Map(records.map((r) => [r.appointmentId?.toString?.() || r.appointmentId, r]))
    const apptEvents = appointments.map((appt) => ({
      type: 'appointment',
      date: appt.date,
      key: `appt-${appt._id}`,
      appt,
      record: recordByAppointment.get(appt._id),
    }))
    return apptEvents.sort((a, b) => (b.date || 0) - (a.date || 0))
  }, [appointments, records])

  const viewRecord = (record) => {
    if (!record) return
    setActiveTab('diagnoses')
    setScrollTarget(record._id)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
      </div>
    )
  }

  if (notFound || !patientDetail) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '36px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24 }}>
          <EmptyState icon={FileText} title="Patient not found" subtitle="This patient has no appointment history at your hospital." />
        </div>
      </div>
    )
  }

  const age = calculateAge(patient.dob)
  const patientCode = `#${String(patient._id).slice(-8).toUpperCase()}`
  const diagnosedRecords = records.filter((r) => r.diagnosis?.trim())
  const prescribedRecords = records.filter((r) => r.prescription?.length > 0)
  const notedRecords = records.filter((r) => r.notes?.trim())
  const allAttachments = records.flatMap((r) => (r.attachments || []).map((a) => ({ ...a, record: r })))
  const historyRecords = records.filter((r) => r.versions?.length > 0)
  const latestPrescriptionRecord = prescribedRecords[0]

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <button
          onClick={() => navigate('/hospital-patients')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#2563EB', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 20, padding: 0, fontFamily: 'Inter, sans-serif' }}
        >
          <ArrowLeft size={14} /> Back to Patients
        </button>

        {/* ══════════ PATIENT SUMMARY CARD ══════════ */}
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 28,
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 75%, #14B8A6 100%)',
          padding: '32px', marginBottom: 28, boxShadow: '0 24px 60px rgba(15,23,42,0.28)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
            <img src={patient.image} alt={patient.name} style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.85)', flexShrink: 0 }} />
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px' }}>{patient.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                  <Mail size={13} /> {patient.email}
                </span>
                {patient.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                    <Phone size={13} /> {patient.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            <FactCell icon={UserRound} label="Patient ID" value={patientCode} />
            <FactCell icon={CalendarDays} label="Age" value={age !== null ? `${age} yrs` : '—'} />
            <FactCell icon={UserRound} label="Gender" value={patient.gender && patient.gender !== 'Not Selected' ? patient.gender : '—'} />
            <FactCell icon={Droplet} label="Blood Group" value={patient.bloodGroup} />
            <FactCell icon={AlertTriangle} label="Allergies" value={patient.medical?.allergies} />
            <FactCell icon={ShieldAlert} label="Emergency Contact" value={patient.emergencyContact?.name ? `${patient.emergencyContact.name}${patient.emergencyContact.phone ? ' · ' + patient.emergencyContact.phone : ''}` : ''} />
            <FactCell icon={Stethoscope} label="Assigned Doctor" value={doctors.length ? (doctors.length === 1 ? doctors[0].name : `${doctors[0].name} +${doctors.length - 1}`) : ''} />
            <FactCell icon={Building2} label="Hospital" value={hospitalProfile?.name} />
          </div>
        </div>

        {/* ══════════ TABS ══════════ */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
          {TABS.map((tab) => {
            const TabIcon = tab.icon
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 12,
                  border: active ? 'none' : '1px solid #E2E8F0',
                  background: active ? 'linear-gradient(135deg, #2563EB, #14B8A6)' : '#FFFFFF',
                  color: active ? '#FFFFFF' : '#475569',
                  fontSize: 12.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                  fontFamily: 'Inter, sans-serif', boxShadow: active ? '0 6px 16px rgba(37,99,235,0.28)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <TabIcon size={14} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* ══════════ OVERVIEW ══════════ */}
        {activeTab === 'overview' && (
          <>
            <SectionCard icon={Stethoscope} title={`Assigned Doctors (${doctors.length})`}>
              {doctors.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>No doctors on record.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {doctors.map((doc) => (
                    <div key={doc._id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '10px 14px' }}>
                      <img src={doc.image} alt={doc.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{doc.name}</p>
                        <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>{doc.speciality}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {latestPrescriptionRecord && (
              <SectionCard icon={Pill} title="Latest Prescription" action={<RecordStatusBadge status={latestPrescriptionRecord.status} />}>
                <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 14px' }}>
                  Dr. {latestPrescriptionRecord.doctorId?.name} · {formatDateTime(latestPrescriptionRecord.createdAt).date}
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#94A3B8', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '0 10px 8px 0' }}>Medicine</th>
                        <th style={{ padding: '0 10px 8px' }}>Dosage</th>
                        <th style={{ padding: '0 10px 8px' }}>Duration</th>
                        <th style={{ padding: '0 0 8px' }}>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestPrescriptionRecord.prescription.map((p, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px 10px 10px 0', fontWeight: 700, color: '#0F172A' }}>{p.medicine}</td>
                          <td style={{ padding: '10px' }}>{p.dosage || '—'}</td>
                          <td style={{ padding: '10px' }}>{p.duration || '—'}</td>
                          <td style={{ padding: '10px 0', color: '#64748B' }}>{p.instructions || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            )}

            <SectionCard icon={CalendarDays} title={`Appointment History (${appointments.length})`}>
              {appointments.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>No appointments on record.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: '#94A3B8', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '0 10px 10px 0' }}>Doctor</th>
                        <th style={{ padding: '0 10px 10px' }}>Hospital</th>
                        <th style={{ padding: '0 10px 10px' }}>Status</th>
                        <th style={{ padding: '0 10px 10px' }}>Date</th>
                        <th style={{ padding: '0 0 10px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => {
                        const record = records.find((r) => (r.appointmentId?.toString?.() || r.appointmentId) === appt._id)
                        return (
                          <tr key={appt._id} style={{ borderTop: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 10px 12px 0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <img src={appt.docData?.image} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                <span style={{ fontWeight: 700, color: '#0F172A' }}>{appt.docData?.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 10px', color: '#64748B' }}>{hospitalProfile?.name || '—'}</td>
                            <td style={{ padding: '12px 10px' }}><StatusBadge status={appointmentStatus(appt)} /></td>
                            <td style={{ padding: '12px 10px', color: '#64748B', whiteSpace: 'nowrap' }}>{formatSlotDate(appt.slotDate)} · {appt.slotTime}</td>
                            <td style={{ padding: '12px 0', textAlign: 'right' }}>
                              {record ? (
                                <button
                                  onClick={() => viewRecord(record)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EFF6FF', border: 'none', color: '#2563EB', fontSize: 11.5, fontWeight: 700, padding: '6px 12px', borderRadius: 99, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                                >
                                  <Eye size={11} /> View Record
                                </button>
                              ) : (
                                <span style={{ fontSize: 11.5, color: '#CBD5E1' }}>—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </>
        )}

        {/* ══════════ DIAGNOSES ══════════ */}
        {activeTab === 'diagnoses' && (
          <SectionCard icon={Stethoscope} title={`Diagnoses (${diagnosedRecords.length})`}>
            {diagnosedRecords.length === 0 ? (
              <EmptyState icon={Stethoscope} title="No diagnoses yet" subtitle="Diagnoses recorded by doctors will appear here." compact />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {diagnosedRecords.map((record) => (
                  <div key={record._id} ref={(el) => { recordRefs.current[record._id] = el }} style={{ border: '1px solid #F1F5F9', borderRadius: 16, padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Dr. {record.doctorId?.name}</span>
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>{formatDateTime(record.createdAt).date}</span>
                      </div>
                      <RecordStatusBadge status={record.status} />
                    </div>
                    <p style={{ fontSize: 13.5, color: '#334155', margin: 0, lineHeight: 1.6 }}>{record.diagnosis}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {/* ══════════ PRESCRIPTIONS ══════════ */}
        {activeTab === 'prescriptions' && (
          <SectionCard icon={Pill} title={`Prescriptions (${prescribedRecords.length})`}>
            {prescribedRecords.length === 0 ? (
              <EmptyState icon={Pill} title="No prescriptions yet" subtitle="Prescriptions issued by doctors will appear here." compact />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {prescribedRecords.map((record) => (
                  <div key={record._id} ref={(el) => { recordRefs.current[record._id] = el }} style={{ border: '1px solid #F1F5F9', borderRadius: 16, padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Dr. {record.doctorId?.name}</span>
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>{formatDateTime(record.createdAt).date}</span>
                      </div>
                      <RecordStatusBadge status={record.status} />
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ textAlign: 'left', color: '#94A3B8', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            <th style={{ padding: '0 10px 8px 0' }}>Medicine</th>
                            <th style={{ padding: '0 10px 8px' }}>Dosage</th>
                            <th style={{ padding: '0 10px 8px' }}>Duration</th>
                            <th style={{ padding: '0 0 8px' }}>Instructions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {record.prescription.map((p, i) => (
                            <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '10px 10px 10px 0', fontWeight: 700, color: '#0F172A' }}>{p.medicine}</td>
                              <td style={{ padding: '10px' }}>{p.dosage || '—'}</td>
                              <td style={{ padding: '10px' }}>{p.duration || '—'}</td>
                              <td style={{ padding: '10px 0', color: '#64748B' }}>{p.instructions || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {/* ══════════ DOCTOR NOTES ══════════ */}
        {activeTab === 'notes' && (
          <SectionCard icon={StickyNote} title={`Doctor Notes (${notedRecords.length})`}>
            {notedRecords.length === 0 ? (
              <EmptyState icon={StickyNote} title="No doctor notes yet" subtitle="Private clinical notes left by doctors will appear here." compact />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {notedRecords.map((record) => {
                  const { date, time } = formatDateTime(record.createdAt)
                  return (
                    <div key={record._id} ref={(el) => { recordRefs.current[record._id] = el }} style={{ border: '1px solid #F1F5F9', borderRadius: 16, padding: 18, background: '#F8FAFC' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Dr. {record.doctorId?.name}</span>
                        <span style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{date}</span><span>·</span><span>{time}</span>
                        </span>
                      </div>
                      <p style={{ fontSize: 13.5, color: '#334155', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{record.notes}</p>
                      <p style={{ fontSize: 10.5, color: '#94A3B8', margin: '10px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Lock size={10} /> Read-only clinical note
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        )}

        {/* ══════════ ATTACHMENTS ══════════ */}
        {activeTab === 'attachments' && (
          <SectionCard icon={Paperclip} title={`Attachments (${allAttachments.length})`}>
            {allAttachments.length === 0 ? (
              <EmptyState icon={Paperclip} title="No attachments yet" subtitle="PDFs, images, reports and scan results will appear here." compact />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {allAttachments.map((a, i) => {
                  const AttachmentIcon = attachmentIcon(a.fileType)
                  return (
                    <a
                      key={i} href={a.url} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '12px 14px', textDecoration: 'none' }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <AttachmentIcon size={16} color="#2563EB" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.fileName || `File ${i + 1}`}</p>
                        <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>Dr. {a.record.doctorId?.name} · {formatDateTime(a.uploadedAt || a.record.createdAt).date}</p>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </SectionCard>
        )}

        {/* ══════════ TIMELINE ══════════ */}
        {activeTab === 'timeline' && (
          <SectionCard icon={ClipboardList} title="Medical Timeline">
            {timelineEvents.length === 0 ? (
              <EmptyState icon={ClipboardList} title="No history yet" subtitle="This patient's visits will appear here as a timeline." compact />
            ) : (
              <div style={{ position: 'relative', paddingLeft: 28 }}>
                <div style={{ position: 'absolute', left: 9, top: 6, bottom: 6, width: 2, background: '#E2E8F0' }} />
                {timelineEvents.map((ev) => {
                  const status = appointmentStatus(ev.appt)
                  const s = STATUS_STYLES[status]
                  return (
                    <div key={ev.key} style={{ position: 'relative', paddingBottom: 22 }}>
                      <div style={{ position: 'absolute', left: -28, top: 2, width: 20, height: 20, borderRadius: '50%', background: s.bg, border: `2px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <s.icon size={10} color={s.color} />
                      </div>
                      <div style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 14, padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            Dr. {ev.appt.docData?.name} · {formatSlotDate(ev.appt.slotDate)} · {ev.appt.slotTime}
                          </p>
                          <StatusBadge status={status} />
                        </div>
                        {ev.record && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                            {ev.record.diagnosis?.trim() && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#0D9488', background: '#F0FDFA', padding: '3px 9px', borderRadius: 99 }}>
                                <Stethoscope size={10} /> Diagnosis recorded
                              </span>
                            )}
                            {ev.record.prescription?.length > 0 && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#2563EB', background: '#EFF6FF', padding: '3px 9px', borderRadius: 99 }}>
                                <Pill size={10} /> {ev.record.prescription.length} medicine{ev.record.prescription.length === 1 ? '' : 's'}
                              </span>
                            )}
                            {ev.record.attachments?.length > 0 && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#7C3AED', background: '#F5F3FF', padding: '3px 9px', borderRadius: 99 }}>
                                <Paperclip size={10} /> {ev.record.attachments.length} file{ev.record.attachments.length === 1 ? '' : 's'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        )}

        {/* ══════════ HISTORY (record amendments) ══════════ */}
        {activeTab === 'history' && (
          <SectionCard icon={HistoryIcon} title="Record Edit History">
            {historyRecords.length === 0 ? (
              <EmptyState icon={HistoryIcon} title="No edit history" subtitle="Amendments made to finalized records will appear here." compact />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {historyRecords.map((record) => (
                  <div key={record._id} style={{ border: '1px solid #F1F5F9', borderRadius: 16, padding: 18 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 12px' }}>
                      Dr. {record.doctorId?.name} · Record from {formatDateTime(record.createdAt).date}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {record.versions.map((v, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#F8FAFC', borderRadius: 12, padding: '10px 14px' }}>
                          <HistoryIcon size={14} color="#94A3B8" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div>
                            <p style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                              Edited by {v.editorLabel || v.editorRole} · {formatDateTime(v.editedAt).date} {formatDateTime(v.editedAt).time}
                            </p>
                            {v.reason && <p style={{ fontSize: 12, color: '#64748B', margin: '3px 0 0' }}>{v.reason}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

      </div>
    </div>
  )
}

export default HospitalPatientDetail
