

// import React, { useState, useContext, useCallback } from 'react'
// import { assets } from '../../assets/assets'
// import { AdminContext } from '../../context/AdminContext'
// import { toast } from 'react-toastify'
// import axios from 'axios'

// const AddDoctor = () => {

//   const [docImg, setDocImg] = useState(null)
//   const [name, setName] = useState('')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [experience, setExperience] = useState('1 Year')
//   const [fees, setFees] = useState('')
//   const [about, setAbout] = useState('')
//   const [speciality, setSpeciality] = useState('General physician')
//   const [degree, setDegree] = useState('')
//   const [address1, setAddress1] = useState('')
//   const [address2, setAddress2] = useState('')

//   const { backendUrl, aToken } = useContext(AdminContext)

//   // 🔥 optimized submit
//   const onSubmitHandler = useCallback(async (event) => {
//     event.preventDefault()

//     if (!docImg) {
//       return toast.error('Image not selected')
//     }

//     try {
//       const formData = new FormData()

//       formData.append('image', docImg)
//       formData.append('name', name.trim())
//       formData.append('email', email.trim())
//       formData.append('password', password)
//       formData.append('experience', experience)
//       formData.append('fees', fees)
//       formData.append('about', about.trim())
//       formData.append('speciality', speciality)
//       formData.append('degree', degree.trim())
//       formData.append('address', JSON.stringify({
//         line1: address1.trim(),
//         line2: address2.trim()
//       }))

//       const { data } = await axios.post(
//         `${backendUrl}/api/admin/add-doctor`,
//         formData,
//         { headers: { aToken } }
//       )

//       if (data.success) {
//         toast.success(data.message)

//         // 🔥 reset form clean way
//         setDocImg(null)
//         setName('')
//         setEmail('')
//         setPassword('')
//         setExperience('1 Year')
//         setFees('')
//         setAbout('')
//         setSpeciality('General physician')
//         setDegree('')
//         setAddress1('')
//         setAddress2('')
//       } else {
//         toast.error(data.message)
//       }

//     } catch (error) {
//       console.error(error)
//       toast.error(error.message)
//     }

//   }, [docImg, name, email, password, experience, fees, about, speciality, degree, address1, address2, backendUrl, aToken])

//   return (
//     <div className='w-full px-2 sm:px-4 md:px-6 py-4'>

//       <form onSubmit={onSubmitHandler} className='max-w-5xl mx-auto'>

//         <h2 className='text-xl sm:text-2xl font-semibold mb-4'>Add Doctor</h2>

//         <div className='bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-md border overflow-y-auto'>

//           {/* Image Upload */}
//           <div className='flex items-center gap-4 mb-6'>
//             <label htmlFor='doc-img' className='cursor-pointer'>
//               <img
//                 className='w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border'
//                 src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
//                 alt=''
//               />
//             </label>
//             <input
//               type='file'
//               id='doc-img'
//               hidden
//               onChange={(e) => setDocImg(e.target.files[0])}
//             />
//             <p className='text-sm text-gray-500'>
//               Upload doctor <br /> picture
//             </p>
//           </div>

//           {/* Form Grid */}
//           <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

//             {/* LEFT */}
//             <div className='flex flex-col gap-4'>

//               <Input label="Doctor Name" value={name} onChange={setName} />
//               <Input label="Email" type="email" value={email} onChange={setEmail} />
//               <Input label="Password" type="password" value={password} onChange={setPassword} />

//               <div>
//                 <p className='text-sm'>Experience</p>
//                 <select value={experience} onChange={(e) => setExperience(e.target.value)} className='input'>
//                   {[...Array(10)].map((_, i) => (
//                     <option key={i} value={`${i + 1} Year`}>{i + 1} Year</option>
//                   ))}
//                 </select>
//               </div>

//               <Input label="Fees" type="number" value={fees} onChange={setFees} />

//               <div>
//                 <p className='text-sm'>About Doctor</p>
//                 <textarea
//                   value={about}
//                   onChange={(e) => setAbout(e.target.value)}
//                   rows={4}
//                   className='input'
//                   placeholder='Write about doctor'
//                 />
//               </div>
//             </div>

//             {/* RIGHT */}
//             <div className='flex flex-col gap-4'>

//               <div>
//                 <p className='text-sm'>Speciality</p>
//                 <select value={speciality} onChange={(e) => setSpeciality(e.target.value)} className='input'>
//                   <option>General physician</option>
//                   <option>Gynecologist</option>
//                   <option>Dermatologist</option>
//                   <option>Pediatricians</option>
//                   <option>Neurologist</option>
//                   <option>Gastroenterologist</option>
//                 </select>
//               </div>

//               <Input label="Education" value={degree} onChange={setDegree} />

//               <Input label="Address Line 1" value={address1} onChange={setAddress1} />
//               <Input label="Address Line 2" value={address2} onChange={setAddress2} />

//               {/* Button */}
//               <button
//                 type='submit'
//                 className='mt-2 bg-primary text-white py-2.5 rounded-lg hover:bg-primary/90 transition'
//               >
//                 Add Doctor
//               </button>

//             </div>

//           </div>

//         </div>

//       </form>
//     </div>
//   )
// }

// // 🔥 Reusable Input Component (clean + fast)
// const Input = ({ label, value, onChange, type = "text" }) => (
//   <div>
//     <p className='text-sm'>{label}</p>
//     <input
//       type={type}
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       className='input'
//       required
//     />
//   </div>
// )

// export default React.memo(AddDoctor)
import React, { useState, useContext, useCallback } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')

  const { backendUrl, aToken } = useContext(AdminContext)

  const onSubmitHandler = useCallback(async (event) => {
    event.preventDefault()
    if (!docImg) return toast.error('Image not selected')
    try {
      const formData = new FormData()
      formData.append('image', docImg)
      formData.append('name', name.trim())
      formData.append('email', email.trim())
      formData.append('password', password)
      formData.append('experience', experience)
      formData.append('fees', fees)
      formData.append('about', about.trim())
      formData.append('speciality', speciality)
      formData.append('degree', degree.trim())
      formData.append('address', JSON.stringify({ line1: address1.trim(), line2: address2.trim() }))

      const { data } = await axios.post(`${backendUrl}/api/admin/add-doctor`, formData, { headers: { aToken } })

      if (data.success) {
        toast.success(data.message)
        setDocImg(null); setName(''); setEmail(''); setPassword('')
        setExperience('1 Year'); setFees(''); setAbout('')
        setSpeciality('General physician'); setDegree('')
        setAddress1(''); setAddress2('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }, [docImg, name, email, password, experience, fees, about, speciality, degree, address1, address2, backendUrl, aToken])

  const inputStyle = {
    width: '100%', background: '#F8FAFC', border: '1.5px solid #E2E8F0',
    borderRadius: 10, padding: '10px 14px', fontSize: 13.5,
    color: '#0F172A', outline: 'none', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box'
  }

  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block', letterSpacing: '0.02em' }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '28px 24px' }}>
      <form onSubmit={onSubmitHandler} style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Page Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Add New Doctor</h1>
          <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Fill in the details to register a new doctor on the platform</p>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #F1F5F9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '32px' }}>

          {/* Image Upload */}
          <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20 }}>
            <label htmlFor='doc-img' style={{ cursor: 'pointer', position: 'relative' }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%', overflow: 'hidden',
                border: '3px solid #E2E8F0', background: '#F0FDFA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.2s'
              }}>
                <img
                  src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
                  alt='Doctor'
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{
                position: 'absolute', bottom: 2, right: 2, width: 24, height: 24,
                background: 'linear-gradient(135deg, #14B8A6, #6366F1)',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff'
              }}>
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </label>
            <input type='file' id='doc-img' hidden onChange={(e) => setDocImg(e.target.files[0])} />
            <div>
              <p style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, margin: 0 }}>Doctor Photo</p>
              <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>Upload a clear profile picture. JPG or PNG.</p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #F1F5F9', marginBottom: 28 }} />

          {/* Form Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 32px' }}>

            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <FormField label="Doctor Name" value={name} onChange={setName} inputStyle={inputStyle} labelStyle={labelStyle} placeholder="Dr. Full Name" />
              <FormField label="Email Address" type="email" value={email} onChange={setEmail} inputStyle={inputStyle} labelStyle={labelStyle} placeholder="doctor@email.com" />
              <FormField label="Password" type="password" value={password} onChange={setPassword} inputStyle={inputStyle} labelStyle={labelStyle} placeholder="••••••••" />

              <div>
                <label style={labelStyle}>Experience</label>
                <select value={experience} onChange={(e) => setExperience(e.target.value)} style={inputStyle}>
                  {[...Array(10)].map((_, i) => (
                    <option key={i} value={`${i + 1} Year`}>{i + 1} Year</option>
                  ))}
                </select>
              </div>

              <FormField label="Consultation Fees (₹)" type="number" value={fees} onChange={setFees} inputStyle={inputStyle} labelStyle={labelStyle} placeholder="500" />

              <div>
                <label style={labelStyle}>About Doctor</label>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  placeholder="Brief description about the doctor's expertise..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              <div>
                <label style={labelStyle}>Speciality</label>
                <select value={speciality} onChange={(e) => setSpeciality(e.target.value)} style={inputStyle}>
                  <option>General physician</option>
                  <option>Gynecologist</option>
                  <option>Dermatologist</option>
                  <option>Pediatricians</option>
                  <option>Neurologist</option>
                  <option>Gastroenterologist</option>
                </select>
              </div>

              <FormField label="Education / Degree" value={degree} onChange={setDegree} inputStyle={inputStyle} labelStyle={labelStyle} placeholder="MBBS, MD..." />
              <FormField label="Address Line 1" value={address1} onChange={setAddress1} inputStyle={inputStyle} labelStyle={labelStyle} placeholder="Street / Clinic Name" />
              <FormField label="Address Line 2" value={address2} onChange={setAddress2} inputStyle={inputStyle} labelStyle={labelStyle} placeholder="City, State" />

              {/* Submit */}
              <button type='submit' style={{
                marginTop: 'auto', padding: '13px 24px',
                background: 'linear-gradient(135deg, #14B8A6, #6366F1)',
                color: '#FFFFFF', border: 'none', borderRadius: 12,
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
                transition: 'opacity 0.2s, transform 0.2s',
                fontFamily: 'Inter, sans-serif'
              }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                + Add Doctor
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

const FormField = ({ label, value, onChange, type = 'text', inputStyle, labelStyle, placeholder }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <input
      type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={inputStyle} required
      onFocus={e => { e.target.style.borderColor = '#14B8A6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,0.12)'; e.target.style.background = '#FFFFFF' }}
      onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#F8FAFC' }}
    />
  </div>
)

export default React.memo(AddDoctor)