

// import React, { useContext, useEffect } from 'react'
// import { DoctorContext } from '../../context/DoctorContext'
// import { AppContext } from '../../context/AppContext'
// import { assets } from '../../assets/assets'

// const DoctorDashboard = () => {

//   const { dashData, getDashData, dToken, cancelAppointment, completeAppointment } = useContext(DoctorContext)
//   const { currency, slotDateFormat } = useContext(AppContext)

//   useEffect(() => {
//     if (dToken) getDashData()
//   }, [dToken])

//   if (!dashData) return null

//   return (
//     <div className='p-4 sm:p-6'>

//       {/* 🔥 Top Cards */}
//       <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>

//         <div className='flex items-center gap-4 bg-white p-5 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all'>
//           <img className='w-12' src={assets.earning_icon} alt='' />
//           <div>
//             <p className='text-xl font-semibold text-gray-700'>
//               {currency}{dashData.earnings}
//             </p>
//             <p className='text-gray-400 text-sm'>Earnings</p>
//           </div>
//         </div>

//         <div className='flex items-center gap-4 bg-white p-5 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all'>
//           <img className='w-12' src={assets.appointment_icon} alt='' />
//           <div>
//             <p className='text-xl font-semibold text-gray-700'>
//               {dashData.appointments}
//             </p>
//             <p className='text-gray-400 text-sm'>Appointments</p>
//           </div>
//         </div>

//         <div className='flex items-center gap-4 bg-white p-5 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all'>
//           <img className='w-12' src={assets.patients_icon} alt='' />
//           <div>
//             <p className='text-xl font-semibold text-gray-700'>
//               {dashData.patients}
//             </p>
//             <p className='text-gray-400 text-sm'>Patients</p>
//           </div>
//         </div>

//       </div>

//       {/* 🔥 Latest Appointments */}
//       <div className='mt-8 bg-white rounded-xl border shadow-sm'>

//         {/* Header */}
//         <div className='flex items-center gap-2 px-4 py-4 border-b'>
//           <img src={assets.list_icon} alt='' />
//           <p className='font-semibold text-gray-700'>Latest Bookings</p>
//         </div>

//         {/* List */}
//         <div className='divide-y'>

//           {dashData.latestAppointments.map((item, index) => (
//             <div
//               key={index}
//               className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-all'
//             >

//               {/* Left */}
//               <div className='flex items-center gap-3'>
//                 <img
//                   className='w-10 h-10 rounded-full object-cover'
//                   src={item.userData.image}
//                   alt=''
//                 />
//                 <div>
//                   <p className='text-gray-800 font-medium text-sm sm:text-base'>
//                     {item.userData.name}
//                   </p>
//                   <p className='text-gray-500 text-xs'>
//                     {slotDateFormat(item.slotDate)}
//                   </p>
//                 </div>
//               </div>

//               {/* Right Actions */}
//               <div className='flex items-center gap-2'>

//                 {item.cancelled ? (
//                   <span className='text-red-400 text-xs font-medium'>
//                     Cancelled
//                   </span>
//                 ) : item.isCompleted ? (
//                   <span className='text-green-500 text-xs font-medium'>
//                     Completed
//                   </span>
//                 ) : (
//                   <div className='flex gap-2'>
//                     <img
//                       onClick={() => cancelAppointment(item._id)}
//                       className='w-8 cursor-pointer hover:scale-110 transition'
//                       src={assets.cancel_icon}
//                       alt=''
//                     />
//                     <img
//                       onClick={() => completeAppointment(item._id)}
//                       className='w-8 cursor-pointer hover:scale-110 transition'
//                       src={assets.tick_icon}
//                       alt=''
//                     />
//                   </div>
//                 )}

//               </div>

//             </div>
//           ))}

//         </div>
//       </div>

//     </div>
//   )
// }

// export default DoctorDashboard
import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorDashboard = () => {
  const { dashData, getDashData, dToken, cancelAppointment, completeAppointment } = useContext(DoctorContext)
  const { currency, slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (dToken) getDashData()
  }, [dToken])

  if (!dashData) return null

  const stats = [
    { label: 'Total Earnings', value: `${currency}${dashData.earnings}`, icon: assets.earning_icon, color: '#22C55E', bg: '#F0FDF4', border: '#BBF7D0' },
    { label: 'Appointments', value: dashData.appointments, icon: assets.appointment_icon, color: '#14B8A6', bg: '#F0FDFA', border: '#99F6E4' },
    { label: 'Patients', value: dashData.patients, icon: assets.patients_icon, color: '#6366F1', bg: '#EEF2FF', border: '#C7D2FE' }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '28px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Doctor Dashboard</h1>
        <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Here's your practice overview for today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
        {stats.map((item, i) => (
          <div key={i} style={{
            background: '#FFFFFF', borderRadius: 16, padding: '22px 24px',
            border: `1px solid ${item.border}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'default'
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={item.icon} alt={item.label} style={{ width: 24, height: 24 }} />
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1, margin: 0 }}>{item.value}</p>
            <p style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Latest Appointments */}
      <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
            <p style={{ fontWeight: 600, color: '#0F172A', fontSize: 15, margin: 0 }}>Latest Bookings</p>
          </div>
          <span style={{ fontSize: 12, color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: 99 }}>
            {dashData.latestAppointments?.length || 0} records
          </span>
        </div>

        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {dashData.latestAppointments.map((item, index) => (
            <div key={index} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 24px', borderBottom: '1px solid #F8FAFC',
              transition: 'background 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <img src={item.userData.image} alt='' style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, margin: 0 }}>{item.userData.name}</p>
                <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 2 }}>{slotDateFormat(item.slotDate)}</p>
              </div>
              <div>
                {item.cancelled ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', background: '#FEE2E2', padding: '4px 10px', borderRadius: 99 }}>Cancelled</span>
                ) : item.isCompleted ? (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', background: '#DCFCE7', padding: '4px 10px', borderRadius: 99 }}>Completed</span>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => cancelAppointment(item._id)} style={{
                      background: '#FEE2E2', border: 'none', borderRadius: 8,
                      padding: '6px 12px', color: '#EF4444', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FECACA'}
                      onMouseLeave={e => e.currentTarget.style.background = '#FEE2E2'}
                    >Cancel</button>
                    <button onClick={() => completeAppointment(item._id)} style={{
                      background: '#DCFCE7', border: 'none', borderRadius: 8,
                      padding: '6px 12px', color: '#16A34A', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#BBF7D0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#DCFCE7'}
                    >Complete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard