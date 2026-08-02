

// import React, { useContext, useEffect, useCallback, useMemo } from 'react'
// import { AdminContext } from '../../context/AdminContext'

// const DoctorsList = () => {

//   const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)

//   // 🔥 fetch doctors
//   useEffect(() => {
//     if (aToken) {
//       getAllDoctors()
//     }
//   }, [aToken, getAllDoctors])

//   // 🔥 stable handler
//   const handleAvailability = useCallback((id) => {
//     changeAvailability(id)
//   }, [changeAvailability])

//   // 🔥 memo render list
//   const renderedDoctors = useMemo(() => {
//     return doctors?.map((item) => (
//       <div
//         key={item._id}
//         className='bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col'
//       >

//         {/* Image */}
//         <div className='overflow-hidden'>
//           <img
//             className='w-full h-52 sm:h-56 object-cover group-hover:scale-105 transition duration-500'
//             src={item.image}
//             alt={item.name}
//           />
//         </div>

//         {/* Content */}
//         <div className='p-4 flex flex-col justify-between flex-1'>

//           <div>
//             <p className='text-gray-800 text-lg font-semibold'>
//               {item.name}
//             </p>
//             <p className='text-gray-500 text-sm mt-1'>
//               {item.speciality}
//             </p>
//           </div>

//           {/* Availability */}
//           <div className='mt-4 flex items-center justify-between'>
//             <span className={`text-xs font-medium px-2 py-1 rounded-full 
//         ${item.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
//               {item.available ? 'Available' : 'Not Available'}
//             </span>

//             <input
//               type='checkbox'
//               checked={item.available}
//               onChange={() => handleAvailability(item._id)}
//               className='cursor-pointer'
//             />
//           </div>

//         </div>
//       </div>
//     ))
//   }, [doctors, handleAvailability])

//   return (
//     <div className='w-full px-3 sm:px-5 md:px-8 py-4'>

//       <div className='max-w-7xl mx-auto'>

//         <h1 className='text-lg sm:text-xl font-semibold mb-4'>
//           All Doctors
//         </h1>

//         {/* Grid */}
//         <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>

//           {doctors?.length > 0 ? (
//             renderedDoctors
//           ) : (
//             <p className='text-gray-400 text-center col-span-full'>
//               No Doctors Found
//             </p>
//           )}

//         </div>

//       </div>
//     </div>
//   )
// }

// export default React.memo(DoctorsList)
import React, { useContext, useEffect, useCallback, useMemo } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) getAllDoctors()
  }, [aToken, getAllDoctors])

  const handleAvailability = useCallback((id) => {
    changeAvailability(id)
  }, [changeAvailability])

  const renderedDoctors = useMemo(() => {
    return doctors?.map((item) => (
      <div key={item._id} style={{
        background: '#FFFFFF', borderRadius: 16,
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        overflow: 'hidden', transition: 'box-shadow 0.25s, transform 0.25s',
        display: 'flex', flexDirection: 'column'
      }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(20,184,166,0.14)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        {/* Image */}
        <div style={{ overflow: 'hidden', height: 200, background: '#F0FDFA' }}>
          <img src={item.image} alt={item.name} style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>

        {/* Content */}
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <p style={{ fontWeight: 700, color: '#0F172A', fontSize: 15, margin: 0 }}>{item.name}</p>
            <span style={{
              display: 'inline-block', marginTop: 6,
              fontSize: 11, fontWeight: 600, color: '#6366F1',
              background: '#EEF2FF', padding: '3px 10px', borderRadius: 99
            }}>
              {item.speciality}
            </span>
          </div>

          {/* Availability Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', borderRadius: 10,
            background: item.available ? '#F0FDF4' : '#FFF1F2',
            border: `1px solid ${item.available ? '#BBF7D0' : '#FECDD3'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: item.available ? '#22C55E' : '#EF4444'
              }} />
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: item.available ? '#16A34A' : '#DC2626'
              }}>
                {item.available ? 'Available' : 'Not Available'}
              </span>
            </div>

            {/* Toggle Switch */}
            <div
              onClick={() => handleAvailability(item._id)}
              style={{
                width: 40, height: 22, borderRadius: 99, cursor: 'pointer',
                background: item.available ? '#22C55E' : '#CBD5E1',
                position: 'relative', transition: 'background 0.25s'
              }}
            >
              <div style={{
                position: 'absolute', top: 3,
                left: item.available ? 20 : 3,
                width: 16, height: 16, borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'left 0.25s'
              }} />
            </div>
          </div>
        </div>
      </div>
    ))
  }, [doctors, handleAvailability])

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '28px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>All Doctors</h1>
            <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Manage doctor profiles and availability</p>
          </div>
          <span style={{ background: '#F0FDF4', color: '#16A34A', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 99 }}>
            {doctors?.length || 0} Doctors
          </span>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {doctors?.length > 0 ? renderedDoctors : (
            <p style={{ color: '#94A3B8', gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
              No doctors found
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(DoctorsList)