import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HospitalContext } from '../../context/HospitalContext'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Stethoscope,
  FileText,
  Pill,
  Paperclip,
  Lock,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import EmptyState from '../../components/EmptyState'

const months = [' ', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const formatSlotDate = (slotDate) => {
  if (!slotDate) return ''
  const [d, m, y] = slotDate.split('_')
  return `${d} ${months[Number(m)]} ${y}`
}

const SectionCard = ({ icon: Icon, title, children, action }) => (
  <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', overflow: 'hidden', marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={16} color="#2563EB" />
        <p style={{ fontWeight: 700, color: '#0F172A', fontSize: 14, margin: 0 }}>{title}</p>
      </div>
      {action}
    </div>
    <div style={{ padding: 24 }}>{children}</div>
  </div>
)

const HospitalPatientDetail = () => {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { hToken, patientDetail, setPatientDetail, getHospitalPatientDetail } = useContext(HospitalContext)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setPatientDetail(null)
    if (!hToken) return
    getHospitalPatientDetail(patientId).then((res) => {
      if (!res?.success) setNotFound(true)
      setLoading(false)
    })
  }, [hToken, patientId, getHospitalPatientDetail, setPatientDetail])

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

  const { patient, appointments, records, doctors } = patientDetail

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        <button
          onClick={() => navigate('/hospital-patients')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#2563EB', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 20, padding: 0, fontFamily: 'Inter, sans-serif' }}
        >
          <ArrowLeft size={14} /> Back to Patients
        </button>

        {/* Profile Summary */}
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 28,
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 75%, #14B8A6 100%)',
          padding: '32px', marginBottom: 28, boxShadow: '0 24px 60px rgba(15,23,42,0.28)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <img src={patient.image} alt={patient.name} style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.85)', flexShrink: 0 }} />
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>{patient.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
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
        </div>

        {/* Assigned Doctors */}
        <SectionCard icon={Stethoscope} title={`Assigned Doctors (${doctors.length})`}>
          {doctors.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94A3B8' }}>No doctors on record.</p>
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

        {/* Appointment History */}
        <SectionCard icon={CalendarDays} title={`Appointment History at This Hospital (${appointments.length})`}>
          {appointments.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94A3B8' }}>No appointments on record.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {appointments.map((appt) => (
                <div key={appt._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14 }}>
                  <img src={appt.docData?.image} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{appt.docData?.name}</p>
                    <p style={{ fontSize: 11.5, color: '#64748B', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {formatSlotDate(appt.slotDate)} · {appt.slotTime}
                    </p>
                  </div>
                  {appt.cancelled ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#EF4444', background: '#FEF2F2', padding: '4px 10px', borderRadius: 99 }}>
                      <XCircle size={11} /> Cancelled
                    </span>
                  ) : appt.isCompleted ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '4px 10px', borderRadius: 99 }}>
                      <CheckCircle2 size={11} /> Completed
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '4px 10px', borderRadius: 99 }}>Upcoming</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Medical Records — Diagnosis / Prescription / Attachments / Timeline */}
        <SectionCard icon={FileText} title={`Medical Records (${records.length})`}>
          {records.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94A3B8' }}>No medical records from this hospital yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {records.map((record) => (
                <div key={record._id} style={{ border: '1px solid #F1F5F9', borderRadius: 16, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Dr. {record.doctorId?.name}</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>{new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                    {record.status === 'finalized' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: '#B45309', background: '#FFFBEB', padding: '3px 9px', borderRadius: 99 }}>
                        <Lock size={10} /> Finalized
                      </span>
                    ) : (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', background: '#F1F5F9', padding: '3px 9px', borderRadius: 99 }}>Draft</span>
                    )}
                  </div>

                  <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Diagnosis</p>
                  <p style={{ fontSize: 13, color: '#334155', marginBottom: 12 }}>{record.diagnosis || 'Not recorded'}</p>

                  {record.prescription?.length > 0 && (
                    <>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Pill size={11} /> Prescription
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                        {record.prescription.map((p, i) => (
                          <span key={i} style={{ fontSize: 11.5, color: '#334155', background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '4px 10px', borderRadius: 99 }}>
                            {p.medicine}{p.dosage ? ` · ${p.dosage}` : ''}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {record.attachments?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {record.attachments.map((a, i) => (
                        <a key={i} href={a.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#2563EB', textDecoration: 'none' }}>
                          <Paperclip size={11} /> {a.fileName || `File ${i + 1}`}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  )
}

export default HospitalPatientDetail
