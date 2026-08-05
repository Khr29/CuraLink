import React, { useContext, useEffect, useState, useCallback } from 'react'
import { AdminContext } from '../../context/AdminContext'
import {
  MessageSquare,
  Star,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
  Stethoscope,
  Building2,
  Send
} from 'lucide-react'

const ReviewsList = () => {
  const { aToken, reviews, getAllReviews, toggleReviewVisibility, replyToReview, deleteReview } =
    useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getAllReviews()
    }
  }, [aToken, getAllReviews])

  const handleToggleVisibility = useCallback((id) => toggleReviewVisibility(id), [toggleReviewVisibility])
  const handleDelete = useCallback(
    (id) => {
      if (window.confirm('Delete this review permanently?')) {
        deleteReview(id)
      }
    },
    [deleteReview]
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        {/* PAGE HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(37,99,235,0.25)'
            }}>
              <MessageSquare size={26} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                Reviews
              </h1>
              <p style={{ fontSize: 14, color: '#64748B', marginTop: 3 }}>
                Moderate patient reviews for doctors and hospitals.
              </p>
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '10px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
              Total Reviews: <span style={{ color: '#2563EB' }}>{reviews?.length || 0}</span>
            </span>
          </div>
        </div>

        {/* REVIEWS LIST */}
        {reviews?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map((review) => (
              <ReviewRow
                key={review._id}
                review={review}
                onToggleVisibility={handleToggleVisibility}
                onReply={replyToReview}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: '60px 24px', textAlign: 'center', boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <MessageSquare size={32} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>No Reviews Yet</h3>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
              Patient reviews will appear here once they start rating doctors and hospitals.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const ReviewRow = ({ review, onToggleVisibility, onReply, onDelete }) => {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState(review.adminReply || '')

  const target = review.doctorId || review.hospitalId
  const targetType = review.doctorId ? 'Doctor' : 'Hospital'
  const TargetIcon = review.doctorId ? Stethoscope : Building2

  const submitReply = () => {
    onReply(review._id, replyText)
    setReplyOpen(false)
  }

  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20,
      padding: 20, boxShadow: '0 4px 16px rgba(15,23,42,0.04)',
      opacity: review.isVisible ? 1 : 0.55
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 260 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, color: '#2563EB', fontSize: 15, overflow: 'hidden'
          }}>
            {review.userId?.image ? (
              <img src={review.userId.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              review.userId?.name?.[0]?.toUpperCase() || '?'
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{review.userId?.name || 'Patient'}</span>
              {review.verifiedPatient && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: '#0D9488', background: '#F0FDFA', padding: '2px 8px', borderRadius: 99 }}>
                  <ShieldCheck size={11} /> Verified
                </span>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: 99 }}>
                <TargetIcon size={11} /> {targetType}: {target?.name || 'Unknown'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} color={i <= review.rating ? '#FBBF24' : '#E2E8F0'} fill={i <= review.rating ? '#FBBF24' : '#E2E8F0'} />
              ))}
              <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 6 }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p style={{ fontWeight: 700, fontSize: 13.5, color: '#0F172A', margin: '8px 0 2px' }}>{review.title}</p>
            <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.6 }}>{review.comment}</p>

            {review.adminReply && !replyOpen && (
              <div style={{ marginTop: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', margin: '0 0 3px' }}>Admin Reply</p>
                <p style={{ fontSize: 12.5, color: '#475569', margin: 0 }}>{review.adminReply}</p>
              </div>
            )}

            {replyOpen && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  style={{ flex: 1, border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '8px 12px', fontSize: 12.5, outline: 'none' }}
                />
                <button
                  onClick={submitReply}
                  style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  <Send size={13} /> Send
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => setReplyOpen((v) => !v)}
            title="Reply"
            style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <MessageSquare size={15} color="#2563EB" />
          </button>
          <button
            onClick={() => onToggleVisibility(review._id)}
            title={review.isVisible ? 'Hide review' : 'Show review'}
            style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {review.isVisible ? <Eye size={15} color="#16A34A" /> : <EyeOff size={15} color="#94A3B8" />}
          </button>
          <button
            onClick={() => onDelete(review._id)}
            title="Delete review"
            style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #FEE2E2', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Trash2 size={15} color="#EF4444" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ReviewsList)
