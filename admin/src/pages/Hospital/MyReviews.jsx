import React, { useContext, useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { HospitalContext } from '../../context/HospitalContext'
import { MessageSquare, Star, Search, ShieldCheck } from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import RatingDistribution from '../../components/RatingDistribution'
import { SkeletonRow } from '../../components/Skeleton'

const selectStyle = {
  height: 40, background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 12,
  padding: '0 12px', fontSize: 13, color: '#0F172A', outline: 'none',
  fontFamily: 'Inter, sans-serif', cursor: 'pointer'
}

// Read-only — hospitals can view but never moderate their own reviews.
// Reuses the same public GET /api/review/hospital/:id endpoint the patient
// site uses, so there is no separate review-fetching path to maintain.
const MyReviews = () => {
  const { hToken, backendUrl, hospitalProfile, getHospitalProfile } = useContext(HospitalContext)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

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
    </div>
  )
}

export default MyReviews
