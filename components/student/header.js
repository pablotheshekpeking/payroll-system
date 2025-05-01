"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "../theme-toggle"
import { Menu } from "lucide-react"

export function Header({ toggleSidebar, isSidebarOpen, isScrolled }) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut({ 
        redirect: true,
        callbackUrl: "/login"
      })
    } catch (error) {
      console.error("Logout error:", error)
      document.cookie = "next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <header className={`
      w-full
      transition-all duration-200
      ${isScrolled 
        ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm' 
        : 'bg-transparent'
      }
    `}>
      <div className="flex items-center justify-between px-4 md:px-8 py-4 bg-background">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h2 className="text-xl font-semibold">Student Portal</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {/* Desktop logout button */}
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 hidden md:flex cursor-pointer"
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
} 