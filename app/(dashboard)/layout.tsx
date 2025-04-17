import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { Shell } from "@/components/layout/shell"
import { authOptions } from "@/app/utils/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return <Shell>{children}</Shell>
}
