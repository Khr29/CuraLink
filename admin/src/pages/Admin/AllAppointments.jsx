

// import React, { useContext, useEffect, useCallback, useMemo } from 'react'
// import { AdminContext } from '../../context/AdminContext'
// import { AppContext } from '../../context/AppContext'
// import { assets } from '../../../../admin/src/assets/assets'

// const AllAppointments = () => {

//   const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)
//   const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

//   // 🔥 fetch only when needed
//   useEffect(() => {
//     if (aToken) {
//       getAllAppointments()
//     }
//   }, [aToken, getAllAppointments])

//   // 🔥 memoized cancel handler
//   const handleCancel = useCallback((id) => {
//     cancelAppointment(id)
//   }, [cancelAppointment])

//   // 🔥 safe list rendering
//   const renderedAppointments = useMemo(() => {
//     return appointments?.map((item, index) => {

//       const patient = item.userData || {}
//       const doctor = item.docData || {}

//       return (
//         <div
//           key={item._id || index}
//           className='flex flex-col sm:grid grid-cols-[0.5fr_2.5fr_1fr_2.5fr_2.5fr_1fr_1fr] gap-2 sm:gap-0 items-start sm:items-center text-gray-600 px-4 sm:px-6 py-3 border-b hover:bg-gray-50 transition'
//         >

//           {/* Index */}
//           <p className='hidden sm:block'>{index + 1}</p>

//           {/* Patient */}
//           <div className='flex items-center gap-2'>
//             <img
//               className='w-8 h-8 rounded-full object-cover'
//               src={patient.image}
//               alt=''
//             />
//             <p className='text-sm font-medium'>{patient.name}</p>
//           </div>

//           {/* Age */}
//           <p className='hidden sm:block'>{calculateAge(patient)}</p>

//           {/* Date */}
//           <p className='text-xs sm:text-sm'>
//             {slotDateFormat(item.slotDate)}, {item.slotTime}
//           </p>

//           {/* Doctor */}
//           <div className='flex items-center gap-2'>
//             <img
//               className='w-8 h-8 rounded-full bg-gray-200 object-cover'
//               src={doctor.image}
//               alt=''
//             />
//             <p className='text-sm'>{doctor.name}</p>
//           </div>

//           {/* Fees */}
//           <p className='text-sm font-medium'>
//             {currency} {item.amount}
//           </p>

//           {/* Status / Action */}
//           <div>
//             {item.cancelled ? (
//               <p className='text-red-500 text-xs font-semibold'>Cancelled</p>
//             ) : item.isCompleted ? (
//               <p className='text-green-500 text-xs font-semibold'>Completed</p>
//             ) : (
//               <img
//                 onClick={() => handleCancel(item._id)}
//                 className='w-8 sm:w-9 cursor-pointer hover:scale-110 transition'
//                 src={assets.cancel_icon}
//                 alt='cancel'
//               />
//             )}
//           </div>

//         </div>
//       )
//     })
//   }, [appointments, calculateAge, slotDateFormat, currency, handleCancel])

//   return (
//     <div className='w-full px-2 sm:px-4 md:px-6 py-4'>

//       <div className='max-w-6xl mx-auto'>
//         <h2 className='text-lg sm:text-xl font-semibold mb-4'>
//           All Appointments
//         </h2>

//         <div className='bg-white border rounded-xl shadow-sm overflow-hidden'>

//           {/* Header */}
//           <div className='hidden sm:grid grid-cols-[0.5fr_2.5fr_1fr_2.5fr_2.5fr_1fr_1fr] py-3 px-6 border-b text-gray-700 font-medium text-sm bg-gray-50'>
//             <p>#</p>
//             <p>Patient</p>
//             <p>Age</p>
//             <p>Date & Time</p>
//             <p>Doctor</p>
//             <p>Fees</p>
//             <p>Actions</p>
//           </div>

//           {/* List */}
//           <div className='max-h-[75vh] overflow-y-auto'>
//             {appointments?.length > 0 ? (
//               renderedAppointments
//             ) : (
//               <p className='text-center text-gray-400 py-10'>
//                 No Appointments Found
//               </p>
//             )}
//           </div>

//         </div>
//       </div>
//     </div>
//   )
// }

// export default React.memo(AllAppointments)
import React, { useContext, useEffect, useCallback, useMemo, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { 
  CalendarDays, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Stethoscope, 
  Ban,
  Wallet
} from 'lucide-react'

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  // Fetch appointments
  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken, getAllAppointments])

  // Stable cancel handler
  const handleCancel = useCallback((id) => {
    cancelAppointment(id)
  }, [cancelAppointment])

  // Memoized appointment list rendering
  const renderedAppointments = useMemo(() => {
    return appointments?.map((item, index) => (
      <AppointmentRow 
        key={item._id || index}
        item={item}
        index={index}
        calculateAge={calculateAge}
        slotDateFormat={slotDateFormat}
        currency={currency}
        onCancel={handleCancel}
      />
    ))
  }, [appointments, calculateAge, slotDateFormat, currency, handleCancel])

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
              <CalendarDays size={26} color="#FFFFFF" />
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
                All Appointments
              </h1>
              <p style={{ fontSize: 14, color: '#64748B', marginTop: 3 }}>
                Manage and monitor all patient appointments across the network.
              </p>
            </div>
          </div>

          {/* APPOINTMENT COUNTER BADGE */}
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
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
              Total Appointments: <span style={{ color: '#2563EB' }}>{appointments?.length || 0}</span>
            </span>
          </div>
        </div>

        {/* DATA TABLE CONTAINER */}
        <div 
          style={{ 
            background: '#FFFFFF', 
            borderRadius: 24, 
            border: '1px solid #E2E8F0', 
            boxShadow: '0 8px 24px rgba(15,23,42,0.04)', 
            overflow: 'hidden' 
          }}
        >
          {/* TABLE HEADER */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 1.5fr 80px 1.5fr 1.5fr 100px 120px',
              gap: 16,
              padding: '16px 24px',
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              fontSize: 12,
              fontWeight: 700,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              alignItems: 'center'
            }}
          >
            <span>#</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} /> Patient</span>
            <span>Age</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> Date & Time</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Stethoscope size={14} /> Doctor</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Wallet size={14} /> Fees</span>
            <span>Status</span>
          </div>

          {/* TABLE BODY */}
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {appointments?.length > 0 ? (
              renderedAppointments
            ) : (
              /* EMPTY STATE */
              <div style={{ padding: '80px 24px', textAlign: 'center' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <CalendarDays size={32} color="#2563EB" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
                  No Appointments Found
                </h3>
                <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
                  There are currently no appointments scheduled in the system.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// CURALINK DESIGN SYSTEM ROW COMPONENT
const AppointmentRow = ({ item, index, calculateAge, slotDateFormat, currency, onCancel }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isCancelHovered, setIsCancelHovered] = useState(false)

  const patient = item.userData || {}
  const doctor = item.docData || {}

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '60px 1.5fr 80px 1.5fr 1.5fr 100px 120px',
        alignItems: 'center',
        gap: 16,
        padding: '16px 24px',
        borderBottom: '1px solid #F1F5F9',
        background: isHovered ? '#F8FAFC' : '#FFFFFF',
        transition: 'background 0.2s ease',
      }}
    >
      {/* Index */}
      <span style={{ color: '#94A3B8', fontWeight: 600, fontSize: 13 }}>
        {(index + 1).toString().padStart(2, '0')}
      </span>

      {/* Patient */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img 
          src={patient.image} 
          alt={patient.name} 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            objectFit: 'cover', 
            border: '2px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }} 
        />
        <div>
          <p style={{ fontWeight: 700, color: '#0F172A', margin: 0, fontSize: 14 }}>{patient.name}</p>
          <p style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>Patient</p>
        </div>
      </div>

      {/* Age */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ 
          background: '#F1F5F9', 
          color: '#475569', 
          fontSize: 12, 
          fontWeight: 600, 
          padding: '4px 10px', 
          borderRadius: 99 
        }}>
          {calculateAge(patient)} yrs
        </span>
      </div>

      {/* Date & Time */}
      <div>
        <p style={{ color: '#0F172A', fontWeight: 600, fontSize: 13, margin: 0 }}>
          {slotDateFormat(item.slotDate)}
        </p>
        <p style={{ color: '#2563EB', fontWeight: 500, fontSize: 12, marginTop: 2 }}>
          {item.slotTime}
        </p>
      </div>

      {/* Doctor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img 
          src={doctor.image} 
          alt={doctor.name} 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            objectFit: 'cover', 
            background: '#EFF6FF',
            border: '2px solid #E2E8F0'
          }} 
        />
        <div>
          <p style={{ fontWeight: 700, color: '#0F172A', margin: 0, fontSize: 14 }}>{doctor.name}</p>
          <p style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{doctor.speciality}</p>
        </div>
      </div>

      {/* Fees */}
      <span style={{ fontWeight: 800, color: '#14B8A6', fontSize: 15 }}>
        {currency}{item.amount}
      </span>

      {/* Status / Action */}
      <div>
        {item.cancelled ? (
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 6, 
            fontSize: 12, fontWeight: 700, color: '#EF4444', 
            background: '#FEF2F2', border: '1px solid #FEE2E2',
            padding: '6px 12px', borderRadius: 99 
          }}>
            <Ban size={14} /> Cancelled
          </div>
        ) : item.isCompleted ? (
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 6, 
            fontSize: 12, fontWeight: 700, color: '#10B981', 
            background: '#ECFDF5', border: '1px solid #D1FAE5',
            padding: '6px 12px', borderRadius: 99 
          }}>
            <CheckCircle2 size={14} /> Completed
          </div>
        ) : (
          <button
            onClick={() => onCancel(item._id)}
            onMouseEnter={() => setIsCancelHovered(true)}
            onMouseLeave={() => setIsCancelHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: isCancelHovered ? '#EF4444' : '#FFFFFF',
              border: isCancelHovered ? '1px solid #EF4444' : '1px solid #E2E8F0',
              color: isCancelHovered ? '#FFFFFF' : '#EF4444',
              borderRadius: 99,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isCancelHovered ? '0 4px 12px rgba(239, 68, 68, 0.2)' : 'none'
            }}
          >
            <XCircle size={14} /> Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default React.memo(AllAppointments)