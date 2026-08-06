import React, { useContext, useEffect, useCallback, useMemo, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  CalendarDays,
  Star,
  CheckCircle2,
  XCircle,
  X,
  MapPin,
} from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'

const selectStyle = {
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid #E2E8F0',
  background: '#FFFFFF',
  color: '#334155',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
}

const UsersList = () => {
  const { users, aToken, getAllUsers, changeUserStatus } = useContext(AdminContext)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [viewedUser, setViewedUser] = useState(null)

  useEffect(() => {
    if (aToken) {
      getAllUsers().finally(() => setLoading(false))
    }
  }, [aToken, getAllUsers])

  const handleStatusChange = useCallback((id) => {
    changeUserStatus(id)
  }, [changeUserStatus])

  const handleViewProfile = useCallback((user) => {
    setViewedUser(user)
  }, [])

  const filteredUsers = useMemo(() => {
    let list = users || []

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      )
    }

    if (statusFilter) {
      const wantActive = statusFilter === 'active'
      list = list.filter((u) => (u.isActive ?? true) === wantActive)
    }

    const sorted = [...list]
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'appointments':
        sorted.sort((a, b) => (b.appointmentCount || 0) - (a.appointmentCount || 0))
        break
      case 'reviews':
        sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
        break
      case 'date':
      default:
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
    }

    return sorted
  }, [users, search, statusFilter, sortBy])

  const renderedUsers = useMemo(() => {
    return filteredUsers.map((item) => (
      <UserCard
        key={item._id}
        item={item}
        onStatusChange={handleStatusChange}
        onViewProfile={handleViewProfile}
      />
    ))
  }, [filteredUsers, handleStatusChange, handleViewProfile])

  return (
    <div
      className="curalink-fade-in"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)',
        padding: '36px 24px'
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero
          icon={Users}
          title="All Users"
          description="View and manage every registered patient account on CuraLink."
          action={
            <div
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
                padding: '10px 20px',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14B8A6' }} />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>
                Total Users: {users?.length || 0}
              </span>
            </div>
          }
        />

        {/* FILTER BAR */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                fontSize: 13.5,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
            <option value="date">Sort: Registration Date</option>
            <option value="name">Sort: Name</option>
            <option value="appointments">Sort: Appointments</option>
            <option value="reviews">Sort: Reviews</option>
          </select>
        </div>

        {/* USERS GRID CONTAINER */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {renderedUsers}
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, boxShadow: '0 8px 24px rgba(15,23,42,0.04)' }}>
            <EmptyState
              icon={Users}
              title="No Users Found"
              subtitle="No registered users match your current search and filters."
            />
          </div>
        )}

      </div>

      <UserProfileModal user={viewedUser} onClose={() => setViewedUser(null)} />
    </div>
  )
}

// CURALINK DESIGN SYSTEM USER CARD COMPONENT
const UserCard = ({ item, onStatusChange, onViewProfile }) => {
  const [hovered, setHovered] = useState(false)
  const isActive = item.isActive ?? true
  const registeredOn = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Unknown'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: hovered ? '0 12px 32px rgba(15,23,42,0.08)' : '0 8px 24px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ padding: '24px 20px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #F1F5F9' }}>
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: 56, height: 56, borderRadius: '50%', objectFit: 'cover',
            border: '2px solid #E2E8F0', flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <Mail size={11} color="#94A3B8" />
            <span style={{ fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.email}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: 12 }}>
          <Calendar size={13} />
          Registered {registeredOn}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarDays size={16} color="#64748B" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{item.appointmentCount || 0}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>Appointments</div>
            </div>
          </div>
          <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={16} color="#64748B" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{item.reviewCount || 0}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>Reviews</div>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '12px 14px',
            borderRadius: 16,
            background: isActive ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${isActive ? '#DCFCE7' : '#FEE2E2'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isActive ? <CheckCircle2 size={16} color="#16A34A" /> : <XCircle size={16} color="#DC2626" />}
            <span style={{ fontSize: 12.5, fontWeight: 700, color: isActive ? '#15803D' : '#B91C1C' }}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => onStatusChange(item._id)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute', inset: 0, backgroundColor: isActive ? '#16A34A' : '#CBD5E1',
              borderRadius: 99, transition: '0.25s ease', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <span style={{
                position: 'absolute', height: 18, width: 18, left: isActive ? 23 : 3, bottom: 3,
                backgroundColor: '#FFFFFF', borderRadius: '50%', transition: '0.25s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </span>
          </label>
        </div>

        <button
          onClick={() => onViewProfile(item)}
          style={{
            marginTop: 'auto',
            width: '100%',
            padding: '10px 14px',
            borderRadius: 12,
            border: 'none',
            background: '#2563EB',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          View Profile
        </button>
      </div>
    </div>
  )
}

// READ-ONLY PROFILE DETAIL MODAL
const UserProfileModal = ({ user, onClose }) => {
  if (!user) return null

  const isActive = user.isActive ?? true
  const registeredOn = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown'
  const address = [user.address?.line1, user.address?.line2].filter(Boolean).join(', ') || 'Not provided'

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0',
          boxShadow: '0 24px 60px rgba(15,23,42,0.28)', width: '100%', maxWidth: 480,
          padding: 28, position: 'relative', maxHeight: '85vh', overflowY: 'auto',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%',
            border: 'none', background: '#F1F5F9', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <X size={16} color="#64748B" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <img
            src={user.image}
            alt={user.name}
            style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #E2E8F0' }}
          />
          <div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', margin: 0 }}>{user.name}</h3>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6,
              fontSize: 11.5, fontWeight: 700, color: isActive ? '#15803D' : '#B91C1C',
              background: isActive ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${isActive ? '#DCFCE7' : '#FEE2E2'}`,
              padding: '4px 10px', borderRadius: 99,
            }}>
              {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <DetailRow icon={Mail} label="Email" value={user.email} />
          <DetailRow icon={Phone} label="Phone" value={user.phone || 'Not provided'} />
          <DetailRow icon={Calendar} label="Date of Birth" value={user.dob || 'Not provided'} />
          <DetailRow icon={Users} label="Gender" value={user.gender || 'Not provided'} />
          <DetailRow icon={MapPin} label="Address" value={address} />
          <DetailRow icon={CalendarDays} label="Registered On" value={registeredOn} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>{user.appointmentCount || 0}</div>
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Appointments</div>
          </div>
          <div style={{ flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>{user.reviewCount || 0}</div>
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Reviews</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DetailRow = (props) => {
  const Icon = props.icon
  const { label, value } = props
  return (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
    <div style={{
      width: 32, height: 32, borderRadius: 9, background: '#EFF6FF', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
    }}>
      <Icon size={14} color="#2563EB" />
    </div>
    <div>
      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 13.5, color: '#0F172A', fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  </div>
  )
}

export default React.memo(UsersList)
