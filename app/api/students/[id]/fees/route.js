import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/utils/auth"

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const studentFee = await prisma.studentFee.create({
      data: {
        studentId: params.id,
        feeId: data.feeId,
        dueDate: data.dueDate
      },
      include: {
        fee: true
      }
    })

    return Response.json(studentFee)
  } catch (error) {
    console.error("Failed to assign fee:", error)
    return Response.json(
      { error: "Failed to assign fee" },
      { status: 500 }
    )
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentFees = await prisma.studentFee.findMany({
      where: {
        studentId: params.id
      },
      include: {
        fee: true,
        payments: true
      }
    })

    return Response.json(studentFees)
  } catch (error) {
    console.error("Failed to fetch student fees:", error)
    return Response.json(
      { error: "Failed to fetch student fees" },
      { status: 500 }
    )
  }
} 