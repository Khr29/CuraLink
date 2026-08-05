import React, { useState } from 'react'

// Shared "form section" card — same recipe as AddDoctor.jsx/AddHospital.jsx's
// local DashboardCard, extracted so the Hospital portal's forms (Add/Edit
// Doctor, Profile) can reuse it instead of redefining it per page.
const FormCard = (props) => {
  const Icon = props.icon
  const { title, children, action } = props
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 24,
        padding: '28px 32px',
        boxShadow: hovered ? '0 12px 32px rgba(15,23,42,0.08)' : '0 8px 24px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.25s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {Icon && (
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color="#2563EB" />
            </div>
          )}
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

export default FormCard
