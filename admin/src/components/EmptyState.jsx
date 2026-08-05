import React from 'react'

// Shared premium empty state (icon in a soft badge + title + subtitle),
// reused wherever a list/table has no data instead of plain "No X found" text.
const EmptyState = (props) => {
  const Icon = props.icon
  const { title, subtitle, compact = false } = props
  return (
  <div style={{ padding: compact ? '48px 24px' : '80px 24px', textAlign: 'center' }}>
    <div style={{
      width: compact ? 56 : 64, height: compact ? 56 : 64, borderRadius: compact ? 16 : 20,
      background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px'
    }}>
      <Icon size={compact ? 26 : 30} color="#2563EB" />
    </div>
    <h3 style={{ fontSize: compact ? 15 : 18, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{title}</h3>
    <p style={{ fontSize: compact ? 13 : 14, color: '#64748B', margin: 0 }}>{subtitle}</p>
  </div>
  )
}

export default React.memo(EmptyState)
