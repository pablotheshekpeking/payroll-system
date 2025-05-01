"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/student/header"
import { Sidebar } from "@/components/student/sidebar"
import { LayoutDashboard, CreditCard } from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/studentdash', icon: LayoutDashboard },
  { name: 'Fees', href: '/studentdash/fees', icon: CreditCard },
  // ... other navigation items ...
]

export default function StudentDashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    // Initial check
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="sticky top-0 z-50 border-b">
        <Header 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
          isScrolled={isScrolled}
        />
      </div>
      
      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-[280px] shrink-0 border-r">
          <Sidebar />
        </div>

        {/* Mobile Sidebar with Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Dark overlay */}
            <div 
              className="fixed inset-0 bg-black/90"
              onClick={toggleSidebar}
            />
            
            {/* Sidebar Container */}
            <div className="
              relative w-[280px] h-full
              animate-in slide-in-from-left duration-300
            ">
              <div className="absolute inset-0 bg-white shadow-2xl">
                <Sidebar onClose={toggleSidebar} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          isSidebarOpen ? 'md:block hidden' : 'block'
        }`}>
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 