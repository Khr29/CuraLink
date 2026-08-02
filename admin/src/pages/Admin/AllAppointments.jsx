

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
import React, { useContext, useEffect, useCallback, useMemo } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../../../admin/src/assets/assets'

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)

  useEffect(() => {
    if (aToken) getAllAppointments()
  }, [aToken, getAllAppointments])

  const handleCancel = useCallback((id) => {
    cancelAppointment(id)
  }, [cancelAppointment])

  const renderedAppointments = useMemo(() => {
    return appointments?.map((item, index) => {
      const patient = item.userData || {}
      const doctor = item.docData || {}
      return (
        <div key={item._id || index} style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 60px 1fr 1fr 80px 100px',
          alignItems: 'center',
          gap: 12,
          padding: '14px 24px',
          borderBottom: '1px solid #F8FAFC',
          transition: 'background 0.15s',
          fontSize: 13
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {/* Index */}
          <span style={{ color: '#94A3B8', fontWeight: 500, fontSize: 12 }}>{index + 1}</span>

          {/* Patient */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={patient.image} alt='' style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0' }} />
            <div>
              <p style={{ fontWeight: 600, color: '#0F172A', margin: 0, fontSize: 13 }}>{patient.name}</p>
              <p style={{ color: '#94A3B8', fontSize: 11, marginTop: 1 }}>Patient</p>
            </div>
          </div>

          {/* Age */}
          <span style={{ color: '#475569', fontSize: 13 }}>{calculateAge(patient)}</span>

          {/* Date */}
          <div>
            <p style={{ color: '#0F172A', fontWeight: 500, fontSize: 13, margin: 0 }}>{slotDateFormat(item.slotDate)}</p>
            <p style={{ color: '#94A3B8', fontSize: 11, marginTop: 1 }}>{item.slotTime}</p>
          </div>

          {/* Doctor */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={doctor.image} alt='' style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0', background: '#F1F5F9' }} />
            <div>
              <p style={{ fontWeight: 600, color: '#0F172A', margin: 0, fontSize: 13 }}>{doctor.name}</p>
              <p style={{ color: '#94A3B8', fontSize: 11, marginTop: 1 }}>{doctor.speciality}</p>
            </div>
          </div>

          {/* Fees */}
          <span style={{ fontWeight: 700, color: '#14B8A6', fontSize: 14 }}>{currency}{item.amount}</span>

          {/* Status */}
          <div>
            {item.cancelled ? (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', background: '#FEE2E2', padding: '4px 10px', borderRadius: 99 }}>Cancelled</span>
            ) : item.isCompleted ? (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', background: '#DCFCE7', padding: '4px 10px', borderRadius: 99 }}>Completed</span>
            ) : (
              <button
                onClick={() => handleCancel(item._id)}
                style={{
                  background: '#FEE2E2', border: 'none', borderRadius: 8,
                  padding: '5px 12px', color: '#EF4444', fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
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
  }, [appointments, calculateAge, slotDateFormat, currency, handleCancel])

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '28px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>All Appointments</h1>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Manage and monitor all patient appointments</p>
          </div>
          <span style={{ background: '#EEF2FF', color: '#6366F1', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 99 }}>
            {appointments?.length || 0} Total
          </span>
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {/* Table Head */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 60px 1fr 1fr 80px 100px',
            gap: 12, padding: '12px 24px',
            background: '#FAFAFA', borderBottom: '1px solid #F1F5F9',
            fontSize: 11, fontWeight: 700, color: '#94A3B8',
            textTransform: 'uppercase', letterSpacing: '0.06em'
          }}>
            <span>#</span>
            <span>Patient</span>
            <span>Age</span>
            <span>Date & Time</span>
            <span>Doctor</span>
            <span>Fees</span>
            <span>Status</span>
          </div>

          {/* Rows */}
          <div style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {appointments?.length > 0 ? renderedAppointments : (
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

export default React.memo(AllAppointments)