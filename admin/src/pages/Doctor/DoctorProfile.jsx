


// import React, { useContext, useEffect, useState } from 'react'
// import { DoctorContext } from '../../context/DoctorContext'
// import { AppContext } from '../../context/AppContext'
// import axios from 'axios'
// import { toast } from 'react-toastify'

// const DoctorProfile = () => {

//   const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
//   const { currency } = useContext(AppContext)

//   const [isEdit, setIsEdit] = useState(false)
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     if (dToken) getProfileData()
//   }, [dToken])

//   const updateProfile = async () => {
//     try {
//       setLoading(true)

//       const updateData = {
//         address: profileData.address,
//         fees: profileData.fees,
//         available: profileData.available
//       }

//       const { data } = await axios.post(
//         backendUrl + '/api/doctor/update-profile',
//         updateData,
//         { headers: { dToken } }
//       )

//       if (data.success) {
//         toast.success(data.message)
//         setIsEdit(false)
//         getProfileData()
//       } else {
//         toast.error(data.message)
//       }

//     } catch (error) {
//       toast.error(error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!profileData) return null

//   return (
//     <div className='p-4 sm:p-6'>

//       <div className='max-w-4xl mx-auto bg-white rounded-xl shadow-sm border p-5 sm:p-8'>

//         {/* 🔥 Top Section */}
//         <div className='flex flex-col sm:flex-row gap-6'>

//           {/* Image */}
//           <img
//            className='w-full sm:w-64 h-64 object-cover rounded-xl bg-gray-100 shadow-sm'
//             src={profileData.image}
//             alt=''
//           />

//           {/* Info */}
//           <div className='flex-1'>

//             <p className='text-2xl sm:text-3xl font-semibold text-gray-700'>
//               {profileData.name}
//             </p>

//             <div className='flex flex-wrap items-center gap-2 mt-2 text-gray-600'>
//               <p>
//                 {profileData.degree} • {profileData.speciality}
//               </p>
//               <span className='text-xs border px-2 py-0.5 rounded-full'>
//                 {profileData.experience}
//               </span>
//             </div>

//             {/* About */}
//             <div className='mt-4'>
//               <p className='text-sm font-medium text-gray-800'>About</p>
//               <p className='text-sm text-gray-600 mt-1'>
//                 {profileData.about}
//               </p>
//             </div>

//             {/* Fees */}
//             <div className='mt-4'>
//               <p className='font-medium text-gray-700'>
//                 Appointment Fee:
//               </p>

//               {isEdit ? (
//                 <input
//                   type='number'
//                   value={profileData.fees}
//                   onChange={(e) =>
//                     setProfileData(prev => ({ ...prev, fees: e.target.value }))
//                   }
//                   className='mt-1 border px-3 py-1 rounded w-32 focus:ring-2 focus:ring-primary outline-none'
//                 />
//               ) : (
//                 <p className='text-gray-600'>
//                   {currency}{profileData.fees}
//                 </p>
//               )}
//             </div>

//           </div>
//         </div>

//         {/* 🔥 Address */}
//         <div className='mt-6'>
//           <p className='font-medium text-gray-700'>Address</p>

//           {isEdit ? (
//             <div className='flex flex-col sm:flex-row gap-2 mt-2'>
//               <input
//                 type='text'
//                 value={profileData?.address?.line1 || ''}
//                 onChange={(e) =>
//                   setProfileData(prev => ({
//                     ...prev,
//                     address: { ...prev.address, line1: e.target.value }
//                   }))
//                 }
//                 className='border px-3 py-2 rounded w-full focus:ring-2 focus:ring-primary outline-none'
//                 placeholder='Address line 1'
//               />

//               <input
//                 type='text'
//                 value={profileData?.address?.line2 || ''}
//                 onChange={(e) =>
//                   setProfileData(prev => ({
//                     ...prev,
//                     address: { ...prev.address, line2: e.target.value }
//                   }))
//                 }
//                 className='border px-3 py-2 rounded w-full focus:ring-2 focus:ring-primary outline-none'
//                 placeholder='Address line 2'
//               />
//             </div>
//           ) : (
//             <p className='text-gray-600 mt-1 text-sm'>
//               {profileData?.address?.line1} <br />
//               {profileData?.address?.line2}
//             </p>
//           )}
//         </div>

//         {/* 🔥 Availability */}
//         <div className='mt-5 flex items-center gap-2'>
//           <input
//             type='checkbox'
//             checked={profileData.available}
//             onChange={() =>
//               isEdit &&
//               setProfileData(prev => ({
//                 ...prev,
//                 available: !prev.available
//               }))
//             }
//           />
//           <label className='text-sm text-gray-700'>Available</label>
//         </div>

//         {/* 🔥 Buttons */}
//         <div className='mt-6'>

//           {isEdit ? (
//             <button
//               onClick={updateProfile}
//               disabled={loading}
//               className='px-5 py-2 bg-primary text-white rounded-full text-sm hover:bg-primary/90 transition disabled:opacity-50'
//             >
//               {loading ? 'Saving...' : 'Save Changes'}
//             </button>
//           ) : (
//             <button
//               onClick={() => setIsEdit(true)}
//               className='px-5 py-2 border border-primary text-primary rounded-full text-sm hover:bg-primary hover:text-white transition'
//             >
//               Edit Profile
//             </button>
//           )}

//         </div>

//       </div>
//     </div>
//   )
// }

// export default DoctorProfile
import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (dToken) getProfileData()
  }, [dToken])

  const updateProfile = async () => {
    try {
      setLoading(true)
      const updateData = { address: profileData.address, fees: profileData.fees, available: profileData.available }
      const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { dToken } })
      if (data.success) { toast.success(data.message); setIsEdit(false); getProfileData() }
      else toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!profileData) return null

  const inputStyle = {
    width: '100%', background: '#F8FAFC', border: '1.5px solid #E2E8F0',
    borderRadius: 10, padding: '10px 14px', fontSize: 13.5, color: '#0F172A',
    outline: 'none', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '28px 24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>My Profile</h1>
          <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Manage your professional information</p>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

          {/* Top Banner */}
          <div style={{ height: 80, background: 'linear-gradient(135deg, #0F172A, #134E4A)', position: 'relative' }} />

          {/* Profile Content */}
          <div style={{ padding: '0 32px 32px' }}>

            {/* Avatar + Name row */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ marginTop: -40 }}>
                <img src={profileData.image} alt='' style={{
                  width: 96, height: 96, borderRadius: '50%', objectFit: 'cover',
                  border: '4px solid #FFFFFF', boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
                }} />
              </div>

              {/* Edit / Save buttons */}
              <div style={{ display: 'flex', gap: 10, paddingBottom: 4 }}>
                {isEdit ? (
                  <>
                    <button onClick={() => setIsEdit(false)} style={{
                      padding: '8px 18px', borderRadius: 99, border: '1.5px solid #E2E8F0',
                      background: '#FFFFFF', color: '#475569', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                    }}>Cancel</button>
                    <button onClick={updateProfile} disabled={loading} style={{
                      padding: '8px 20px', borderRadius: 99, border: 'none',
                      background: 'linear-gradient(135deg, #22C55E, #14B8A6)',
                      color: '#FFFFFF', fontSize: 13, fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                      boxShadow: '0 4px 12px rgba(34,197,94,0.3)', fontFamily: 'Inter, sans-serif'
                    }}>
                      {loading ? 'Saving...' : '✓ Save Changes'}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEdit(true)} style={{
                    padding: '8px 20px', borderRadius: 99,
                    border: '1.5px solid #14B8A6', background: '#F0FDFA',
                    color: '#0D9488', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.2s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#14B8A6'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F0FDFA'; e.currentTarget.style.color = '#0D9488' }}
                  >✏️ Edit Profile</button>
                )}
              </div>
            </div>

            {/* Name + Speciality */}
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0 }}>{profileData.name}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 13, color: '#475569' }}>{profileData.degree}</span>
                <span style={{ color: '#CBD5E1' }}>•</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#6366F1', background: '#EEF2FF', padding: '3px 10px', borderRadius: 99 }}>
                  {profileData.speciality}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#0D9488', background: '#F0FDFA', padding: '3px 10px', borderRadius: 99, border: '1px solid #99F6E4' }}>
                  {profileData.experience}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', marginBottom: 24 }} />

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px' }}>

              {/* About */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>About</label>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, margin: 0 }}>{profileData.about}</p>
              </div>

              {/* Fees */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Consultation Fee</label>
                {isEdit ? (
                  <input type='number' value={profileData.fees}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
                    style={{ ...inputStyle, maxWidth: 160 }}
                    onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                  />
                ) : (
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#22C55E', margin: 0 }}>{currency}{profileData.fees}</p>
                )}
              </div>

              {/* Availability */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Availability</label>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', borderRadius: 10,
                  background: profileData.available ? '#F0FDF4' : '#FFF1F2',
                  border: `1px solid ${profileData.available ? '#BBF7D0' : '#FECDD3'}`,
                  cursor: isEdit ? 'pointer' : 'default'
                }}
                  onClick={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
                >
                  {/* Toggle */}
                  <div style={{
                    width: 38, height: 20, borderRadius: 99,
                    background: profileData.available ? '#22C55E' : '#CBD5E1',
                    position: 'relative', transition: 'background 0.25s'
                  }}>
                    <div style={{
                      position: 'absolute', top: 3,
                      left: profileData.available ? 20 : 3,
                      width: 14, height: 14, borderRadius: '50%',
                      background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'left 0.25s'
                    }} />
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 600,
                    color: profileData.available ? '#16A34A' : '#DC2626'
                  }}>
                    {profileData.available ? 'Available' : 'Not Available'}
                  </span>
                </div>
                {isEdit && <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>Click to toggle</p>}
              </div>

              {/* Address */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>Clinic Address</label>
                {isEdit ? (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <input type='text' value={profileData?.address?.line1 || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                      style={inputStyle} placeholder='Address line 1'
                      onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
                      onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                    />
                    <input type='text' value={profileData?.address?.line2 || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                      style={inputStyle} placeholder='Address line 2'
                      onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
                      onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      📍
                    </div>
                    <div>
                      <p style={{ fontSize: 14, color: '#0F172A', fontWeight: 500, margin: 0 }}>{profileData?.address?.line1}</p>
                      <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{profileData?.address?.line2}</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile