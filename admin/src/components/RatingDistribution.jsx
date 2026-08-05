import React, { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

// Animated 5→1 star breakdown bars — the admin-panel counterpart of the
// frontend's RatingDistribution, styled with the same inline-style recipe
// used across PageHero/StatCard rather than the frontend's Tailwind classes.
const RatingDistribution = ({ distribution, total = 0, averageRating = 0 }) => {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [distribution])

  const counts = distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  const safeTotal = total || Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, minWidth: 90 }}>
        <p style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', lineHeight: 1, margin: 0 }}>
          {safeTotal > 0 ? averageRating.toFixed(1) : 'New'}
        </p>
        <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={14} color={i <= Math.round(averageRating) ? '#FBBF24' : '#E2E8F0'} fill={i <= Math.round(averageRating) ? '#FBBF24' : '#E2E8F0'} />
          ))}
        </div>
        <p style={{ fontSize: 11.5, color: '#64748B', marginTop: 6 }}>
          {safeTotal} review{safeTotal === 1 ? '' : 's'}
        </p>
      </div>

      <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = counts[star] || 0
          const percent = safeTotal > 0 ? (count / safeTotal) * 100 : 0
          return (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', width: 28, flexShrink: 0 }}>{star} ★</span>
              <div style={{ flex: 1, height: 8, borderRadius: 99, background: '#F1F5F9', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: 99,
                    width: animate ? `${percent}%` : '0%',
                    background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
                    transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                    transitionDelay: `${(5 - star) * 0.08}s`
                  }}
                />
              </div>
              <span style={{ fontSize: 11.5, color: '#94A3B8', width: 22, flexShrink: 0, textAlign: 'right' }}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default React.memo(RatingDistribution)
