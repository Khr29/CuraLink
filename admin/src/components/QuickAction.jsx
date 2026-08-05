import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'

// Shared "quick action" button — extracted from the Doctor Dashboard so the
// Hospital Dashboard reuses the exact same recipe instead of a copy.
const QuickAction = (props) => {
  const ActionIcon = props.icon
  const { label, description, onClick } = props
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
        background: hovered ? 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(20,184,166,0.06))' : '#FFFFFF',
        border: `1px solid ${hovered ? '#99F6E4' : '#E2E8F0'}`,
        borderRadius: 16, padding: '16px 18px', cursor: 'pointer',
        transition: 'all 0.2s ease', width: '100%', fontFamily: 'Inter, sans-serif'
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <ActionIcon size={18} color="#FFFFFF" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 12, color: '#64748B', margin: '2px 0 0' }}>{description}</p>
      </div>
      <ArrowRight size={16} color="#94A3B8" style={{ flexShrink: 0, transform: hovered ? 'translateX(2px)' : 'none', transition: 'transform 0.2s' }} />
    </button>
  )
}

export default QuickAction
