"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft } from "lucide-react"
import TopGuides from "./TopGuides"

export default function CommunitySidebar({ guides, externalIsSidebarOpen, externalToggleSidebar }) {
  const [internalIsSidebarOpen, setInternalIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const isSidebarOpen = externalIsSidebarOpen !== undefined ? externalIsSidebarOpen : internalIsSidebarOpen
  const toggleSidebar = externalToggleSidebar || (() => setInternalIsSidebarOpen(!internalIsSidebarOpen))

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkIfMobile()

    window.addEventListener("resize", checkIfMobile)

    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && isSidebarOpen) {
       
        const sidebar = document.getElementById("community-sidebar")
        const toggleButton = document.getElementById("sidebar-toggle")

        if (sidebar && !sidebar.contains(e.target) && toggleButton && !toggleButton.contains(e.target)) {
          toggleSidebar()
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobile, isSidebarOpen, toggleSidebar])



  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <button
        id="sidebar-toggle"
        onClick={toggleSidebar}
        className={`lg:hidden fixed z-30 flex items-center justify-center w-10 h-10 rounded-full shadow-md bg-white dark:bg-gray-800 text-[#ff5c5c] border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isSidebarOpen ? "right-[270px]" : "right-4"
        }`}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
          onClick={() => toggleSidebar()}
        />
      )}

      {/* Sidebar Container */}
      <div
        id="community-sidebar"
        className={`lg:block fixed lg:relative z-30 lg:z-10 top-0 lg:top-auto right-0 lg:right-auto h-full lg:h-auto w-[270px] lg:w-auto bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent transition-transform duration-300 ease-in-out transform ${
          isMobile && !isSidebarOpen ? "translate-x-full" : "translate-x-0"
        } lg:translate-x-0 pt-20 lg:pt-0 px-4 lg:px-0`}
      >
        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-120px)] pb-6">
     
          {/* Top Guides */}
          <TopGuides guides={guides} />
        </div>
      </div>
    </>
  )
}

