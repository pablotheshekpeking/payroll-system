import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const payroll = await prisma.payroll.findUnique({
      where: { id: params.id },
      include: {
        payments: {
          include: {
            employee: true
          }
        }
      }
    })

    if (!payroll) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 })
    }

    return NextResponse.json(payroll)
  } catch (error) {
    console.error("Payroll fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payroll details" },
      { status: 500 }
    )
  }
} 