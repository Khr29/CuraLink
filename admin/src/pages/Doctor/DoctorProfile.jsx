import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  Star,
  MapPin,
  Building2,
  GraduationCap,
  Briefcase,
  Stethoscope,
  IndianRupee,
  ShieldCheck,
  Users,
  CalendarDays,
  Award,
  MessageSquare,
  ExternalLink,
  Pencil,
  X,
  Check,
  Loader2,
  AlertCircle,
  UserRound,
  Camera,
  Phone,
  Mail,
  Clock,
  Languages as LanguagesIcon,
  Plus,
  Trash2
} from 'lucide-react'
import EmptyState from '../../components/EmptyState'
import ConfirmDialog from '../../components/ConfirmDialog'
import { SectionCard, StarRow, Field, inputStyle, inputErrorStyle, focusTeal, blurDefault } from '../../components/ProfileUI'
import { formatExperience, formatExperienceYears, parseExperienceYears } from '../../utils/experience'

const REVIEW_PAGE_SIZE = 3
const DISTRIBUTION_SAMPLE_SIZE = 50

const MAX_REPLY_LENGTH = 1000

const SPECIALITY_OPTIONS = [
  'General physician',
  'Gynecologist',
  'Dermatologist',
  'Pediatricians',
  'Neurologist',
  'Gastroenterologist',
]

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

const DoctorProfile = () => {
  const {
    dToken, profileData, setProfileData, getProfileData, backendUrl, dashData, getDashData, replyToReview, editReviewReply,
  } = useContext(DoctorContext)

  const [replyTarget, setReplyTarget] = useState(null) // { reviewId, mode: 'create'|'edit', initialText }
  const [replySubmitting, setReplySubmitting] = useState(false)

  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [removeAvatarConfirmOpen, setRemoveAvatarConfirmOpen] = useState(false)
  const [languageInput, setLanguageInput] = useState('')

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setImageRemoved(false)
  }

  const confirmRemoveAvatar = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageRemoved(true)
    setRemoveAvatarConfirmOpen(false)
  }

  const addLanguage = () => {
    const value = languageInput.trim()
    if (!value) return
    setProfileData(prev => ({ ...prev, languages: [...(prev.languages || []), value] }))
    setLanguageInput('')
  }

  const removeLanguage = (index) => {
    setProfileData(prev => ({ ...prev, languages: (prev.languages || []).filter((_, i) => i !== index) }))
  }

  const [hospital, setHospital] = useState(null)
  const [todayCount, setTodayCount] = useState(0)

  const [reviews, setReviews] = useState([])
  const [reviewsTotal, setReviewsTotal] = useState(0)
  const [reviewsShown, setReviewsShown] = useState(REVIEW_PAGE_SIZE)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [distribution, setDistribution] = useState([0, 0, 0, 0, 0]) // index 0 = 1★ ... index 4 = 5★

  useEffect(() => {
    if (dToken) {
      getProfileData()
      getDashData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dToken])

  // Hospital card data — independent doctors have no hospitalId, so this
  // simply stays null rather than fetching (handled explicitly below,
  // instead of showing "Loading hospital…" forever).
  useEffect(() => {
    const fetchHospital = async () => {
      if (!profileData?.hospitalId) {
        setHospital(null)
        return
      }
      try {
        const { data } = await axios.get(`${backendUrl}/api/hospital/${profileData.hospitalId}`)
        if (data.success) setHospital(data.hospital)
      } catch (error) {
        console.error(error)
      }
    }
    fetchHospital()
  }, [profileData?.hospitalId, backendUrl])

  // Today's schedule count (for the Availability card)
  useEffect(() => {
    const fetchToday = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/doctor/appointments`, { headers: { dToken } })
        if (data.success) {
          const today = new Date()
          const todayKey = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`
          setTodayCount(data.appointments.filter(a => a.slotDate === todayKey && !a.cancelled).length)
        }
      } catch (error) {
        console.error(error)
      }
    }
    if (dToken) fetchToday()
  }, [dToken, backendUrl])

  // Review list (paginated "view all")
  useEffect(() => {
    const fetchReviews = async () => {
      if (!profileData?._id) return
      setReviewsLoading(true)
      try {
        const { data } = await axios.get(`${backendUrl}/api/review/doctor/${profileData._id}`, { params: { limit: reviewsShown } })
        if (data.success) {
          setReviews(data.reviews)
          setReviewsTotal(data.total)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setReviewsLoading(false)
      }
    }
    fetchReviews()
  }, [profileData?._id, backendUrl, reviewsShown])

  // Rating distribution (sampled from up to 50 most-recent reviews — reuses the
  // same public endpoint, no new backend aggregate required)
  useEffect(() => {
    const fetchDistribution = async () => {
      if (!profileData?._id) return
      try {
        const { data } = await axios.get(`${backendUrl}/api/review/doctor/${profileData._id}`, { params: { limit: DISTRIBUTION_SAMPLE_SIZE } })
        if (data.success) {
          const counts = [0, 0, 0, 0, 0]
          data.reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++ })
          setDistribution(counts)
        }
      } catch (error) {
        console.error(error)
      }
    }
    fetchDistribution()
  }, [profileData?._id, backendUrl])

  const recommendPercent = useMemo(() => {
    const total = distribution.reduce((a, b) => a + b, 0)
    if (total === 0) return null
    const fourPlus = distribution[3] + distribution[4]
    return Math.round((fourPlus / total) * 100)
  }, [distribution])

  const maxBucket = Math.max(1, ...distribution)

  const validate = () => {
    const next = {}
    const feesNum = Number(profileData.fees)
    if (!profileData.name?.trim()) next.name = 'Name is required'
    if (!Number.isFinite(feesNum) || feesNum <= 0) next.fees = 'Enter a valid consultation fee'
    if (!profileData.address?.line1?.trim()) next.line1 = 'Address line 1 is required'
    if (imageRemoved && !imageFile) next.image = 'Please upload a new profile picture, or cancel the removal'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const updateProfile = async () => {
    if (!validate()) {
      toast.warn('Please fix the highlighted fields')
      return
    }
    try {
      setSaving(true)
      const formData = new FormData()
      formData.append('name', profileData.name)
      formData.append('phone', profileData.phone || '')
      formData.append('about', profileData.about || '')
      formData.append('degree', profileData.degree || '')
      formData.append('experience', profileData.experience || '')
      formData.append('speciality', profileData.speciality || '')
      formData.append('workingHours', profileData.workingHours || '')
      formData.append('languages', JSON.stringify(profileData.languages || []))
      formData.append('fees', profileData.fees)
      formData.append('address', JSON.stringify(profileData.address))
      formData.append('available', profileData.available)
      if (imageFile) formData.append('image', imageFile)

      const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', formData, { headers: { dToken } })
      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        setErrors({})
        setImageFile(null)
        setImagePreview(null)
        setImageRemoved(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = useCallback(() => {
    setIsEdit(false)
    setErrors({})
    setImageFile(null)
    setImagePreview(null)
    setImageRemoved(false)
    setLanguageInput('')
    getProfileData() // discard any unsaved local edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'

  if (!profileData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ width: 44, height: 44, border: '3px solid #E2E8F0', borderTopColor: '#14B8A6', borderRadius: '50%', animation: 'curalink-spin .7s linear infinite' }} />
        <style>{'@keyframes curalink-spin { to { transform: rotate(360deg); } }'}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '32px 24px 48px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ══════════ HERO ══════════ */}
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 28,
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 45%, #2563EB 75%, #14B8A6 100%)',
          padding: '40px 32px', marginBottom: 24,
          boxShadow: '0 24px 60px rgba(15,23,42,0.28)'
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(20,184,166,0.20) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(37,99,235,0.20) 0%, transparent 50%)
            `
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {(imagePreview || (profileData.image && !imageRemoved)) ? (
                  <img
                    src={imagePreview || profileData.image}
                    alt={profileData.name}
                    style={{ width: 104, height: 104, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.85)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
                  />
                ) : (
                  <div style={{
                    width: 104, height: 104, borderRadius: '50%', border: '4px dashed rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <UserRound size={36} color="rgba(255,255,255,0.6)" />
                  </div>
                )}
                {isEdit && (
                  <>
                    <label
                      htmlFor="doctor-avatar-upload"
                      title="Change profile picture"
                      style={{
                        position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563EB, #14B8A6)', border: '3px solid #0F172A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.35)'
                      }}
                    >
                      <Camera size={14} color="#FFFFFF" />
                      <input id="doctor-avatar-upload" type="file" accept="image/*" hidden onChange={handleImageSelect} />
                    </label>
                    {(imagePreview || (profileData.image && !imageRemoved)) && (
                      <button
                        type="button"
                        title="Remove profile picture"
                        onClick={() => imageFile ? confirmRemoveAvatar() : setRemoveAvatarConfirmOpen(true)}
                        style={{
                          position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderRadius: '50%',
                          background: 'rgba(220,38,38,0.92)', border: '3px solid #0F172A',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.35)'
                        }}
                      >
                        <Trash2 size={10} color="#FFFFFF" />
                      </button>
                    )}
                  </>
                )}
                {errors.image && (
                  <p style={{ color: '#FCA5A5', fontSize: 11, margin: '6px 0 0', maxWidth: 130, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <AlertCircle size={11} /> {errors.image}
                  </p>
                )}
              </div>
              <div>
                {isEdit ? (
                  <>
                    <input
                      type="text" value={profileData.name || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                      style={{
                        fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em',
                        background: '#FFFFFF', border: errors.name ? '1.5px solid #EF4444' : '1.5px solid transparent',
                        borderRadius: 10, padding: '8px 14px', marginBottom: 6, outline: 'none',
                        fontFamily: 'Inter, sans-serif', minWidth: 220
                      }}
                    />
                    {errors.name && <p style={{ color: '#FCA5A5', fontSize: 11.5, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} /> {errors.name}</p>}
                  </>
                ) : (
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px', letterSpacing: '-0.01em' }}>{profileData.name}</h1>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)', color: '#E2F8F5', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99 }}>
                    <Stethoscope size={12} /> {profileData.speciality}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)', color: '#E2F8F5', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99 }}>
                    <Award size={12} /> {formatExperience(profileData.experience)}
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: profileData.available ? 'rgba(34,197,94,0.18)' : 'rgba(148,163,184,0.18)',
                    border: `1px solid ${profileData.available ? 'rgba(94,234,212,0.4)' : 'rgba(255,255,255,0.25)'}`,
                    color: profileData.available ? '#5EEAD4' : '#CBD5E1',
                    fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99
                  }}>
                    {profileData.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 13.5, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {!profileData.hospitalId ? (
                    <><UserRound size={14} /> Independent Practice</>
                  ) : (
                    <><Building2 size={14} /> {hospital ? hospital.name : 'Loading hospital…'}</>
                  )}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRow rating={profileData.averageRating} />
                  <span style={{ color: '#FFFFFF', fontSize: 13.5, fontWeight: 700 }}>
                    {profileData.totalReviews > 0 ? profileData.averageRating.toFixed(1) : 'New'}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12.5 }}>
                    ({profileData.totalReviews || 0} review{profileData.totalReviews === 1 ? '' : 's'})
                  </span>
                </div>
              </div>
            </div>

            {!isEdit && (
              <button
                onClick={() => setIsEdit(true)}
                className="shine"
                style={{
                  background: 'rgba(255,255,255,0.95)', color: '#0F172A', border: 'none',
                  borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.25)', transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Pencil size={15} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* ══════════ STATISTICS ══════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { icon: Users, label: 'Patients Treated', value: dashData?.patients ?? '—', bg: '#F0FDFA', color: '#14B8A6' },
            { icon: CalendarDays, label: 'Appointments', value: dashData?.appointments ?? '—', bg: '#EFF6FF', color: '#2563EB' },
            { icon: Star, label: 'Average Rating', value: profileData.totalReviews > 0 ? profileData.averageRating.toFixed(1) : 'New', bg: '#FFFBEB', color: '#D97706' },
            { icon: MessageSquare, label: 'Reviews', value: profileData.totalReviews || 0, bg: '#F0FDF4', color: '#22C55E' },
            { icon: Award, label: 'Years Experience', value: formatExperience(profileData.experience), bg: '#EFF6FF', color: '#2563EB' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#FFFFFF', borderRadius: 18, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', padding: '18px 18px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <s.icon size={18} color={s.color} />
              </div>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11.5, color: '#64748B', marginTop: 6 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ══════════ PROFESSIONAL INFORMATION ══════════ */}
        <SectionCard title="Professional Information" icon={GraduationCap}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 32px' }} className="curalink-profile-grid">
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="About">
                {isEdit ? (
                  <textarea
                    value={profileData.about || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                    rows={4} placeholder="Tell patients about your background and practice…"
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={focusTeal} onBlur={blurDefault}
                  />
                ) : (
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>{profileData.about}</p>
                )}
              </Field>
            </div>

            <Field label="Education">
              {isEdit ? (
                <input
                  type="text" value={profileData.degree || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="e.g. MBBS, MD" style={inputStyle}
                  onFocus={focusTeal} onBlur={blurDefault}
                />
              ) : (
                <p style={{ fontSize: 14, color: '#0F172A', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <GraduationCap size={15} color="#94A3B8" /> {profileData.degree}
                </p>
              )}
            </Field>

            <Field label="Speciality">
              {isEdit ? (
                <select
                  value={profileData.speciality || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, speciality: e.target.value }))}
                  style={inputStyle}
                  onFocus={focusTeal} onBlur={blurDefault}
                >
                  {SPECIALITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <p style={{ fontSize: 14, color: '#0F172A', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Stethoscope size={15} color="#94A3B8" /> {profileData.speciality}
                </p>
              )}
            </Field>

            <Field label="Experience">
              {isEdit ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="number" min={0}
                    value={parseExperienceYears(profileData.experience) ?? ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, experience: formatExperienceYears(e.target.value) }))}
                    style={inputStyle}
                    onFocus={focusTeal} onBlur={blurDefault}
                  />
                  <span style={{ fontSize: 13, color: '#64748B', flexShrink: 0 }}>years</span>
                </div>
              ) : (
                <p style={{ fontSize: 14, color: '#0F172A', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Briefcase size={15} color="#94A3B8" /> {formatExperience(profileData.experience)}
                </p>
              )}
            </Field>

            <Field label="Phone">
              {isEdit ? (
                <input
                  type="tel" value={profileData.phone || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Contact number" style={inputStyle}
                  onFocus={focusTeal} onBlur={blurDefault}
                />
              ) : (
                <p style={{ fontSize: 14, color: '#0F172A', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Phone size={15} color="#94A3B8" /> {profileData.phone || '—'}
                </p>
              )}
            </Field>

            <Field label="Email">
              <p style={{ fontSize: 14, color: '#0F172A', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Mail size={15} color="#94A3B8" /> {profileData.email}
              </p>
              {isEdit && <p style={{ fontSize: 11, color: '#94A3B8', margin: '5px 0 0' }}>Contact support to change your login email.</p>}
            </Field>

            <Field label="Working Hours">
              {isEdit ? (
                <input
                  type="text" value={profileData.workingHours || ''}
                  onChange={(e) => setProfileData(prev => ({ ...prev, workingHours: e.target.value }))}
                  placeholder="e.g. Mon–Fri, 9:00 AM – 5:00 PM" style={inputStyle}
                  onFocus={focusTeal} onBlur={blurDefault}
                />
              ) : (
                <p style={{ fontSize: 14, color: '#0F172A', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Clock size={15} color="#94A3B8" /> {profileData.workingHours || '—'}
                </p>
              )}
            </Field>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Languages">
                {isEdit ? (
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: (profileData.languages || []).length ? 10 : 0 }}>
                      {(profileData.languages || []).map((lang, i) => (
                        <span key={`${lang}-${i}`} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0FDFA',
                          border: '1px solid #99F6E4', color: '#0D9488', fontSize: 12, fontWeight: 600,
                          padding: '5px 10px 5px 12px', borderRadius: 99
                        }}>
                          {lang}
                          <button
                            type="button" onClick={() => removeLanguage(i)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#0D9488', display: 'flex', padding: 0 }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text" value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage() } }}
                        placeholder="Add a language and press Enter"
                        style={{ ...inputStyle, flex: 1 }}
                        onFocus={focusTeal} onBlur={blurDefault}
                      />
                      <button
                        type="button" onClick={addLanguage}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', borderRadius: 10,
                          border: '1.5px solid #E2E8F0', background: '#FFFFFF', color: '#2563EB',
                          fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>
                ) : (profileData.languages || []).length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {profileData.languages.map((lang, i) => (
                      <span key={`${lang}-${i}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F0FDFA',
                        border: '1px solid #99F6E4', color: '#0D9488', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99
                      }}>
                        <LanguagesIcon size={11} /> {lang}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 14, color: '#94A3B8', margin: 0 }}>—</p>
                )}
              </Field>
            </div>

            <Field label="Consultation Fee">
              {isEdit ? (
                <>
                  <input
                    type="number" value={profileData.fees}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                    style={errors.fees ? inputErrorStyle : inputStyle}
                    onFocus={focusTeal} onBlur={blurDefault}
                  />
                  {errors.fees && <p style={{ color: '#EF4444', fontSize: 11.5, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} /> {errors.fees}</p>}
                </>
              ) : (
                <p style={{ fontSize: 18, fontWeight: 800, color: '#22C55E', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <IndianRupee size={16} />{profileData.fees}
                </p>
              )}
            </Field>

            <Field label="Hospital">
              <p style={{ fontSize: 14, color: '#0F172A', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                {!profileData.hospitalId ? (
                  <><UserRound size={15} color="#94A3B8" /> Independent Practice</>
                ) : (
                  <><Building2 size={15} color="#94A3B8" /> {hospital ? hospital.name : '—'}</>
                )}
              </p>
            </Field>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Clinic Address">
                {isEdit ? (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <input
                        type="text" value={profileData?.address?.line1 || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                        style={errors.line1 ? inputErrorStyle : inputStyle} placeholder="Address line 1"
                        onFocus={focusTeal} onBlur={blurDefault}
                      />
                      {errors.line1 && <p style={{ color: '#EF4444', fontSize: 11.5, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} /> {errors.line1}</p>}
                    </div>
                    <input
                      type="text" value={profileData?.address?.line2 || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                      style={{ ...inputStyle, flex: 1, minWidth: 200 }} placeholder="Address line 2"
                      onFocus={focusTeal} onBlur={blurDefault}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <MapPin size={15} color="#94A3B8" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 14, color: '#0F172A', fontWeight: 500, margin: 0 }}>{profileData?.address?.line1}</p>
                      <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{profileData?.address?.line2}</p>
                    </div>
                  </div>
                )}
              </Field>
            </div>
          </div>

          {isEdit && (
            <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid #F1F5F9' }}>
              <button
                onClick={updateProfile} disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', borderRadius: 99, border: 'none',
                  background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
                  color: '#FFFFFF', fontSize: 13.5, fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                  boxShadow: '0 6px 18px rgba(37,99,235,0.30)', fontFamily: 'Inter, sans-serif'
                }}
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={cancelEdit} disabled={saving}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px', borderRadius: 99, border: '1.5px solid #E2E8F0',
                  background: '#FFFFFF', color: '#475569', fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                }}
              >
                <X size={15} /> Cancel
              </button>
            </div>
          )}
        </SectionCard>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }} className="curalink-profile-grid">
          {/* ══════════ HOSPITAL CARD ══════════ */}
          <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', overflow: 'hidden' }}>
            {!profileData.hospitalId ? (
              <EmptyState icon={UserRound} title="Independent Practice" subtitle="You're not affiliated with any hospital right now." compact />
            ) : hospital ? (
              <>
                <div style={{ position: 'relative', height: 140, background: 'linear-gradient(135deg, #EFF6FF, #E0F2FE)' }}>
                  <img src={hospital.image} alt={hospital.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(8px)', color: '#FFFFFF', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99 }}>
                    {hospital.hospitalType}
                  </span>
                </div>
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>{hospital.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <StarRow rating={hospital.averageRating} size={13} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
                      {hospital.totalReviews > 0 ? hospital.averageRating.toFixed(1) : 'New'}
                    </span>
                    <span style={{ fontSize: 11.5, color: '#94A3B8' }}>({hospital.totalReviews || 0})</span>
                  </div>
                  {hospital.departments?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {hospital.departments.slice(0, 4).map((d) => (
                        <span key={d} style={{ fontSize: 11, fontWeight: 600, color: '#0D9488', background: '#F0FDFA', padding: '3px 10px', borderRadius: 99 }}>{d}</span>
                      ))}
                      {hospital.departments.length > 4 && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', padding: '3px 6px' }}>+{hospital.departments.length - 4} more</span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => window.open(`${frontendUrl}/hospital/${hospital._id}`, '_blank', 'noopener,noreferrer')}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: 'linear-gradient(135deg, #2563EB, #14B8A6)', color: '#FFFFFF',
                      border: 'none', borderRadius: 10, padding: '10px 0', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 6px 18px rgba(37,99,235,0.25)'
                    }}
                  >
                    View Hospital <ExternalLink size={14} />
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>Loading hospital…</div>
            )}
          </div>

          {/* ══════════ AVAILABILITY CARD ══════════ */}
          <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={16} color="#16A34A" />
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Availability</h2>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderRadius: 16, marginBottom: 18,
                background: profileData.available ? '#F0FDF4' : '#FFF1F2',
                border: `1px solid ${profileData.available ? '#BBF7D0' : '#FECDD3'}`
              }}>
                <div style={{
                  width: 46, height: 26, borderRadius: 99, position: 'relative', flexShrink: 0,
                  background: profileData.available ? '#22C55E' : '#CBD5E1', transition: 'background 0.25s'
                }}>
                  <div style={{
                    position: 'absolute', top: 3, left: profileData.available ? 23 : 3,
                    width: 20, height: 20, borderRadius: '50%', background: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.25s'
                  }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: profileData.available ? '#16A34A' : '#DC2626', margin: 0 }}>
                    {profileData.available ? 'Available for bookings' : 'Not accepting bookings'}
                  </p>
                  <p style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Toggle this from the Dashboard's Quick Actions</p>
                </div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 16, padding: '16px 18px', border: '1px solid #F1F5F9' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>Today's Schedule</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>{todayCount} appointment{todayCount === 1 ? '' : 's'}</p>
            </div>
          </div>
        </div>

        {/* ══════════ REVIEWS ══════════ */}
        <SectionCard title="Patient Reviews" icon={MessageSquare}>
          {/* Rating summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32, marginBottom: 24 }} className="curalink-rating-summary">
            <div style={{ textAlign: 'center', borderRight: '1px solid #F1F5F9', paddingRight: 24 }}>
              <p style={{ fontSize: 42, fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1 }}>
                {profileData.totalReviews > 0 ? profileData.averageRating.toFixed(1) : '—'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                <StarRow rating={profileData.averageRating} size={17} />
              </div>
              <p style={{ fontSize: 12.5, color: '#64748B', marginTop: 8 }}>{profileData.totalReviews || 0} review{profileData.totalReviews === 1 ? '' : 's'}</p>
              {recommendPercent !== null && (
                <p style={{ fontSize: 12, fontWeight: 700, color: '#16A34A', marginTop: 6 }}>{recommendPercent}% rated 4★ or higher</p>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star - 1]
                const pct = Math.round((count / maxBucket) * 100)
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#475569', width: 34, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                      {star} <Star size={11} color="#FBBF24" fill="#FBBF24" />
                    </span>
                    <div style={{ flex: 1, height: 8, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #14B8A6, #2563EB)', borderRadius: 99, transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: 11.5, color: '#94A3B8', width: 22, textAlign: 'right', flexShrink: 0 }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
            {reviewsLoading && reviews.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 13, padding: '20px 0' }}>Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No reviews yet" subtitle="Patient reviews will appear here once submitted." compact />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {reviews.map((review) => (
                  <div key={review._id} style={{ display: 'flex', gap: 12, paddingBottom: 18, borderBottom: '1px solid #F8FAFC' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {review.userId?.image ? (
                        <img src={review.userId.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#2563EB' }}>{review.userId?.name?.[0]?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: 0 }}>{review.userId?.name || 'Patient'}</p>
                        {review.verifiedPatient && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#0D9488', background: '#F0FDFA', padding: '2px 8px', borderRadius: 99 }}>
                            <ShieldCheck size={10} /> Verified Patient
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ margin: '5px 0' }}><StarRow rating={review.rating} size={12} /></div>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', margin: '4px 0 3px' }}>{review.title}</p>
                      <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>{review.comment}</p>
                      {review.adminReply && (
                        <div style={{ marginTop: 10, background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 12, padding: 12 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', margin: '0 0 3px' }}>Response from CuraLink</p>
                          <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>{review.adminReply}</p>
                        </div>
                      )}

                      {review.reply?.text ? (
                        <div style={{
                          marginTop: 10, background: 'linear-gradient(135deg, #EFF6FF, #F0FDFA)',
                          border: '1px solid #BFDBFE', borderRadius: 14, padding: 14
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <p style={{ fontSize: 11.5, fontWeight: 800, color: '#2563EB', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <ShieldCheck size={13} color="#2563EB" /> Doctor Response
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
                ))}

                {reviewsShown < reviewsTotal && (
                  <button
                    onClick={() => setReviewsShown(prev => prev + REVIEW_PAGE_SIZE)}
                    disabled={reviewsLoading}
                    style={{
                      alignSelf: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0',
                      color: '#0F172A', fontSize: 12.5, fontWeight: 700, padding: '9px 22px',
                      borderRadius: 99, cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {reviewsLoading ? 'Loading…' : `View All Reviews (${reviewsTotal - reviewsShown} more)`}
                  </button>
                )}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <style>{`
        @media (max-width: 780px) {
          .curalink-profile-grid { grid-template-columns: 1fr !important; }
          .curalink-rating-summary { grid-template-columns: 1fr !important; }
          .curalink-rating-summary > div:first-child { border-right: none !important; padding-right: 0 !important; border-bottom: 1px solid #F1F5F9; padding-bottom: 20px; }
        }
      `}</style>

      {replyTarget && (
        <ReplyModal
          mode={replyTarget.mode}
          initialText={replyTarget.initialText}
          submitting={replySubmitting}
          onCancel={() => setReplyTarget(null)}
          onSubmit={submitReply}
        />
      )}

      <ConfirmDialog
        open={removeAvatarConfirmOpen}
        title="Remove profile picture?"
        message="This clears your photo here. You'll need to upload a new one before saving."
        confirmLabel="Remove"
        destructive
        onConfirm={confirmRemoveAvatar}
        onClose={() => setRemoveAvatarConfirmOpen(false)}
      />
    </div>
  )
}

export default DoctorProfile
