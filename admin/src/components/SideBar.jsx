
import React, { useContext, useMemo } from 'react'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { HospitalContext } from '../context/HospitalContext'
import { PharmacyContext } from '../context/PharmacyContext'
import AdminSidebar from './AdminSidebar'
import DoctorSidebar from './DoctorSidebar'
import HospitalSidebar from './HospitalSidebar'
import PharmacySidebar from './PharmacySidebar'

const SideBar = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  const { hToken } = useContext(HospitalContext)
  const { pToken } = useContext(PharmacyContext)

  // decide which sidebar to render
  const SidebarComponent = useMemo(() => {
    if (aToken) return <AdminSidebar />
    if (dToken) return <DoctorSidebar />
    if (hToken) return <HospitalSidebar />
    if (pToken) return <PharmacySidebar />
    return null
  }, [aToken, dToken, hToken, pToken])

  return SidebarComponent
}

export default React.memo(SideBar)
