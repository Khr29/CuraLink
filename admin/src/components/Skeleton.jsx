import React from 'react'

// Shared shimmer skeleton primitives — used in place of plain spinners while
// list/detail data is loading, matching the CuraLink card recipe (rounded
// corners, soft border) so the loading state already looks like the page.
export const SkeletonBlock = ({ width = '100%', height = 14, radius = 8, style = {} }) => (
  <div className="curalink-skeleton" style={{ width, height, borderRadius: radius, ...style }} />
)

export const SkeletonCard = () => (
  <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: 20, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
    <SkeletonBlock height={140} radius={14} style={{ marginBottom: 16 }} />
    <SkeletonBlock height={16} width="70%" style={{ marginBottom: 10 }} />
    <SkeletonBlock height={12} width="45%" style={{ marginBottom: 18 }} />
    <SkeletonBlock height={36} radius={10} />
  </div>
)

export const SkeletonRow = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px', borderBottom: '1px solid #F8FAFC' }}>
    <SkeletonBlock width={40} height={40} radius={99} />
    <div style={{ flex: 1 }}>
      <SkeletonBlock height={13} width="35%" style={{ marginBottom: 8 }} />
      <SkeletonBlock height={11} width="20%" />
    </div>
    <SkeletonBlock width={80} height={24} radius={99} />
  </div>
)

export const SkeletonStatGrid = ({ count = 3 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 18 }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E2E8F0', padding: '20px 22px' }}>
        <SkeletonBlock width={42} height={42} radius={12} style={{ marginBottom: 14 }} />
        <SkeletonBlock height={22} width="50%" style={{ marginBottom: 8 }} />
        <SkeletonBlock height={11} width="70%" />
      </div>
    ))}
  </div>
)
