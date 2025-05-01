"use client"

import { useState, Suspense } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data) {
    setIsLoading(true)
    try {
      const response = await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl,
        redirect: false,
      })

      if (response?.error) {
        // Handle specific error messages
        switch (response.error) {
          case "No user found with this email":
            toast.error("Account Not Found", {
              description: "No account exists with this email address"
            })
            break
          case "Invalid password":
            toast.error("Invalid Password", {
              description: "The password you entered is incorrect"
            })
            break
          case "Enrollment pending approval":
            toast.error("Enrollment Pending", {
              description: "Your enrollment is still pending approval"
            })
            break
          case "No enrollment found":
            toast.error("No Enrollment", {
              description: "No enrollment record found for this account"
            })
            break
          default:
            toast.error("Login Failed", {
              description: response.error
            })
        }
        return
      }

      if (!response?.ok) {
        toast.error("Authentication Failed", {
          description: "There was a problem with the authentication service"
        })
        return
      }

      // Success case
      toast.success("Login Successful", {
        description: "Redirecting to your dashboard..."
      })
      router.push(callbackUrl)
      router.refresh()

    } catch (error) {
      console.error("Login error:", error)
      toast.error("System Error", {
        description: "An unexpected error occurred. Please try again later."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          {...form.register("email")}
          type="email"
          placeholder="Email"
          disabled={isLoading}
          className={form.formState.errors.email ? "border-red-500" : ""}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Input
          {...form.register("password")}
          type="password"
          placeholder="Password"
          disabled={isLoading}
          className={form.formState.errors.password ? "border-red-500" : ""}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
} 