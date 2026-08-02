

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
import React, { useContext, useEffect, useCallback, useMemo } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext)
  const { slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (aToken) getDashData()
  }, [aToken, getDashData])

  const handleCancel = useCallback((id) => {
    cancelAppointment(id)
  }, [cancelAppointment])

  const stats = useMemo(() => [
    { label: 'Total Doctors', value: dashData?.doctors, icon: assets.doctor_icon, color: '#6366F1', bg: '#EEF2FF', trend: '+2 this week' },
    { label: 'Appointments', value: dashData?.appointments, icon: assets.appointment_icon, color: '#14B8A6', bg: '#F0FDFA', trend: '+12 today' },
    { label: 'Patients', value: dashData?.patients, icon: assets.patients_icon, color: '#F59E0B', bg: '#FFFBEB', trend: '+5 new' }
  ], [dashData])

  return dashData && (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '28px 24px' }}>

      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Admin Dashboard</h1>
        <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {stats.map((item, i) => (
          <div key={i} style={{
            background: '#FFFFFF', borderRadius: 16, padding: '22px 24px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'box-shadow 0.2s, transform 0.2s',
            cursor: 'default'
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={item.icon} alt={item.label} style={{ width: 24, height: 24 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#22C55E', background: '#F0FDF4', padding: '3px 8px', borderRadius: 99 }}>
                {item.trend}
              </span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>{item.value}</p>
            <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Latest Bookings */}
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Table Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14B8A6' }} />
            <p style={{ fontWeight: 600, color: '#0F172A', fontSize: 15, margin: 0 }}>Latest Bookings</p>
          </div>
          <span style={{ fontSize: 12, color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: 99 }}>
            {dashData.latestAppointments?.length || 0} records
          </span>
        </div>

        {/* Rows */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {dashData.latestAppointments?.length > 0 ? (
            dashData.latestAppointments.map((item, index) => {
              const doctor = item.docData || {}
              return (
                <div key={item._id || index} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 24px', borderBottom: '1px solid #F8FAFC',
                  transition: 'background 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <img src={doctor.image} alt='' style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, margin: 0 }}>{doctor.name}</p>
                    <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{slotDateFormat(item.slotDate)}</p>
                  </div>
                  <div>
                    {item.cancelled ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', background: '#FEE2E2', padding: '4px 10px', borderRadius: 99 }}>Cancelled</span>
                    ) : item.isCompleted ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', background: '#DCFCE7', padding: '4px 10px', borderRadius: 99 }}>Completed</span>
                    ) : (
                      <button onClick={() => handleCancel(item._id)} style={{
                        background: '#FEE2E2', border: 'none', borderRadius: 8, padding: '6px 12px',
                        color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FECACA'}
                        onMouseLeave={e => e.currentTarget.style.background = '#FEE2E2'}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
              <p style={{ fontSize: 14 }}>No recent bookings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(Dashboard)