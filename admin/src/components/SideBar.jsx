
import React, { useContext, useMemo } from 'react'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import { HospitalContext } from '../context/HospitalContext'
import AdminSidebar from './AdminSidebar'
import DoctorSidebar from './DoctorSidebar'
import HospitalSidebar from './HospitalSidebar'

const SideBar = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)
  const { hToken } = useContext(HospitalContext)

  // decide which sidebar to render
  const SidebarComponent = useMemo(() => {
    if (aToken) return <AdminSidebar />
    if (dToken) return <DoctorSidebar />
    if (hToken) return <HospitalSidebar />
    return null
  }, [aToken, dToken, hToken])

  return SidebarComponent
}

export default React.memo(SideBar)
