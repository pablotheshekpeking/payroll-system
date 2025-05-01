import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import crypto from "crypto"

export async function POST(request) {
  try {
    const body = await request.text()
    const headersList = headers()
    const paystackSignature = headersList.get("x-paystack-signature")

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex")

    if (hash !== paystackSignature) {
      return Response.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    // Handle different event types
    switch (event.event) {
      case "charge.success":
        await handleSuccessfulPayment(event.data)
        break
      
      case "transfer.failed":
        await handleFailedPayment(event.data)
        break
      
      // Add other event types as needed
    }

    return Response.json({ status: "success" })
  } catch (error) {
    console.error("Webhook error:", error)
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(data) {
  await prisma.payment.updateMany({
    where: {
      transferRef: data.reference,
      status: "PENDING"
    },
    data: {
      status: "PAID",
      processedAt: new Date(),
      transferStatus: "SUCCESS"
    }
  })
}

async function handleFailedPayment(data) {
  await prisma.payment.updateMany({
    where: {
      transferRef: data.reference,
      status: "PENDING"
    },
    data: {
      status: "FAILED",
      processedAt: new Date(),
      transferStatus: "FAILED",
      reason: data.reason
    }
  })
} 