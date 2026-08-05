import React, { useContext, useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { HospitalContext } from '../../context/HospitalContext'
import { MessageSquare, Star, Search, ShieldCheck, Pencil, Check, Loader2 } from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import RatingDistribution from '../../components/RatingDistribution'
import { SkeletonRow } from '../../components/Skeleton'

const selectStyle = {
  height: 40, background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12,
  padding: '0 12px', fontSize: 13, color: '#0F172A', outline: 'none',
  fontFamily: 'Inter, sans-serif', cursor: 'pointer'
}

const focusTeal = (e) => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }
const blurDefault = (e) => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }
const MAX_REPLY_LENGTH = 1000

const ReplyModal = ({ mode, initialText, onCancel, onSubmit, submitting }) => {
  const [text, setText] = useState(initialText)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: 24, boxShadow: '0 24px 60px rgba(15,23,42,0.35)',
        width: '100%', maxWidth: 480, padding: 28
      }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
          {mode === 'edit' ? 'Edit Reply' : 'Reply to Review'}
        </h3>
        <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 16px' }}>
          Your response will be shown publicly under this review.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_REPLY_LENGTH))}
          placeholder="Write your response…"
          rows={5}
          autoFocus
          style={{
            width: '100%', background: '#F8FAFC', border: '1.5px solid #E2E8F0',
            borderRadius: 12, padding: '12px 14px', fontSize: 13.5, color: '#0F172A',
            outline: 'none', fontFamily: 'Inter, sans-serif', resize: 'vertical', boxSizing: 'border-box'
          }}
          onFocus={focusTeal} onBlur={blurDefault}
        />
        <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'right', margin: '6px 0 20px' }}>
          {text.length}/{MAX_REPLY_LENGTH}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel} disabled={submitting}
            style={{
              padding: '10px 20px', borderRadius: 99, border: '1.5px solid #E2E8F0',
              background: '#FFFFFF', color: '#475569', fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(text)} disabled={submitting || !text.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 99, border: 'none',
              background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
              color: '#FFFFFF', fontSize: 13.5, fontWeight: 700,
              cursor: (submitting || !text.trim()) ? 'not-allowed' : 'pointer',
              opacity: (submitting || !text.trim()) ? 0.7 : 1,
              boxShadow: '0 6px 18px rgba(37,99,235,0.30)', fontFamily: 'Inter, sans-serif'
            }}
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {submitting ? 'Saving…' : (mode === 'edit' ? 'Save Reply' : 'Submit Reply')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Hospitals can view their reviews and post an official reply, but never
// moderate (hide/delete) — that stays admin-only. Reuses the same public
// GET /api/review/hospital/:id endpoint the patient site uses.
const MyReviews = () => {
  const { hToken, backendUrl, hospitalProfile, getHospitalProfile, replyToReview, editReviewReply } = useContext(HospitalContext)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const [replyTarget, setReplyTarget] = useState(null)
  const [replySubmitting, setReplySubmitting] = useState(false)

  useEffect(() => {
    if (hToken) getHospitalProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hToken])

  useEffect(() => {
    const fetchReviews = async () => {
      if (!hospitalProfile?._id) return
      setLoading(true)
      try {
        const { data } = await axios.get(`${backendUrl}/api/review/hospital/${hospitalProfile._id}`, { params: { limit: 100 } })
        if (data.success) {
          setReviews(data.reviews)
          setStats({ total: data.total, distribution: data.distribution })
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [hospitalProfile?._id, backendUrl])

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase()
    let list = reviews.filter((r) => {
      if (ratingFilter !== 'all' && r.rating !== Number(ratingFilter)) return false
      if (query) {
        const haystack = `${r.userId?.name || ''} ${r.title || ''} ${r.comment || ''}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
    list = [...list].sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
      if (sortOrder === 'highest') return b.rating - a.rating
      return a.rating - b.rating
    })
    return list
  }, [reviews, search, ratingFilter, sortOrder])

  const submitReply = async (text) => {
    if (!replyTarget) return
    setReplySubmitting(true)
    try {
      const { reviewId, mode } = replyTarget
      const data = mode === 'edit'
        ? await editReviewReply(reviewId, text)
        : await replyToReview(reviewId, text)
      if (data.success) {
        setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, reply: data.review.reply } : r))
        setReplyTarget(null)
      }
    } finally {
      setReplySubmitting(false)
    }
  }

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <PageHero icon={MessageSquare} title="Reviews" description="See what patients are saying about your hospital." />

        {stats && stats.total > 0 && (
          <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', padding: '24px 28px', marginBottom: 20 }}>
            <RatingDistribution distribution={stats.distribution} total={stats.total} averageRating={hospitalProfile?.averageRating || 0} />
          </div>
        )}

        {/* TOOLBAR */}
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
              placeholder="Search reviews..."
              style={{ ...selectStyle, width: '100%', paddingLeft: 36, cursor: 'text' }}
            />
          </div>
          <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} style={selectStyle}>
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={selectStyle}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>

        {loading ? (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, overflow: 'hidden' }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filteredReviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredReviews.map((review) => (
              <div key={review._id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20, padding: 20, boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#2563EB', fontSize: 15, overflow: 'hidden' }}>
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
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={13} color={i <= review.rating ? '#FBBF24' : '#E2E8F0'} fill={i <= review.rating ? '#FBBF24' : '#E2E8F0'} />
                      ))}
                      <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 6 }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 13.5, color: '#0F172A', margin: '8px 0 2px' }}>{review.title}</p>
                    <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.6 }}>{review.comment}</p>
                    {review.adminReply && (
                      <div style={{ marginTop: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 10 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', margin: '0 0 3px' }}>Response from CuraLink</p>
                        <p style={{ fontSize: 12.5, color: '#475569', margin: 0 }}>{review.adminReply}</p>
                      </div>
                    )}

                    {review.reply?.text ? (
                      <div style={{
                        marginTop: 10, background: 'linear-gradient(135deg, #EFF6FF, #F0FDFA)',
                        border: '1px solid #BFDBFE', borderRadius: 14, padding: 14
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <p style={{ fontSize: 11.5, fontWeight: 800, color: '#2563EB', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <ShieldCheck size={13} color="#2563EB" /> Hospital Response
                          </p>
                          <button
                            onClick={() => setReplyTarget({ reviewId: review._id, mode: 'edit', initialText: review.reply.text })}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none',
                              color: '#2563EB', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '2px 4px', fontFamily: 'Inter, sans-serif'
                            }}
                          >
                            <Pencil size={11} /> Edit Reply
                          </button>
                        </div>
                        <p style={{ fontSize: 13, color: '#1E3A8A', lineHeight: 1.6, margin: '4px 0 6px' }}>{review.reply.text}</p>
                        <p style={{ fontSize: 10.5, color: '#64748B', margin: 0 }}>{new Date(review.reply.repliedAt).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyTarget({ reviewId: review._id, mode: 'create', initialText: '' })}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
                          background: '#FFFFFF', border: '1.5px solid #E2E8F0', color: '#2563EB',
                          fontSize: 12, fontWeight: 700, padding: '7px 16px', borderRadius: 99,
                          cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        <MessageSquare size={13} /> Reply
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
            <EmptyState
              icon={MessageSquare}
              title={reviews.length > 0 ? 'No Matching Reviews' : 'No Reviews Yet'}
              subtitle={reviews.length > 0 ? 'Try adjusting your search or filters.' : 'Patient reviews will appear here once submitted.'}
            />
          </div>
        )}
      </div>

      {replyTarget && (
        <ReplyModal
          mode={replyTarget.mode}
          initialText={replyTarget.initialText}
          submitting={replySubmitting}
          onCancel={() => setReplyTarget(null)}
          onSubmit={submitReply}
        />
      )}
    </div>
  )
}

export default MyReviews
