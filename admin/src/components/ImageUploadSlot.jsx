import React, { useRef, useState } from 'react'
import { UploadCloud, Loader2, Pencil, Trash2, AlertCircle } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

// Shared image-upload control used everywhere a doctor/hospital photo is
// picked (avatars, banners, logos, cover images). Centralizes upload +
// replace + remove + preview + delete-confirmation so every upload point in
// the app behaves and looks the same instead of each page hand-rolling its
// own "Click to Replace" box.
//
// State ownership stays with the caller: this component only reports intent
// via onSelect(file) / onRemove() — callers decide what "removed" means for
// their save flow (e.g. clear-to-empty for optional fields, or block save
// and require a fresh upload for schema-required fields via `required`).
const ImageUploadSlot = ({
  label,
  hint,
  aspect = '1/1',
  current,
  file,
  removed = false,
  onSelect,
  onRemove,
  uploading = false,
  required = false,
  confirmTitle = 'Remove this image?',
  confirmMessage = "This clears the image here. You'll need to upload a new one before saving.",
}) => {
  const inputRef = useRef(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const hasImage = Boolean(file || (current && !removed))
  const previewSrc = file ? URL.createObjectURL(file) : current
  const inputId = `upload-${String(label).replace(/\s+/g, '-').toLowerCase()}`

  const handlePick = () => inputRef.current?.click()

  const handleRemoveClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Only a locally-staged, unsaved file is being cleared — nothing
    // persisted is at risk, so skip the confirmation step.
    if (current && !file) {
      setConfirmOpen(true)
    } else {
      onRemove()
    }
  }

  const confirmRemove = () => {
    setConfirmOpen(false)
    onRemove()
  }

  return (
    <div>
      {label && <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 7 }}>{label}</label>}
      <div
        style={{
          position: 'relative', width: '100%', aspectRatio: aspect,
          borderRadius: 18,
          border: hasImage ? '1px solid #E2E8F0' : '2px dashed #CBD5E1',
          background: '#F8FAFC', overflow: 'hidden',
          cursor: hasImage ? 'default' : 'pointer',
          transition: 'border-color 0.25s ease'
        }}
        onClick={!hasImage ? handlePick : undefined}
        onMouseEnter={(e) => { if (!hasImage) e.currentTarget.style.borderColor = '#2563EB' }}
        onMouseLeave={(e) => { if (!hasImage) e.currentTarget.style.borderColor = '#CBD5E1' }}
      >
        {hasImage ? (
          <>
            <img src={previewSrc} alt={label || 'Uploaded'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

            <div style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex',
              background: 'rgba(15,23,42,0.78)', backdropFilter: 'blur(4px)'
            }}>
              <button
                type="button" onClick={(e) => { e.stopPropagation(); handlePick() }}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: 'transparent', border: 'none', borderRight: '1px solid rgba(255,255,255,0.15)',
                  color: '#FFFFFF', fontSize: 11.5, fontWeight: 700, padding: '9px 6px',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                }}
              >
                <Pencil size={12} /> Replace
              </button>
              <button
                type="button" onClick={handleRemoveClick}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: 'transparent', border: 'none',
                  color: '#FCA5A5', fontSize: 11.5, fontWeight: 700, padding: '9px 6px',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                }}
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <UploadCloud size={26} color="#14B8A6" />
            <p style={{ fontSize: 12, color: '#64748B', margin: 0, textAlign: 'center', padding: '0 10px' }}>Click to upload</p>
          </div>
        )}

        {uploading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={22} className="animate-spin" color="#2563EB" />
          </div>
        )}

        <input
          ref={inputRef} id={inputId} type="file" hidden accept="image/*"
          onChange={(e) => { if (e.target.files?.[0]) onSelect(e.target.files[0]) }}
        />
      </div>

      {hint && <p style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 6 }}>{hint}</p>}
      {required && removed && !file && (
        <p style={{ fontSize: 11.5, color: '#DC2626', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={12} /> Required — please upload a new image before saving
        </p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel="Remove"
        destructive
        onConfirm={confirmRemove}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}

export default ImageUploadSlot
