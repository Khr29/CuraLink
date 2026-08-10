import React, { useContext, useState, useRef, useEffect, useCallback } from 'react'
import { PharmacyContext } from '../../context/PharmacyContext'
import {
  QrCode, Search, User, Stethoscope, Building2, Calendar, Camera, X,
  ShieldCheck, ShieldAlert, CheckCircle2, PackageCheck, Loader2
} from 'lucide-react'
import PageHero from '../../components/PageHero'

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''

const medName = (item) => item.medicineName || item.medicine || ''
const medDose = (item) => item.dose || item.dosage || ''

// A pharmacist may paste either the raw verification token or the full
// verify link (from a scanned QR) — extract the token either way. The QR
// itself only ever encodes this opaque token inside a verify URL, never raw
// medical data (backend/controllers/medicalRecordController.js#getPrescriptionQr).
const extractToken = (input) => {
  const trimmed = input.trim()
  if (!trimmed) return ''
  const idx = trimmed.lastIndexOf('/verify/')
  return idx !== -1 ? trimmed.slice(idx + '/verify/'.length) : trimmed
}

const DISPENSE_OPTIONS = [
  { value: 'partially_dispensed', label: 'Partially Dispensed' },
  { value: 'dispensed', label: 'Fully Dispensed' },
]

const QR_READER_ID = 'pharmacy-qr-reader'

const PharmacyScan = () => {
  const { pharmacyLookupResult, lookupPrescription, dispensePrescription } = useContext(PharmacyContext)
  const [input, setInput] = useState('')
  const [token, setToken] = useState('')
  const [searching, setSearching] = useState(false)
  const [dispenseStatus, setDispenseStatus] = useState('dispensed')
  const [notes, setNotes] = useState('')
  const [dispensing, setDispensing] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  const scannerRef = useRef(null)

  const runLookup = useCallback(async (extracted) => {
    if (!extracted) return
    setSearching(true)
    setToken(extracted)
    setInput(extracted)
    await lookupPrescription(extracted)
    setSearching(false)
  }, [lookupPrescription])

  const handleSearch = async (e) => {
    e.preventDefault()
    await runLookup(extractToken(input))
  }

  const handleDispense = async (e) => {
    e.preventDefault()
    if (!token) return
    setDispensing(true)
    await dispensePrescription(token, dispenseStatus, notes)
    setDispensing(false)
    setNotes('')
  }

  // Live camera QR scanning — html5-qrcode renders its own UI into the
  // #pharmacy-qr-reader div. On a successful decode we stop the camera and
  // feed the scanned text through the same extractToken/lookup path as a
  // manually pasted code, so verification always goes through the same
  // server-side authorization regardless of how the token was obtained.
  useEffect(() => {
    if (!scannerOpen) return undefined

    let cancelled = false
    let scannerInstance = null

    import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
      if (cancelled) return
      scannerInstance = new Html5QrcodeScanner(
        QR_READER_ID,
        { fps: 10, qrbox: { width: 240, height: 240 } },
        false
      )
      scannerRef.current = scannerInstance
      scannerInstance.render(
        (decodedText) => {
          setScannerOpen(false)
          runLookup(extractToken(decodedText))
        },
        () => { /* per-frame scan failures are expected while framing the code — ignore */ }
      )
    })

    return () => {
      cancelled = true
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [scannerOpen, runLookup])

  const isRevoked = pharmacyLookupResult?.status === 'revoked'
  const alreadyDispensed = pharmacyLookupResult?.dispensing?.status === 'dispensed'

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '32px 24px 48px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <PageHero icon={ShieldCheck} title="Scan & Verify" description="Scan a patient's prescription QR, or enter its verification code, to view authorized details and record dispensing." />

        <div style={{
          display: 'flex', gap: 10, background: '#FFFFFF', border: '1px solid #E2E8F0',
          borderRadius: 20, padding: 10, boxShadow: '0 8px 24px rgba(15,23,42,0.05)', marginBottom: scannerOpen ? 16 : 24
        }}>
          <button type="button" onClick={() => setScannerOpen((v) => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px', borderRadius: 14, border: '1.5px solid #E2E8F0',
            background: scannerOpen ? '#FEF2F2' : '#F8FAFC', color: scannerOpen ? '#DC2626' : '#334155', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif'
          }}>
            {scannerOpen ? <X size={16} /> : <Camera size={16} />}
            {scannerOpen ? 'Close Camera' : 'Scan QR'}
          </button>

          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 14 }}>
              <QrCode size={16} color="#94A3B8" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Verification code or verify link"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, fontFamily: 'Inter, sans-serif', padding: '10px 0' }}
              />
            </div>
            <button type="submit" disabled={searching || !input.trim()} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #2563EB, #14B8A6)', color: '#fff', fontWeight: 700, fontSize: 13.5,
              cursor: searching ? 'not-allowed' : 'pointer', opacity: searching || !input.trim() ? 0.7 : 1
            }}>
              {searching ? <Loader2 size={15} style={{ animation: 'curalink-spin .7s linear infinite' }} /> : <Search size={15} />}
              {searching ? 'Looking up…' : 'Look up'}
            </button>
          </form>
        </div>

        {scannerOpen && (
          <div style={{ background: '#0F172A', borderRadius: 20, padding: 16, marginBottom: 24, boxShadow: '0 8px 24px rgba(15,23,42,0.15)' }}>
            <div id={QR_READER_ID} style={{ borderRadius: 12, overflow: 'hidden' }} />
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11.5, textAlign: 'center', margin: '10px 0 0' }}>
              Point the camera at the prescription's QR code
            </p>
          </div>
        )}

        {pharmacyLookupResult && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: 24, boxShadow: '0 8px 24px rgba(15,23,42,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isRevoked ? <ShieldAlert size={22} color="#D97706" /> : <ShieldCheck size={22} color="#16A34A" />}
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>{pharmacyLookupResult.prescriptionId}</p>
                  <p style={{ fontSize: 11.5, color: isRevoked ? '#D97706' : '#16A34A', fontWeight: 700, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {pharmacyLookupResult.status}
                  </p>
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 999,
                background: alreadyDispensed ? '#F0FDF4' : '#FFFBEB',
                color: alreadyDispensed ? '#16A34A' : '#D97706',
              }}>
                {(pharmacyLookupResult.dispensing?.status || 'pending').replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20, fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <User size={14} color="#0EA5E9" style={{ marginTop: 2 }} />
                <div><p style={{ margin: 0, fontSize: 11, color: '#94A3B8' }}>Patient</p><p style={{ margin: '1px 0 0', fontWeight: 700, color: '#0F172A' }}>{pharmacyLookupResult.patient?.name || '—'}</p></div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Stethoscope size={14} color="#0EA5E9" style={{ marginTop: 2 }} />
                <div><p style={{ margin: 0, fontSize: 11, color: '#94A3B8' }}>Doctor</p><p style={{ margin: '1px 0 0', fontWeight: 700, color: '#0F172A' }}>{pharmacyLookupResult.doctor?.name}{pharmacyLookupResult.doctor?.speciality ? ` — ${pharmacyLookupResult.doctor.speciality}` : ''}</p></div>
              </div>
              {pharmacyLookupResult.hospital && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Building2 size={14} color="#0EA5E9" style={{ marginTop: 2 }} />
                  <div><p style={{ margin: 0, fontSize: 11, color: '#94A3B8' }}>Prescribing Hospital</p><p style={{ margin: '1px 0 0', fontWeight: 700, color: '#0F172A' }}>{pharmacyLookupResult.hospital}</p></div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Calendar size={14} color="#0EA5E9" style={{ marginTop: 2 }} />
                <div><p style={{ margin: 0, fontSize: 11, color: '#94A3B8' }}>Issued</p><p style={{ margin: '1px 0 0', fontWeight: 700, color: '#0F172A' }}>{formatDate(pharmacyLookupResult.issuedAt)}</p></div>
              </div>
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Medications ({pharmacyLookupResult.medications?.length || 0})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
              {(pharmacyLookupResult.medications || []).map((item, i) => (
                <div key={i} style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 12, padding: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                    {i + 1}. {medName(item)}{item.strength ? ` — ${item.strength}` : ''}
                  </p>
                  <p style={{ fontSize: 11.5, color: '#475569', margin: 0 }}>
                    {[medDose(item), item.frequency, item.route, item.timing !== 'Anytime' ? item.timing : '', item.duration ? `for ${item.duration}` : '', item.quantity ? `Qty: ${item.quantity}` : '']
                      .filter(Boolean).join(' · ')}
                  </p>
                  {item.instructions && <p style={{ fontSize: 11.5, color: '#64748B', margin: '4px 0 0', fontStyle: 'italic' }}>{item.instructions}</p>}
                </div>
              ))}
            </div>

            {!isRevoked && (
              <form onSubmit={handleDispense} style={{ borderTop: '1px solid #F1F5F9', paddingTop: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#334155', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>
                  Record Dispensing
                </p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  {DISPENSE_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setDispenseStatus(opt.value)} style={{
                      padding: '8px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                      border: `1.5px solid ${dispenseStatus === opt.value ? '#14B8A6' : '#E2E8F0'}`,
                      background: dispenseStatus === opt.value ? '#F0FDFA' : '#FFFFFF',
                      color: dispenseStatus === opt.value ? '#0D9488' : '#64748B',
                    }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  rows={2}
                  style={{ width: '100%', padding: 10, border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 12.5, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', marginBottom: 12, resize: 'vertical' }}
                />
                <button type="submit" disabled={dispensing} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff', fontWeight: 700, fontSize: 13,
                  cursor: dispensing ? 'not-allowed' : 'pointer', opacity: dispensing ? 0.7 : 1
                }}>
                  <PackageCheck size={15} /> {dispensing ? 'Saving…' : 'Save Dispensing Status'}
                </button>
                {alreadyDispensed && (
                  <span style={{ marginLeft: 12, fontSize: 11.5, color: '#16A34A', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Already marked dispensed — this updates the record.
                  </span>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PharmacyScan
