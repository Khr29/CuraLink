

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

import React, { useContext, useEffect, useState, useMemo } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { CalendarDays, Clock, Wallet, CreditCard, Banknote, CheckCircle2, XCircle, Ban } from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import { SkeletonRow } from '../../components/Skeleton'

const cols = '48px 1.6fr 100px 70px 1.4fr 90px 150px'

const DoctorAppointment = () => {
  const { dToken, appointments, getAllAppointments, completeAppointment, cancelAppointment } = useContext(DoctorContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dToken) getAllAppointments().finally(() => setLoading(false))
  }, [dToken])

  const orderedAppointments = useMemo(
    () => (appointments ? [...appointments].reverse() : []),
    [appointments]
  )

  return (
    <div className="curalink-fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%)', padding: '36px 24px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>

        <PageHero
          icon={CalendarDays}
          title="Appointments"
          description="Manage your patient appointments and consultation status."
          action={
            <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', padding: '10px 20px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14B8A6' }} />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF' }}>
                Total Appointments: {appointments?.length || 0}
              </span>
            </div>
          }
        />

        {/* DATA TABLE CONTAINER */}
        <div style={{ background: '#FFFFFF', borderRadius: 24, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(15,23,42,0.04)', overflow: 'hidden' }}>

          {/* TABLE HEADER */}
          <div style={{
            display: 'grid', gridTemplateColumns: cols, gap: 12,
            padding: '16px 24px', background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            fontSize: 12, fontWeight: 700, color: '#64748B',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            alignItems: 'center'
          }}>
            <span>#</span>
            <span>Patient</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Wallet size={14} /> Payment</span>
            <span>Age</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> Date & Time</span>
            <span>Fees</span>
            <span>Action</span>
          </div>

          {/* TABLE BODY */}
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : orderedAppointments.length > 0 ? (
              orderedAppointments.map((item, index) => (
                <AppointmentRow
                  key={item._id}
                  item={item}
                  index={index}
                  calculateAge={calculateAge}
                  slotDateFormat={slotDateFormat}
                  currency={currency}
                  onCancel={cancelAppointment}
                  onComplete={completeAppointment}
                />
              ))
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No Appointments Found"
                subtitle="Your upcoming and past patient appointments will appear here."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const AppointmentRow = ({ item, index, calculateAge, slotDateFormat, currency, onCancel, onComplete }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: cols,
        alignItems: 'center', gap: 12,
        padding: '14px 24px', fontSize: 13,
        borderBottom: '1px solid #F1F5F9',
        background: hovered ? '#F8FAFC' : '#FFFFFF',
        transition: 'background 0.2s ease'
      }}
    >
      <span style={{ color: '#94A3B8', fontWeight: 600, fontSize: 13 }}>
        {(index + 1).toString().padStart(2, '0')}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={item.userData.image} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }} />
        <p style={{ fontWeight: 700, color: '#0F172A', margin: 0, fontSize: 13 }}>{item.userData.name}</p>
      </div>

      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99,
        background: item.payment ? '#F0FDF4' : '#FFFBEB',
        color: item.payment ? '#16A34A' : '#D97706',
        border: `1px solid ${item.payment ? '#BBF7D0' : '#FDE68A'}`,
        width: 'fit-content'
      }}>
        {item.payment ? <CreditCard size={12} /> : <Banknote size={12} />}
        {item.payment ? 'Online' : 'Cash'}
      </span>

      <span style={{ color: '#475569', fontWeight: 500 }}>{calculateAge(item.userData.dob)}</span>

      <div>
        <p style={{ color: '#0F172A', fontWeight: 600, fontSize: 13, margin: 0 }}>{slotDateFormat(item.slotDate)}</p>
        <p style={{ color: '#2563EB', fontWeight: 500, fontSize: 12, marginTop: 2 }}>{item.slotTime}</p>
      </div>

      <span style={{ fontWeight: 800, color: '#14B8A6', fontSize: 14 }}>{currency}{item.amount}</span>

      <div>
        {item.cancelled ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '6px 12px', borderRadius: 99 }}>
            <Ban size={14} /> Cancelled
          </div>
        ) : item.isCompleted ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#10B981', background: '#ECFDF5', border: '1px solid #D1FAE5', padding: '6px 12px', borderRadius: 99 }}>
            <CheckCircle2 size={14} /> Completed
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => onCancel(item._id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#EF4444', borderRadius: 99, padding: '6px 10px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = '#EF4444' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.borderColor = '#E2E8F0' }}
            >
              <XCircle size={13} /> Cancel
            </button>
            <button
              onClick={() => onComplete(item._id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'linear-gradient(135deg, #2563EB, #14B8A6)', border: 'none', color: '#FFFFFF', borderRadius: 99, padding: '6px 12px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <CheckCircle2 size={13} /> Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorAppointment