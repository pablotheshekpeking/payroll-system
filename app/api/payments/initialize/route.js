import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/utils/auth"
import { paystack } from "@/lib/paystack"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Get student details
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true
      }
    })

    if (!student) {
      return Response.json({ error: "Student not found" }, { status: 404 })
    }

    // Initialize Paystack transaction
    const paystackData = await paystack.initializeTransaction({
      email: student.user.email,
      amount: Math.round(data.amount * 100), // Convert to kobo and ensure it's an integer
      metadata: {
        student_id: student.id,
        fee_ids: data.feeIds,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/studentdash/fees/verify`,
    })

    // Create pending payments in database
    await prisma.$transaction(
      data.feeIds.map(feeId => 
        prisma.payment.create({
          data: {
            amount: data.amount / data.feeIds.length, // Split amount equally among fees
            status: "PENDING",
            studentFeeId: feeId,
            transferRef: paystackData.reference,
          }
        })
      )
    )

    return Response.json(paystackData)
  } catch (error) {
    console.error("Failed to initialize payment:", error)
    return Response.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    )
  }
} 