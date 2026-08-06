import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'

// Shared confirm-before-destructive-action modal — matches the CuraLink
// admin design system (rounded cards, soft shadows, PageHero-style icon
// badge). Used anywhere a delete/irreversible action needs a guard instead
// of firing immediately or relying on a bare window.confirm().
//
// Rendered via a portal straight onto <body> — PanelLayout's h-screen
// shell scrolls internally (via <main className="overflow-y-auto">), so a
// dialog mounted inline would be positioned relative to that scrolled
// content instead of the real viewport, opening "below the fold". A portal
// sidesteps that entirely: this element's fixed/centered position is
// always relative to the actual browser viewport regardless of where in
// the tree it's rendered or how far the page has scrolled.
const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  loading = false,
  onConfirm,
  onClose,
}) => {
  // Lock background scrolling while open, restore on close/unmount.
  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 24,
          border: '1px solid #E2E8F0',
          boxShadow: '0 24px 60px rgba(15,23,42,0.28)',
          width: '100%',
          maxWidth: 420,
          padding: 28,
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} color="#64748B" />
        </button>

        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: destructive ? '#FEF2F2' : '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
          }}
        >
          <AlertTriangle size={26} color={destructive ? '#DC2626' : '#2563EB'} />
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
          {title}
        </h3>
        {message && (
          <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 24px', lineHeight: 1.6 }}>
            {message}
          </p>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: message ? 0 : 24 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#334155',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: 12,
              border: 'none',
              background: destructive ? '#DC2626' : '#2563EB',
              color: '#FFFFFF',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default React.memo(ConfirmDialog)
