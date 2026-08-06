import React from 'react'
import { Star } from 'lucide-react'

// Shared building blocks used by Doctor Profile + Hospital Affiliation pages
// so both stay visually identical instead of hand-rolling their own copies.

export const StarRow = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={size} color={i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0'} fill={i <= Math.round(rating) ? '#FBBF24' : '#E2E8F0'} />
    ))}
  </div>
)

export const SectionCard = ({ title, icon: Icon, children, action }) => (
  <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', padding: '24px 28px', marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {Icon && (
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color="#2563EB" />
          </div>
        )}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </div>
)

export const Field = ({ label, children }) => (
  <div>
    <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>{label}</p>
    {children}
  </div>
)

export const inputStyle = {
  width: '100%', background: '#F8FAFC', border: '1.5px solid #E2E8F0',
  borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: '#0F172A',
  outline: 'none', fontFamily: 'Inter, sans-serif',
  transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box'
}
export const inputErrorStyle = { ...inputStyle, borderColor: '#EF4444' }

export const focusTeal = (e) => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }
export const blurDefault = (e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }

export const STATUS_BADGE = {
  pending: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  approved: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  rejected: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  cancelled: { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' },
}

export const RequestBadge = ({ status }) => {
  const s = STATUS_BADGE[status] || STATUS_BADGE.cancelled
  return (
    <span style={{
      fontSize: 10.5, fontWeight: 700, textTransform: 'capitalize', color: s.color,
      background: s.bg, border: `1px solid ${s.border}`, padding: '3px 10px', borderRadius: 99,
    }}>
      {status}
    </span>
  )
}
