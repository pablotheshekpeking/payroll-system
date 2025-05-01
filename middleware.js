import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Handle root path
    if (path === "/") {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
      // If logged in, redirect based on role
      if (token.role === "STUDENT") {
        return NextResponse.redirect(new URL("/studentdash", req.url))
      }
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Protect student dashboard
    if (path.startsWith("/studentdash")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
      if (token.role !== "STUDENT") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // Protect admin/staff dashboard
    if (path.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
      if (token.role === "STUDENT") {
        return NextResponse.redirect(new URL("/studentdash", req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/studentdash/:path*',
    // Add other protected routes here
  ]
} 