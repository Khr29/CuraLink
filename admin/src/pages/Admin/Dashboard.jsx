

// import React, { useContext, useEffect, useCallback, useMemo } from 'react'
// import { AdminContext } from '../../context/AdminContext'
// import { AppContext } from '../../context/AppContext'
// import { assets } from '../../assets/assets'

// const Dashboard = () => {

//   const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
//   const { slotDateFormat } = useContext(AppContext)

//   // 🔥 fetch data
//   useEffect(() => {
//     if (aToken) {
//       getDashData()
//     }
//   }, [aToken, getDashData])

//   // 🔥 memo cancel
//   const handleCancel = useCallback((id) => {
//     cancelAppointment(id)
//   }, [cancelAppointment])

//   // 🔥 stats config (clean + scalable)
//   const stats = useMemo(() => [
//     { label: 'Doctors', value: dashData?.doctors, icon: assets.doctor_icon },
//     { label: 'Appointments', value: dashData?.appointments, icon: assets.appointment_icon },
//     { label: 'Patients', value: dashData?.patients, icon: assets.patients_icon }
//   ], [dashData])

//   return dashData && (
//     <div className='w-full px-3 sm:px-5 md:px-8 py-4'>

//       {/* 🔥 Stats Cards */}
//       <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>

//         {stats.map((item, index) => (
//           <div
//             key={index}
//             className='flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all'
//           >
//             <img className='w-12 sm:w-14' src={item.icon} alt='' />
//             <div>
//               <p className='text-lg sm:text-xl font-semibold text-gray-700'>
//                 {item.value}
//               </p>
//               <p className='text-gray-400 text-sm'>
//                 {item.label}
//               </p>
//             </div>
//           </div>
//         ))}

//       </div>

//       {/* 🔥 Latest Bookings */}
//       <div className='bg-white mt-8 rounded-xl shadow-sm border overflow-hidden'>

//         {/* Header */}
//         <div className='flex items-center gap-2 px-4 py-4 border-b bg-gray-50'>
//           <img src={assets.list_icon} alt='' />
//           <p className='font-semibold text-gray-700'>Latest Bookings</p>
//         </div>

//         {/* List */}
//         <div className='max-h-[60vh] overflow-y-auto'>

//           {dashData.latestAppointments?.length > 0 ? (
//             dashData.latestAppointments.map((item, index) => {

//               const doctor = item.docData || {}

//               return (
//                 <div
//                   key={item._id || index}
//                   className='flex items-center gap-3 px-4 sm:px-6 py-3 border-b hover:bg-gray-50 transition'
//                 >

//                   {/* Doctor Image */}
//                   <img
//                     className='w-10 h-10 rounded-full object-cover'
//                     src={doctor.image}
//                     alt=''
//                   />

//                   {/* Info */}
//                   <div className='flex-1 text-sm'>
//                     <p className='text-gray-800 font-medium'>
//                       {doctor.name}
//                     </p>
//                     <p className='text-gray-500 text-xs sm:text-sm'>
//                       {slotDateFormat(item.slotDate)}
//                     </p>
//                   </div>

//                   {/* Status */}
//                   <div>
//                     {item.cancelled ? (
//                       <p className='text-red-500 text-xs font-semibold'>
//                         Cancelled
//                       </p>
//                     ) : item.isCompleted ? (
//                       <p className='text-green-500 text-xs font-semibold'>
//                         Completed
//                       </p>
//                     ) : (
//                       <img
//                         onClick={() => handleCancel(item._id)}
//                         className='w-8 sm:w-9 cursor-pointer hover:scale-110 transition'
//                         src={assets.cancel_icon}
//                         alt='cancel'
//                       />
//                     )}
//                   </div>

//                 </div>
//               )
//             })
//           ) : (
//             <p className='text-center text-gray-400 py-10'>
//               No Recent Bookings
//             </p>
//           )}

//         </div>

//       </div>

//     </div>
//   )
// }

// export default React.memo(Dashboard)
import React, { useContext, useEffect, useCallback, useMemo, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { 
  LayoutDashboard, 
  Stethoscope, 
  CalendarDays, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Ban,
  TrendingUp,
  ListFilter
} from 'lucide-react'

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  // Fetch dashboard metrics and appointments
  useEffect(() => {
    if (aToken) {
      getDashData()
    }
  }, [aToken, getDashData])

  // Memoized cancel handler
  const handleCancel = useCallback((id) => {
    cancelAppointment(id)
  }, [cancelAppointment])

  // Stats cards configuration
  const stats = useMemo(() => [
    { 
      label: 'Total Doctors', 
      value: dashData?.doctors ?? 0, 
      icon: Stethoscope, 
      gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      trend: '+2 this week' 
    },
    { 
      label: 'Appointments', 
      value: dashData?.appointments ?? 0, 
      icon: CalendarDays, 
      gradient: 'linear-gradient(135deg, #14B8A6, #0D9488)',
      iconBg: '#F0FDFA',
      iconColor: '#14B8A6',
      trend: '+12 today' 
    },
    { 
      label: 'Total Patients', 
      value: dashData?.patients ?? 0, 
      icon: Users, 
      gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)',
      iconBg: '#EEF2FF',
      iconColor: '#6366F1',
      trend: '+5 new' 
    }
  ], [dashData])

  if (!dashData) return null

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)',
        padding: '36px 24px'
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        
        {/* PAGE HEADER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #2563EB, #14B8A6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(37,99,235,0.25)'
              }}
            >
              <LayoutDashboard size={26} color="#FFFFFF" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                Admin Dashboard
              </h1>
              <p style={{ fontSize: 14, color: '#64748B', marginTop: 3 }}>
                Welcome to the CuraLink administrative and activity overview.
              </p>
            </div>
          </div>

          {/* STATUS INDICATOR BADGE */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              padding: '10px 20px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 4px 12px rgba(15,23,42,0.03)'
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
              System Status: <span style={{ color: '#16A34A' }}>Live</span>
            </span>
          </div>
        </div>

        {/* STATS METRICS GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            marginBottom: 32
          }}
        >
          {stats.map((item, index) => (
            <StatCard key={index} item={item} />
          ))}
        </div>

        {/* LATEST BOOKINGS SECTION */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
            overflow: 'hidden'
          }}
        >
          {/* CARD HEADER */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              background: '#F8FAFC'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ListFilter size={18} color="#2563EB" />
              </div>
              <p style={{ fontWeight: 700, color: '#0F172A', fontSize: 16, margin: 0 }}>
                Latest Bookings
              </p>
            </div>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: '#2563EB',
                background: '#EFF6FF',
                padding: '5px 12px',
                borderRadius: 99
              }}
            >
              {dashData.latestAppointments?.length || 0} Recent
            </span>
          </div>

          {/* APPOINTMENT LIST CONTAINER */}
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {dashData.latestAppointments?.length > 0 ? (
              dashData.latestAppointments.map((item, index) => (
                <BookingRow
                  key={item._id || index}
                  item={item}
                  slotDateFormat={slotDateFormat}
                  onCancel={handleCancel}
                />
              ))
            ) : (
              /* EMPTY STATE */
              <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <CalendarDays size={28} color="#2563EB" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                  No Recent Bookings
                </h3>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                  There are no recent appointment records available at this time.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// CURALINK METRIC STAT CARD COMPONENT
const StatCard = ({ item }) => {
  const [hovered, setHovered] = useState(false)
  const IconComponent = item.icon

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFFFF',
        borderRadius: 24,
        padding: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: hovered ? '0 12px 32px rgba(15,23,42,0.08)' : '0 8px 24px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 16,
            background: item.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <IconComponent size={24} color={item.iconColor} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11.5,
            fontWeight: 700,
            color: '#15803D',
            background: '#F0FDF4',
            padding: '4px 10px',
            borderRadius: 99
          }}
        >
          <TrendingUp size={12} />
          <span>{item.trend}</span>
        </div>
      </div>

      <div>
        <p style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', lineHeight: 1, margin: 0, letterSpacing: '-0.02em' }}>
          {item.value}
        </p>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: '#64748B', marginTop: 6, margin: '6px 0 0' }}>
          {item.label}
        </p>
      </div>
    </div>
  )
}

// CURALINK BOOKING ROW COMPONENT
const BookingRow = ({ item, slotDateFormat, onCancel }) => {
  const [hovered, setHovered] = useState(false)
  const [cancelHovered, setCancelHovered] = useState(false)
  const doctor = item.docData || {}

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '16px 24px',
        borderBottom: '1px solid #F1F5F9',
        background: hovered ? '#F8FAFC' : '#FFFFFF',
        transition: 'background 0.2s ease'
      }}
    >
      {/* DOCTOR INFORMATION */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
        <img
          src={doctor.image}
          alt={doctor.name}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #E2E8F0',
            background: '#F1F5F9'
          }}
        />
        <div>
          <p style={{ fontWeight: 700, color: '#0F172A', fontSize: 14.5, margin: 0 }}>
            {doctor.name || 'Doctor'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <Clock size={12} color="#94A3B8" />
            <span style={{ color: '#64748B', fontSize: 12 }}>
              {slotDateFormat(item.slotDate)}
            </span>
          </div>
        </div>
      </div>

      {/* STATUS AND ACTION BUTTON */}
      <div>
        {item.cancelled ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: '#EF4444',
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              padding: '6px 12px',
              borderRadius: 99
            }}
          >
            <Ban size={14} /> Cancelled
          </div>
        ) : item.isCompleted ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: '#10B981',
              background: '#ECFDF5',
              border: '1px solid #D1FAE5',
              padding: '6px 12px',
              borderRadius: 99
            }}
          >
            <CheckCircle2 size={14} /> Completed
          </div>
        ) : (
          <button
            onClick={() => onCancel(item._id)}
            onMouseEnter={() => setCancelHovered(true)}
            onMouseLeave={() => setCancelHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: cancelHovered ? '#EF4444' : '#FFFFFF',
              border: cancelHovered ? '1px solid #EF4444' : '1px solid #E2E8F0',
              color: cancelHovered ? '#FFFFFF' : '#EF4444',
              borderRadius: 99,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: cancelHovered ? '0 4px 12px rgba(239, 68, 68, 0.2)' : 'none'
            }}
          >
            <XCircle size={14} /> Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default React.memo(Dashboard)