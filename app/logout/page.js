"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"

export default function LogoutPage() {
  useEffect(() => {
    const forceLogout = async () => {
      try {
        // Clear all cookies
        document.cookie.split(";").forEach(cookie => {
          document.cookie = cookie
            .replace(/^ +/, "")
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
        })
        
        await signOut({ 
          redirect: true,
          callbackUrl: "/login"
        })
      } catch (error) {
        // Force redirect to login if signOut fails
        window.location.href = "/login"
      }
    }

    forceLogout()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Logging out...</p>
    </div>
  )
} 