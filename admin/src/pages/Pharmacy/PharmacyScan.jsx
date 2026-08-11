import React, { useContext, useState, useRef, useEffect, useCallback } from 'react'
import { PharmacyContext } from '../../context/PharmacyContext'
import {
  Search, User, Stethoscope, Building2, Calendar, Keyboard, Upload, CameraOff,
  ShieldCheck, ShieldAlert, ShieldX, CheckCircle2, PackageCheck, Loader2, ScanLine,
  RotateCcw, AlertTriangle, Clock, History as HistoryIcon
} from 'lucide-react'
import PageHero from '../../components/PageHero'

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''

const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

const medName = (item) => item.medicineName || item.medicine || ''
const medDose = (item) => item.dose || item.dosage || ''

// Display labels only — the stored dispensing.status enum (pending/
// not_applicable/partially_dispensed/dispensed) never changes.
const DISPENSING_LABELS = {
  not_applicable: 'Not Dispensed',
  pending: 'Not Dispensed',
  partially_dispensed: 'Partially Dispensed',
  dispensed: 'Fully Dispensed',
}

// One blocking banner per non-plain outcome the backend can return
// (medicalRecordController.js#pharmacyVerifyPrescription) — colors reuse
// CuraLink's existing red/orange/green tokens, just applied per this
// explicit legend: invalid/revoked = red, expired/already-dispensed = orange.
const OUTCOME_BANNERS = {
  revoked: {
    color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: ShieldAlert,
    title: 'Prescription Revoked',
    detail: 'This prescription was revoked by the prescribing doctor or an administrator and can no longer be dispensed.',
  },
  expired: {
    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: Clock,
    title: 'Prescription Expired',
    detail: 'This prescription is past its validity window and can no longer be dispensed.',
  },
  already_dispensed: {
    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: PackageCheck,
    title: 'Already Fully Dispensed',
    detail: 'Every medicine on this prescription has already been dispensed in full.',
  },
}

// A short window to ignore an identical repeat scan/lookup — guards against
// a burst of frames or a double-submit firing two lookups for one physical
// scan, without suppressing genuinely repeated attempts made seconds apart
// (those are exactly what the scan/security log exists to surface).
const DUPLICATE_SCAN_WINDOW_MS = 2500

// A pharmacist may scan a QR, upload an image of one, or paste either the
// raw verification token or the full verify link — extract the token either
// way. The QR itself only ever encodes this opaque token inside a verify
// URL, never raw medical data (backend/controllers/medicalRecordController.js#getPrescriptionQr).
const extractToken = (input) => {
  const trimmed = (input || '').trim()
  if (!trimmed) return ''
  const idx = trimmed.lastIndexOf('/verify/')
  return idx !== -1 ? trimmed.slice(idx + '/verify/'.length) : trimmed
}

const QR_READER_ID = 'pharmacy-qr-reader'
// Separate, permanently-mounted, invisible container for scanFile() —
// kept independent of the live-camera div (which only exists while in
// 'camera' mode) so uploading an image works from either mode.
const QR_FILE_READER_ID = 'pharmacy-qr-file-reader'

const PharmacyScan = () => {
  const { pharmacyLookupResult, setPharmacyLookupResult, lookupPrescription, dispensePrescription } = useContext(PharmacyContext)

  // 'camera' (default, production flow) | 'manual' (fallback) — which input
  // surface is showing before a prescription has been verified.
  const [mode, setMode] = useState('camera')
  // 'starting' | 'scanning' | 'unavailable' — camera lifecycle within 'camera' mode.
  const [cameraStatus, setCameraStatus] = useState('starting')
  const [cameraMessage, setCameraMessage] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  const [verifying, setVerifying] = useState(false)
  const [scanError, setScanError] = useState('')
  // Set only when a QR/file scan (not manual entry) comes back "not a real
  // CuraLink token at all" — drives the full-panel red INVALID QR state,
  // kept separate from scanError's smaller inline banner (network hiccups,
  // a mistyped manual code) so a genuine security-relevant miss reads very
  // differently from an ordinary retry-able error.
  const [scanBlocked, setScanBlocked] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [token, setToken] = useState('')

  const [quantityDrafts, setQuantityDrafts] = useState({})
  const [notesDrafts, setNotesDrafts] = useState({})
  const [dispensingIndex, setDispensingIndex] = useState(null)

  const html5QrCodeRef = useRef(null)
  const fileInputRef = useRef(null)
  // { token, ts } of the last lookup actually dispatched — see
  // DUPLICATE_SCAN_WINDOW_MS above.
  const lastAttemptRef = useRef({ token: '', ts: 0 })

  const runLookup = useCallback(async (extracted, { viaQr = false } = {}) => {
    if (!extracted) return
    const now = Date.now()
    if (extracted === lastAttemptRef.current.token && now - lastAttemptRef.current.ts < DUPLICATE_SCAN_WINDOW_MS) {
      return
    }
    lastAttemptRef.current = { token: extracted, ts: now }

    setVerifying(true)
    setScanError('')
    setScanBlocked(false)
    const data = await lookupPrescription(extracted)
    setVerifying(false)
    if (data?.success) {
      setToken(extracted)
    } else if (viaQr && data?.reason === 'not_found') {
      setScanBlocked(true)
    } else {
      setScanError(data?.message || 'Invalid or expired QR code')
    }
  }, [lookupPrescription])

  // Production flow: the camera opens automatically the moment this page is
  // shown (permission requested implicitly via getCameras(), same as any
  // native camera app) rather than behind a "Request Camera Permissions"
  // button. If the browser already granted permission, this is instant; if
  // not, the browser's own permission prompt appears once.
  //
  // This effect only ever runs while PharmacyScan itself is mounted (it's
  // page-local state, not lifted into PharmacyContext/App.jsx/any shared
  // layout) — so the camera is structurally impossible to be active on the
  // Dashboard, History, Profile, or Settings pages; navigating there simply
  // unmounts this component and this cleanup runs.
  useEffect(() => {
    if (mode !== 'camera' || pharmacyLookupResult) return undefined
    let cancelled = false
    // Tracks whether instance.start() has actually resolved (camera stream
    // genuinely attached) — calling stop() before that resolves races the
    // library's internal state and can leave the MediaStream track (and the
    // browser's camera-active indicator) running with nothing left to stop
    // it. Cleanup uses this to decide whether to stop immediately or let the
    // in-flight start() call stop it the moment it actually finishes.
    let started = false
    let instance = null

    const start = async () => {
      setCameraStatus('starting')
      setCameraMessage('')
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return
        const cameras = await Html5Qrcode.getCameras()
        if (cancelled) return
        if (!cameras?.length) {
          setCameraStatus('unavailable')
          setCameraMessage('No camera was found on this device.')
          return
        }

        instance = new Html5Qrcode(QR_READER_ID, { verbose: false })
        html5QrCodeRef.current = instance

        await instance.start(
          { deviceId: { exact: cameras[0].id } },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            // Stop immediately so a burst of frames around the same QR
            // can't fire multiple lookups for one scan, and so the camera
            // is off the moment a result is about to be shown.
            started = false
            html5QrCodeRef.current = null
            instance?.stop().then(() => instance.clear()).catch(() => {})
            setCameraStatus('starting')
            runLookup(extractToken(decodedText), { viaQr: true })
          },
          () => { /* per-frame miss while framing the code — expected, ignore */ }
        )
        started = true
        if (cancelled) {
          // Unmounted/mode changed while start() was in flight — stop it
          // now that it has actually taken effect, rather than the cleanup
          // below racing a scanner that hadn't started yet.
          started = false
          html5QrCodeRef.current = null
          instance.stop().then(() => instance.clear()).catch(() => {})
          return
        }
        setCameraStatus('scanning')
      } catch (error) {
        if (cancelled) return
        setCameraStatus('unavailable')
        const denied = error?.name === 'NotAllowedError' || /permission/i.test(error?.message || '')
        setCameraMessage(denied ? 'Camera access was denied.' : 'Camera unavailable on this device or browser.')
      }
    }

    start()

    return () => {
      cancelled = true
      if (started && instance) {
        started = false
        html5QrCodeRef.current = null
        instance.stop().then(() => instance.clear()).catch(() => {})
      }
      // If start() hasn't resolved yet, its own `if (cancelled)` branch
      // above stops it the moment it does — calling stop() here too would
      // be exactly the premature-stop race this is written to avoid.
    }
  }, [mode, pharmacyLookupResult, runLookup, retryKey])

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    await runLookup(extractToken(manualInput))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setScanError('')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const instance = new Html5Qrcode(QR_FILE_READER_ID, { verbose: false })
      const decodedText = await instance.scanFile(file, false)
      await runLookup(extractToken(decodedText), { viaQr: true })
    } catch {
      setScanError('Could not read a QR code from that image.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const resetScan = useCallback(() => {
    setPharmacyLookupResult(null)
    setScanError('')
    setScanBlocked(false)
    setManualInput('')
    setToken('')
    setMode('camera')
    setRetryKey((k) => k + 1)
  }, [setPharmacyLookupResult])

  const handleDispense = async (medicineIndex, remaining) => {
    if (!token) return
    const qty = Number(quantityDrafts[medicineIndex])
    if (!Number.isInteger(qty) || qty <= 0) return
    // Client-side guard is just immediate UX feedback — the backend's atomic
    // over-dispense check (medicalRecordController.js#pharmacyDispense) is
    // what's actually authoritative, since this `remaining` value could be
    // stale if dispensed elsewhere a moment ago.
    if (typeof remaining === 'number' && qty > remaining) return
    setDispensingIndex(medicineIndex)
    const result = await dispensePrescription(token, medicineIndex, qty, notesDrafts[medicineIndex] || '')
    if (result.success) {
      setQuantityDrafts((d) => ({ ...d, [medicineIndex]: '' }))
      setNotesDrafts((d) => ({ ...d, [medicineIndex]: '' }))
    }
    setDispensingIndex(null)
  }

  // The backend computes this once as the single authoritative outcome
  // (medicalRecordController.js#pharmacyVerifyPrescription) — the frontend
  // just reads it rather than re-deriving revoked/expired/already-dispensed
  // from raw fields itself.
  const outcome = pharmacyLookupResult?.outcome || 'valid'
  const isRevoked = outcome === 'revoked'
  const alreadyDispensed = outcome === 'already_dispensed'
  const canDispense = outcome === 'valid' || outcome === 'partially_dispensed'
  const outcomeBanner = OUTCOME_BANNERS[outcome]

  // Every past dispense transaction for this prescription, grouped by
  // medicine — dispensingRecords is the append-only ledger returned by
  // pharmacyVerifyPrescription, never overwritten on a later partial fill.
  const transactionsByMedicine = (pharmacyLookupResult?.dispensingRecords || []).reduce((acc, entry) => {
    (acc[entry.medicineIndex] ||= []).push(entry)
    return acc
  }, {})

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '32px 24px 48px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <PageHero icon={ShieldCheck} title="Scan Prescription" description="Point the camera at a patient's prescription QR to verify and dispense." />

        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileUpload} />
        <div id={QR_FILE_READER_ID} style={{ display: 'none' }} />

        {!pharmacyLookupResult && (
          <div style={{ marginBottom: 24 }}>
            {scanBlocked ? (
              // Strong, unambiguous red state for a QR that isn't a genuine
              // CuraLink prescription token at all — deliberately shows
              // nothing else (no patient/doctor/medicine data ever reaches
              // this branch, since pharmacyLookupResult stays null).
              <div style={{
                background: '#FEF2F2', border: '2px solid #FECACA', borderRadius: 24,
                padding: '48px 32px', textAlign: 'center', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 14,
              }}>
                <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(220,38,38,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldX size={30} color="#DC2626" />
                </span>
                <p style={{ fontSize: 19, fontWeight: 800, color: '#B91C1C', margin: 0, letterSpacing: '-0.01em' }}>
                  INVALID QR CODE
                </p>
                <p style={{ fontSize: 13.5, color: '#7F1D1D', margin: 0, maxWidth: 420 }}>
                  This QR code is not a valid CuraLink prescription.
                </p>
                <button
                  type="button"
                  onClick={resetScan}
                  style={{
                    marginTop: 10, display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 22px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #DC2626, #B91C1C)', color: '#fff',
                    fontWeight: 700, fontSize: 13.5, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    boxShadow: '0 6px 18px rgba(220,38,38,0.3)',
                  }}
                >
                  <ScanLine size={15} /> Scan Again
                </button>
              </div>
            ) : mode === 'camera' ? (
              <div style={{ background: '#0F172A', borderRadius: 24, padding: 20, boxShadow: '0 20px 50px rgba(15,23,42,0.25)' }}>
                <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '4 / 3', background: '#000' }}>
                  {/* html5-qrcode injects the <video> feed into this element once the
                      camera starts — kept mounted across all camera states so the
                      library always has a real DOM node to attach to. */}
                  <div id={QR_READER_ID} style={{ width: '100%', height: '100%' }} />

                  {cameraStatus === 'scanning' && (
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{
                        width: '62%', aspectRatio: '1 / 1', borderRadius: 20,
                        border: '3px solid rgba(94,234,212,0.9)',
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
                      }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 20, animation: 'curalink-scan-pulse 2s ease-in-out infinite', border: '3px solid rgba(94,234,212,0.5)' }} />
                      </div>
                    </div>
                  )}

                  {(cameraStatus === 'starting' || verifying) && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: 'rgba(15,23,42,0.85)' }}>
                      <Loader2 size={28} color="#5EEAD4" style={{ animation: 'curalink-spin .8s linear infinite' }} />
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>
                        {verifying ? 'Verifying prescription…' : 'Starting camera…'}
                      </p>
                    </div>
                  )}

                  {cameraStatus === 'unavailable' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center' }}>
                      <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(248,113,113,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CameraOff size={24} color="#F87171" />
                      </span>
                      <div>
                        <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>Camera unavailable</p>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '4px 0 0' }}>{cameraMessage}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button type="button" onClick={() => setRetryKey((k) => k + 1)} style={fallbackBtnStyle('outline')}>
                          <RotateCcw size={14} /> Try Again
                        </button>
                        <button type="button" onClick={() => setMode('manual')} style={fallbackBtnStyle('primary')}>
                          <Keyboard size={14} /> Enter Verification Code
                        </button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={fallbackBtnStyle('outline')}>
                          <Upload size={14} /> {uploading ? 'Reading…' : 'Upload QR Image'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {cameraStatus === 'scanning' && (
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12.5, textAlign: 'center', margin: '14px 0 0' }}>
                    Position the prescription QR code inside the frame.
                  </p>
                )}

                {scanError && (
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '10px 14px' }}>
                    <AlertTriangle size={15} color="#F87171" style={{ flexShrink: 0 }} />
                    <p style={{ color: '#FCA5A5', fontSize: 12.5, margin: 0, flex: 1 }}>{scanError}</p>
                    <button type="button" onClick={() => setRetryKey((k) => k + 1)} style={{ ...fallbackBtnStyle('outline'), padding: '6px 12px', fontSize: 11.5 }}>
                      Scan Again
                    </button>
                  </div>
                )}

                {cameraStatus === 'scanning' && !scanError && (
                  <div style={{ marginTop: 14, textAlign: 'center' }}>
                    <button type="button" onClick={() => setMode('manual')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'underline' }}>
                      Having trouble scanning? Enter the code manually
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: 24, boxShadow: '0 8px 24px rgba(15,23,42,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Keyboard size={15} color="#2563EB" /> Enter Verification Code
                  </p>
                  <button type="button" onClick={resetScan} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#2563EB', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    <ScanLine size={14} /> Use Camera
                  </button>
                </div>
                <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    autoFocus
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Verification code or verify link"
                    style={{ flex: 1, minWidth: 200, padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 14, fontSize: 13.5, fontFamily: 'Inter, sans-serif' }}
                  />
                  <button type="submit" disabled={verifying || !manualInput.trim()} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '0 22px', borderRadius: 14, border: 'none',
                    background: 'linear-gradient(135deg, #2563EB, #14B8A6)', color: '#fff', fontWeight: 700, fontSize: 13.5,
                    cursor: verifying ? 'not-allowed' : 'pointer', opacity: verifying || !manualInput.trim() ? 0.7 : 1
                  }}>
                    {verifying ? <Loader2 size={15} style={{ animation: 'curalink-spin .7s linear infinite' }} /> : <Search size={15} />}
                    {verifying ? 'Verifying…' : 'Verify'}
                  </button>
                </form>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ ...fallbackBtnStyle('outline'), marginTop: 12, color: '#334155', borderColor: '#E2E8F0' }}>
                  <Upload size={14} /> {uploading ? 'Reading…' : 'Upload QR Image Instead'}
                </button>
                {scanError && (
                  <p style={{ marginTop: 12, color: '#DC2626', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={14} /> {scanError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {pharmacyLookupResult && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: 24, boxShadow: '0 8px 24px rgba(15,23,42,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {outcomeBanner ? <outcomeBanner.icon size={22} color={outcomeBanner.color} /> : <ShieldCheck size={22} color="#16A34A" />}
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: 0 }}>{pharmacyLookupResult.prescriptionId}</p>
                  <p style={{ fontSize: 11.5, color: outcomeBanner ? outcomeBanner.color : '#16A34A', fontWeight: 700, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {pharmacyLookupResult.status}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 999,
                  background: pharmacyLookupResult.dispensing?.status === 'dispensed' ? '#F0FDF4'
                    : pharmacyLookupResult.dispensing?.status === 'partially_dispensed' ? '#FFFBEB' : '#F1F5F9',
                  color: pharmacyLookupResult.dispensing?.status === 'dispensed' ? '#16A34A'
                    : pharmacyLookupResult.dispensing?.status === 'partially_dispensed' ? '#D97706' : '#64748B',
                }}>
                  {DISPENSING_LABELS[pharmacyLookupResult.dispensing?.status] || 'Not Dispensed'}
                </span>
                <button type="button" onClick={resetScan} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '7px 12px', color: '#334155', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  <ScanLine size={13} /> Scan Another
                </button>
              </div>
            </div>

            {outcomeBanner && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20,
                background: outcomeBanner.bg, border: `1.5px solid ${outcomeBanner.border}`, borderRadius: 14, padding: '14px 16px',
              }}>
                <outcomeBanner.icon size={20} color={outcomeBanner.color} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 800, color: outcomeBanner.color, margin: 0 }}>{outcomeBanner.title}</p>
                  <p style={{ fontSize: 12, color: '#475569', margin: '3px 0 0' }}>{outcomeBanner.detail}</p>
                  {isRevoked && pharmacyLookupResult.revokedAt && (
                    <p style={{ fontSize: 11.5, color: '#94A3B8', margin: '4px 0 0' }}>Revoked on {formatDateTime(pharmacyLookupResult.revokedAt)}</p>
                  )}
                  {alreadyDispensed && pharmacyLookupResult.dispensing?.dispensedAt && (
                    <p style={{ fontSize: 11.5, color: '#94A3B8', margin: '4px 0 0' }}>Last dispensed {formatDateTime(pharmacyLookupResult.dispensing.dispensedAt)}</p>
                  )}
                </div>
              </div>
            )}

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(pharmacyLookupResult.medications || []).map((item) => {
                const i = item.medicineIndex
                const fullyDispensed = item.remaining <= 0
                const transactions = transactionsByMedicine[i] || []
                const lastTransaction = transactions[0]
                return (
                  <div key={i} style={{ background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 12, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                          {i + 1}. {medName(item)}{item.strength ? ` — ${item.strength}` : ''}
                        </p>
                        <p style={{ fontSize: 11.5, color: '#475569', margin: 0 }}>
                          {[medDose(item), item.frequency, item.route, item.timing !== 'Anytime' ? item.timing : '', item.duration ? `for ${item.duration}` : '', item.quantity ? `Qty: ${item.quantity}` : '']
                            .filter(Boolean).join(' · ')}
                        </p>
                        {item.instructions && <p style={{ fontSize: 11.5, color: '#64748B', margin: '4px 0 0', fontStyle: 'italic' }}>{item.instructions}</p>}
                      </div>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999, flexShrink: 0, whiteSpace: 'nowrap',
                        background: fullyDispensed ? '#F0FDF4' : item.dispensedQuantity > 0 ? '#FFFBEB' : '#F1F5F9',
                        color: fullyDispensed ? '#16A34A' : item.dispensedQuantity > 0 ? '#D97706' : '#64748B',
                      }}>
                        {item.dispensedQuantity} / {item.quantityPrescribed} dispensed
                      </span>
                    </div>

                    {lastTransaction && (
                      <p style={{ marginTop: 8, fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={11} /> Dispensed on: {formatDateTime(lastTransaction.dispensedAt)}
                        {lastTransaction.pharmacyName ? ` by ${lastTransaction.pharmacyName}` : ''}
                      </p>
                    )}

                    {transactions.length > 1 && (
                      <div style={{ marginTop: 6, paddingLeft: 4, borderLeft: '2px solid #E2E8F0' }}>
                        {transactions.map((t, ti) => (
                          <p key={ti} style={{ margin: '3px 0 3px 8px', fontSize: 10.5, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <HistoryIcon size={10} /> {t.quantityDispensed} units — {formatDateTime(t.dispensedAt)}
                            {t.pharmacyName ? ` — ${t.pharmacyName}` : ''}
                            {t.notes ? ` — "${t.notes}"` : ''}
                          </p>
                        ))}
                      </div>
                    )}

                    {canDispense && (
                      fullyDispensed ? (
                        <p style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #E2E8F0', fontSize: 11.5, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <CheckCircle2 size={13} /> Fully dispensed
                        </p>
                      ) : (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <input
                            type="number"
                            min={1}
                            max={item.remaining}
                            value={quantityDrafts[i] ?? ''}
                            onChange={(e) => setQuantityDrafts((d) => ({ ...d, [i]: e.target.value }))}
                            placeholder={`Qty (max ${item.remaining})`}
                            style={{ width: 130, padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 12.5, fontFamily: 'Inter, sans-serif' }}
                          />
                          <input
                            value={notesDrafts[i] ?? ''}
                            onChange={(e) => setNotesDrafts((d) => ({ ...d, [i]: e.target.value }))}
                            placeholder="Notes (optional)"
                            style={{ flex: 1, minWidth: 140, padding: '8px 10px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 12.5, fontFamily: 'Inter, sans-serif' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleDispense(i, item.remaining)}
                            disabled={dispensingIndex === i || !quantityDrafts[i]}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none',
                              background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff', fontWeight: 700, fontSize: 12.5,
                              cursor: dispensingIndex === i || !quantityDrafts[i] ? 'not-allowed' : 'pointer',
                              opacity: dispensingIndex === i || !quantityDrafts[i] ? 0.6 : 1
                            }}
                          >
                            <PackageCheck size={14} /> {dispensingIndex === i ? 'Saving…' : 'Dispense'}
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes curalink-scan-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.03); }
        }
      `}</style>
    </div>
  )
}

const fallbackBtnStyle = (variant) => ({
  display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11,
  fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  border: variant === 'primary' ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
  background: variant === 'primary' ? 'linear-gradient(135deg, #2563EB, #14B8A6)' : 'rgba(255,255,255,0.06)',
  color: '#fff',
})

export default PharmacyScan
