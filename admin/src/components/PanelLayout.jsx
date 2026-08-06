import React from 'react'
import Navbar from './Navbar'
import SideBar from './SideBar'

/**
 * Shared shell for every Admin/Doctor/Hospital panel route.
 * The outer shell is pinned to the viewport height with overflow hidden,
 * so only the <main> content area scrolls - Navbar and SideBar never
 * scroll out of view regardless of how tall a page's content is.
 */
const PanelLayout = ({ children }) => (
  <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-[#f8f9fd] to-[#eef1ff]">
    <Navbar />
    <div className="flex flex-1 min-h-0">
      <SideBar />
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  </div>
)

export default PanelLayout
