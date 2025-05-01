import { prisma } from "@/lib/prisma"
import { paystack } from "@/lib/paystack"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get("reference")

    if (!reference) {
      return Response.json(
        { error: "Payment reference is required" },
        { status: 400 }
      )
    }

    // Verify payment with Paystack
    const transactionData = await paystack.verifyTransaction(reference)

    if (transactionData.status !== "success") {
      return Response.json(
        { error: "Payment verification failed" },
        { status: 400 }
      )
    }

    // Update payment records in database
    await prisma.payment.updateMany({
      where: {
        transferRef: reference,
        status: "PENDING"
      },
      data: {
        status: "PAID",
        processedAt: new Date(),
        transferStatus: "SUCCESS"
      }
    })

    return Response.json({ status: "success" })
  } catch (error) {
    console.error("Payment verification error:", error)
    return Response.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
} 