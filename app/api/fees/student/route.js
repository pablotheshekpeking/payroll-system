import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/utils/auth"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the student record for the logged-in user
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        fees: {
          include: {
            fee: true,
            payments: {
              select: {
                amount: true,
                status: true,
                processedAt: true
              }
            }
          }
        }
      }
    })

    if (!student) {
      return Response.json({ error: "Student not found" }, { status: 404 })
    }

    // Transform the data to include payment status and remaining amount
    const fees = student.fees.map(studentFee => {
      const totalPaid = studentFee.payments.reduce((sum, payment) => 
        sum + (payment.status === "PAID" ? payment.amount : 0), 0
      )

      return {
        id: studentFee.id,
        name: studentFee.fee.name,
        description: studentFee.fee.description,
        amount: studentFee.fee.amount,
        currency: studentFee.fee.currency,
        dueDate: studentFee.dueDate,
        assignedAt: studentFee.assignedAt,
        totalPaid,
        remainingAmount: studentFee.fee.amount - totalPaid,
        status: totalPaid >= studentFee.fee.amount ? "PAID" : "PENDING",
        payments: studentFee.payments
      }
    })

    return Response.json(fees)
  } catch (error) {
    console.error("Failed to fetch student fees:", error)
    return Response.json(
      { error: "Failed to fetch student fees" },
      { status: 500 }
    )
  }
} 