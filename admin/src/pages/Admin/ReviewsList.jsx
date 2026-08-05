import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react'
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
  Send,
  Search,
  ThumbsUp
} from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import StatCard from '../../components/StatCard'
import { SkeletonRow } from '../../components/Skeleton'

const selectStyle = {
  height: 40, background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12,
  padding: '0 12px', fontSize: 13, color: '#0F172A', outline: 'none',
  fontFamily: 'Inter, sans-serif', cursor: 'pointer'
}

const ReviewsList = () => {
  const { aToken, reviews, getAllReviews, toggleReviewVisibility, replyToReview, deleteReview } =
    useContext(AdminContext)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  useEffect(() => {
    if (aToken) {
      getAllReviews().finally(() => setLoading(false))
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

  const stats = useMemo(() => {
    const list = reviews || []
    const visible = list.filter((r) => r.isVisible)
    const avg = visible.length > 0
      ? visible.reduce((sum, r) => sum + r.rating, 0) / visible.length
      : 0
    return {
      total: list.length,
      avg,
      visible: visible.length,
      hidden: list.length - visible.length
    }
  }, [reviews])

  const visibleReviews = useMemo(() => {
    const query = search.trim().toLowerCase()
    let list = (reviews || []).filter((review) => {
      if (typeFilter === 'doctor' && !review.doctorId) return false
      if (typeFilter === 'hospital' && !review.hospitalId) return false
      if (ratingFilter !== 'all' && review.rating !== Number(ratingFilter)) return false
      if (query) {
        const target = review.doctorId || review.hospitalId
        const haystack = `${review.userId?.name || ''} ${target?.name || ''} ${review.title || ''} ${review.comment || ''}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      const diff = new Date(a.createdAt) - new Date(b.createdAt)
      return sortOrder === 'newest' ? -diff : diff
    })
    return list
  }, [reviews, search, typeFilter, ratingFilter, sortOrder])

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero
          icon={MessageSquare}
          title="Reviews"
          description="Moderate patient reviews for doctors and hospitals."
          action={
            <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', padding: '10px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14B8A6' }} />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>
                Total Reviews: {reviews?.length || 0}
              </span>
            </div>
          }
        />

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 18, marginBottom: 24 }}>
          <StatCard icon={MessageSquare} label="Total Reviews" value={stats.total} accent={{ bg: '#EFF6FF', color: '#2563EB' }} />
          <StatCard icon={Star} label="Average Rating" value={stats.total > 0 ? stats.avg.toFixed(1) : '—'} accent={{ bg: '#FFFBEB', color: '#D97706' }} />
          <StatCard icon={ThumbsUp} label="Visible" value={stats.visible} accent={{ bg: '#F0FDF4', color: '#22C55E' }} />
          <StatCard icon={EyeOff} label="Hidden" value={stats.hidden} accent={{ bg: '#F1F5F9', color: '#64748B' }} />
        </div>

        {/* TOOLBAR: search / filter / sort */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center',
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16,
          padding: 14, marginBottom: 20, boxShadow: '0 4px 12px rgba(15,23,42,0.03)'
        }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient, doctor, hospital, or keyword..."
              style={{ ...selectStyle, width: '100%', paddingLeft: 36, cursor: 'text' }}
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Types</option>
            <option value="doctor">Doctor Reviews</option>
            <option value="hospital">Hospital Reviews</option>
          </select>
          <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
            ))}
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={selectStyle}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* REVIEWS LIST */}
        {loading ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden' }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : visibleReviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {visibleReviews.map((review) => (
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
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
            <EmptyState
              icon={MessageSquare}
              title={reviews?.length > 0 ? 'No Matching Reviews' : 'No Reviews Yet'}
              subtitle={
                reviews?.length > 0
                  ? 'Try adjusting your search or filters.'
                  : 'Patient reviews will appear here once they start rating doctors and hospitals.'
              }
            />
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
