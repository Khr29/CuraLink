
import React, { useContext, useMemo } from 'react'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import AdminSidebar from './AdminSidebar'
import DoctorSidebar from './DoctorSidebar'

const SideBar = () => {
  const { aToken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  // decide which sidebar to render
  const SidebarComponent = useMemo(() => {
    if (aToken) return <AdminSidebar />
    if (dToken) return <DoctorSidebar />
    return null
  }, [aToken, dToken])

  return SidebarComponent
}

export default React.memo(SideBar)
