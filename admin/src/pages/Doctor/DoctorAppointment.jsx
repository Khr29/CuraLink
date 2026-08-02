

// import React, { useContext, useEffect } from 'react'
// import { DoctorContext } from '../../context/DoctorContext'
// import { AppContext } from '../../context/AppContext'
// import { assets } from '../../assets/assets'

// const DoctorAppointment = () => {

//   const {
//     dToken,
//     appointments,
//     getAllAppointments,
//     completeAppointment,
//     cancelAppointment
//   } = useContext(DoctorContext)

//   const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

//   useEffect(() => {
//     if (dToken) {
//       getAllAppointments()
//     }
//   }, [dToken])

//   return (
//     <div className='w-full px-3 sm:px-6 py-4'>

//       <div className='max-w-6xl mx-auto'>

//         {/* Title */}
//         <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-4'>
//           Appointments
//         </h2>

//         {/* Container */}
//         <div className='bg-white rounded-2xl shadow-sm border overflow-hidden'>

//           {/* Desktop Header */}
//           <div className='hidden md:grid grid-cols-[0.5fr_2fr_1fr_1fr_2fr_1fr_1fr] px-6 py-3 bg-gray-50 border-b text-sm font-medium text-gray-700'>
//             <p>#</p>
//             <p>Patient</p>
//             <p>Payment</p>
//             <p>Age</p>
//             <p>Date & Time</p>
//             <p>Fees</p>
//             <p>Action</p>
//           </div>

//           {/* List */}
//           <div className='max-h-[75vh] overflow-y-auto'>

//             {
//               appointments && appointments.length > 0 ? (
//                 [...appointments].reverse().map((item, index) => (

//                   <div
//                     key={item._id}
//                     className='border-b px-4 py-4 md:px-6 md:py-3 hover:bg-gray-50 transition'
//                   >

//                     {/* MOBILE VIEW */}
//                     <div className='flex flex-col gap-3 md:hidden'>

//                       {/* Top */}
//                       <div className='flex items-center justify-between'>
//                         <div className='flex items-center gap-2'>
//                           <img
//                             className='w-10 h-10 rounded-full object-cover'
//                             src={item.userData.image}
//                             alt=''
//                           />
//                           <div>
//                             <p className='font-medium text-gray-800'>
//                               {item.userData.name}
//                             </p>
//                             <p className='text-xs text-gray-500'>
//                               Age: {calculateAge(item.userData.dob)}
//                             </p>
//                           </div>
//                         </div>

//                         {/* Payment */}
//                         <span className={`text-xs px-2 py-1 rounded-full border
//                           ${item.payment
//                             ? 'bg-green-50 text-green-600 border-green-500'
//                             : 'bg-yellow-50 text-yellow-600 border-yellow-500'
//                           }`}>
//                           {item.payment ? 'Online' : 'Cash'}
//                         </span>
//                       </div>

//                       {/* Middle */}
//                       <div className='flex justify-between text-sm text-gray-600'>
//                         <p>
//                           {slotDateFormat(item.slotDate)}
//                         </p>
//                         <p className='font-medium'>
//                           {currency} {item.amount}
//                         </p>
//                       </div>

//                       {/* Actions */}
//                       <div className='flex justify-between items-center'>

//                         {
//                           item.cancelled ? (
//                             <p className='text-red-500 text-xs font-semibold'>
//                               Cancelled
//                             </p>

//                           ) : item.isCompleted ? (
//                             <p className='text-green-500 text-xs font-semibold'>
//                               Completed
//                             </p>

//                           ) : (
//                             <div className='flex gap-3'>
//                               <img
//                                 onClick={() => cancelAppointment(item._id)}
//                                 className='w-9 cursor-pointer active:scale-90'
//                                 src={assets.cancel_icon}
//                                 alt=''
//                               />

//                               <img
//                                 onClick={() => completeAppointment(item._id)}
//                                 className='w-9 cursor-pointer active:scale-90'
//                                 src={assets.tick_icon}
//                                 alt=''
//                               />
//                             </div>
//                           )
//                         }

//                       </div>

//                     </div>

//                     {/* DESKTOP VIEW */}
//                     <div className='hidden md:grid grid-cols-[0.5fr_2fr_1fr_1fr_2fr_1fr_1fr] items-center text-gray-600'>

//                       <p>{index + 1}</p>

//                       <div className='flex items-center gap-2'>
//                         <img
//                           className='w-9 h-9 rounded-full object-cover'
//                           src={item.userData.image}
//                           alt=''
//                         />
//                         <p className='font-medium text-gray-800'>
//                           {item.userData.name}
//                         </p>
//                       </div>

//                       <span className={`text-xs px-2 py-1 rounded-full border w-fit
//                         ${item.payment
//                           ? 'bg-green-50 text-green-600 border-green-500'
//                           : 'bg-yellow-50 text-yellow-600 border-yellow-500'
//                         }`}>
//                         {item.payment ? 'Online' : 'Cash'}
//                       </span>

//                       <p>{calculateAge(item.userData.dob)}</p>

//                       <p className='text-sm'>
//                         {slotDateFormat(item.slotDate)}, {item.slotTime}
//                       </p>

//                       <p className='font-semibold'>
//                         {currency} {item.amount}
//                       </p>

//                       <div>
//                         {
//                           item.cancelled ? (
//                             <p className='text-red-500 text-xs font-semibold'>
//                               Cancelled
//                             </p>

//                           ) : item.isCompleted ? (
//                             <p className='text-green-500 text-xs font-semibold'>
//                               Completed
//                             </p>

//                           ) : (
//                             <div className='flex gap-2'>
//                               <img
//                                 onClick={() => cancelAppointment(item._id)}
//                                 className='w-8 cursor-pointer hover:scale-110 transition'
//                                 src={assets.cancel_icon}
//                                 alt=''
//                               />

//                               <img
//                                 onClick={() => completeAppointment(item._id)}
//                                 className='w-8 cursor-pointer hover:scale-110 transition'
//                                 src={assets.tick_icon}
//                                 alt=''
//                               />
//                             </div>
//                           )
//                         }
//                       </div>

//                     </div>

//                   </div>
//                 ))
//               ) : (
//                 <p className='text-center text-gray-400 py-10'>
//                   No Appointments Found
//                 </p>
//               )
//             }

//           </div>

//         </div>
//       </div>
//     </div>
//   )
// }

// export default DoctorAppointment

import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'

const DoctorAppointment = () => {
  const { dToken, appointments, getAllAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (dToken) getAllAppointments()
  }, [dToken])

  const cols = '40px 1fr 90px 50px 1fr 80px 120px'

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '28px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Appointments</h1>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Manage your patient appointments</p>
          </div>
          <span style={{ background: '#F0FDFA', color: '#0D9488', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 99 }}>
            {appointments?.length || 0} Total
          </span>
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {/* Head — desktop only */}
          <div style={{
            display: 'grid', gridTemplateColumns: cols, gap: 12,
            padding: '12px 24px', background: '#FAFAFA',
            borderBottom: '1px solid #F1F5F9',
            fontSize: 11, fontWeight: 700, color: '#94A3B8',
            textTransform: 'uppercase', letterSpacing: '0.06em'
          }} className="hidden-mobile">
            <span>#</span>
            <span>Patient</span>
            <span>Payment</span>
            <span>Age</span>
            <span>Date & Time</span>
            <span>Fees</span>
            <span>Action</span>
          </div>

          <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {appointments && appointments.length > 0 ? (
              [...appointments].reverse().map((item, index) => (
                <div key={item._id} style={{
                  borderBottom: '1px solid #F8FAFC',
                  transition: 'background 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Desktop Row */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: cols,
                    alignItems: 'center', gap: 12,
                    padding: '14px 24px', fontSize: 13
                  }}>
                    <span style={{ color: '#94A3B8', fontWeight: 500 }}>{index + 1}</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={item.userData.image} alt='' style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }} />
                      <div>
                        <p style={{ fontWeight: 600, color: '#0F172A', margin: 0, fontSize: 13 }}>{item.userData.name}</p>
                      </div>
                    </div>

                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99,
                      background: item.payment ? '#F0FDF4' : '#FFFBEB',
                      color: item.payment ? '#16A34A' : '#D97706',
                      border: `1px solid ${item.payment ? '#BBF7D0' : '#FDE68A'}`,
                      width: 'fit-content'
                    }}>
                      {item.payment ? '💳 Online' : '💵 Cash'}
                    </span>

                    <span style={{ color: '#475569' }}>{calculateAge(item.userData.dob)}</span>

                    <div>
                      <p style={{ color: '#0F172A', fontWeight: 500, fontSize: 13, margin: 0 }}>{slotDateFormat(item.slotDate)}</p>
                      <p style={{ color: '#94A3B8', fontSize: 11, marginTop: 1 }}>{item.slotTime}</p>
                    </div>

                    <span style={{ fontWeight: 700, color: '#14B8A6', fontSize: 14 }}>{currency}{item.amount}</span>

                    <div>
                      {item.cancelled ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', background: '#FEE2E2', padding: '4px 10px', borderRadius: 99 }}>Cancelled</span>
                      ) : item.isCompleted ? (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', background: '#DCFCE7', padding: '4px 10px', borderRadius: 99 }}>Completed</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => cancelAppointment(item._id)} style={{
                            background: '#FEE2E2', border: 'none', borderRadius: 7,
                            padding: '5px 10px', color: '#EF4444', fontSize: 11,
                            fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = '#FECACA'}
                            onMouseLeave={e => e.currentTarget.style.background = '#FEE2E2'}
                          >✕ Cancel</button>
                          <button onClick={() => completeAppointment(item._id)} style={{
                            background: '#DCFCE7', border: 'none', borderRadius: 7,
                            padding: '5px 10px', color: '#16A34A', fontSize: 11,
                            fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = '#BBF7D0'}
                            onMouseLeave={e => e.currentTarget.style.background = '#DCFCE7'}
                          >✓ Done</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
                <p style={{ fontSize: 15 }}>No appointments found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorAppointment