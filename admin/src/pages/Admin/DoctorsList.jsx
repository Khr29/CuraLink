

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
import React, { useContext, useEffect, useCallback, useMemo, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { Users, Stethoscope, CheckCircle2, XCircle, Star, Trash2 } from 'lucide-react'
import PageHero from '../../components/PageHero'
import EmptyState from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'
import ConfirmDialog from '../../components/ConfirmDialog'

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, deleteDoctor } = useContext(AdminContext)
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch doctors
  useEffect(() => {
    if (aToken) {
      getAllDoctors().finally(() => setLoading(false))
    }
  }, [aToken, getAllDoctors])

  // Stable availability toggle handler
  const handleAvailability = useCallback(
    (id) => {
      changeAvailability(id)
    },
    [changeAvailability]
  )

  const handleDeleteClick = useCallback((item) => {
    setPendingDelete(item)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return
    setDeleting(true)
    await deleteDoctor(pendingDelete._id)
    setDeleting(false)
    setPendingDelete(null)
  }, [pendingDelete, deleteDoctor])

  // Memoized doctor card list rendering
  const renderedDoctors = useMemo(() => {
    return doctors?.map((item) => (
      <DoctorCard
        key={item._id}
        item={item}
        onToggleAvailability={handleAvailability}
        onDeleteClick={handleDeleteClick}
      />
    ))
  }, [doctors, handleAvailability, handleDeleteClick])

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
          title="All Doctors"
          description="View doctor profiles and manage real-time availability status."
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
                Total Doctors: {doctors?.length || 0}
              </span>
            </div>
          }
        />

        {/* DOCTORS GRID CONTAINER */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: 24
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : doctors?.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: 24
            }}
          >
            {renderedDoctors}
          </div>
        ) : (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 24,
              boxShadow: '0 8px 24px rgba(15,23,42,0.04)'
            }}
          >
            <EmptyState
              icon={Users}
              title="No Doctors Found"
              subtitle="There are currently no registered doctors available in the system."
            />
          </div>
        )}

      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this doctor?"
        message={pendingDelete ? `This will permanently remove ${pendingDelete.name} and their reviews. This cannot be undone.` : ''}
        confirmLabel="Delete Doctor"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => !deleting && setPendingDelete(null)}
      />
    </div>
  )
}

// CURALINK DESIGN SYSTEM DOCTOR CARD COMPONENT
const DoctorCard = ({ item, onToggleAvailability, onDeleteClick }) => {
  const [hovered, setHovered] = useState(false)
  const [deleteHovered, setDeleteHovered] = useState(false)

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
      {/* CARD TOP IMAGE */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 210,
          background: 'linear-gradient(135deg, #EFF6FF, #E0F2FE)',
          overflow: 'hidden'
        }}
      >
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.5s ease'
          }}
        />

        {/* DELETE ACTION BUTTON */}
        <button
          onClick={() => onDeleteClick(item)}
          onMouseEnter={() => setDeleteHovered(true)}
          onMouseLeave={() => setDeleteHovered(false)}
          title="Delete Doctor"
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: deleteHovered ? '#EF4444' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            border: deleteHovered ? '1px solid #EF4444' : '1px solid rgba(226,232,240,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            zIndex: 2
          }}
        >
          <Trash2 size={16} color={deleteHovered ? '#FFFFFF' : '#EF4444'} />
        </button>

        {/* SPECIALITY BADGE OVERLAY */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            padding: '5px 12px',
            borderRadius: 99,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid rgba(226,232,240,0.8)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <Stethoscope size={13} color="#2563EB" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>
            {item.speciality}
          </span>
        </div>
      </div>

      {/* CARD DETAILS */}
      <div
        style={{
          padding: '20px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.01em'
            }}
          >
            {item.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <Star size={13} color="#FBBF24" fill="#FBBF24" />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
              {item.totalReviews > 0 ? item.averageRating.toFixed(1) : 'New'}
            </span>
            {item.totalReviews > 0 && (
              <span style={{ fontSize: 11.5, color: '#94A3B8' }}>({item.totalReviews})</span>
            )}
          </div>
        </div>

        {/* AVAILABILITY TOGGLE CONTROL */}
        <div
          style={{
            marginTop: 18,
            padding: '12px 14px',
            borderRadius: 16,
            background: item.available ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${item.available ? '#DCFCE7' : '#FEE2E2'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.25s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {item.available ? (
              <CheckCircle2 size={16} color="#16A34A" />
            ) : (
              <XCircle size={16} color="#DC2626" />
            )}
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                color: item.available ? '#15803D' : '#B91C1C'
              }}
            >
              {item.available ? 'Available' : 'Not Available'}
            </span>
          </div>

          {/* TOGGLE SWITCH INPUT */}
          <label
            style={{
              position: 'relative',
              display: 'inline-block',
              width: 44,
              height: 24,
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={item.available}
              onChange={() => onToggleAvailability(item._id)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: item.available ? '#16A34A' : '#CBD5E1',
                borderRadius: 99,
                transition: '0.25s ease',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  height: 18,
                  width: 18,
                  left: item.available ? 23 : 3,
                  bottom: 3,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  transition: '0.25s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default React.memo(DoctorsList)