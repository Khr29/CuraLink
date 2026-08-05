import React from 'react'

// Shared premium page hero — the same navy → blue → teal gradient banner
// introduced on the Doctor Dashboard, reused everywhere so every admin
// page opens with the same "premium CuraLink" first impression instead of
// each page inventing its own header treatment.
const PageHero = ({ icon: Icon, title, description, action, badge }) => (
  <div style={{
    position: 'relative', overflow: 'hidden', borderRadius: 28,
    background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 75%, #14B8A6 100%)',
    padding: '32px 32px', marginBottom: 28,
    boxShadow: '0 24px 60px rgba(15,23,42,0.28)'
  }}>
    {/* mesh overlay, matches Homepage hero */}
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(20,184,166,0.20) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(37,99,235,0.20) 0%, transparent 50%)
      `
    }} />

    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        {Icon && (
          <div style={{
            width: 56, height: 56, borderRadius: 18, flexShrink: 0,
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon size={26} color="#FFFFFF" />
          </div>
        )}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>{title}</h1>
            {badge}
          </div>
          {description && (
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13.5, margin: '6px 0 0', maxWidth: 520 }}>{description}</p>
          )}
        </div>
      </div>

      {action && (
        <div style={{ flexShrink: 0 }}>{action}</div>
      )}
    </div>
  </div>
)

export default React.memo(PageHero)
