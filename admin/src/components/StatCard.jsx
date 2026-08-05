import React, { useState } from 'react'

// Shared premium statistics card — the exact card introduced on the Doctor
// Dashboard, reused everywhere instead of every page defining its own.
const StatCard = (props) => {
  const Icon = props.icon
  const { label, value, accent } = props
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF', borderRadius: 20, padding: '20px 22px',
        border: '1px solid #E2E8F0',
        boxShadow: hovered ? '0 12px 32px rgba(15,23,42,0.08)' : '0 8px 24px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12, marginBottom: 14,
        background: accent.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} color={accent.color} />
      </div>
      <p style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1, margin: 0, letterSpacing: '-0.01em' }}>{value}</p>
      <p style={{ fontSize: 12.5, color: '#64748B', marginTop: 6, fontWeight: 500 }}>{label}</p>
    </div>
  )
}

export default StatCard
