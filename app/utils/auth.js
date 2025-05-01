import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password")
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              student: {
                select: {
                  enrollment: {
                    select: {
                      status: true
                    }
                  }
                }
              }
            }
          })

          if (!user) {
            throw new Error("No user found with this email")
          }

          const isPasswordValid = await compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error("Invalid password")
          }

          // Check if student's enrollment is approved
          if (user.role === "STUDENT") {
            if (!user.student?.enrollment) {
              throw new Error("No enrollment found")
            }
            if (user.student.enrollment.status !== "APPROVED") {
              throw new Error("Enrollment pending approval")
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          throw error // Re-throw the error to be caught by NextAuth
        }
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    signOut: async () => {
      // Clear any additional state/cookies here if needed
    },
    async signIn({ user, account, profile, isNewUser }) {
      console.log("Sign in attempt:", { user, account, isNewUser })
    },
    async error(error) {
      console.error("Auth error:", error)
    }
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  }
} 