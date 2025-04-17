import { NextResponse } from "next/server"
import { paystack } from "@/lib/paystack"
import { sql } from "@/lib/db"

export async function POST(request) {
  const signature = request.headers.get('x-paystack-signature')
  const body = await request.text()

  if (!signature || !paystack.verifyWebhookSignature(signature, body)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(body)

  try {
    switch (event.event) {
      case 'transfer.success':
        await handleTransferSuccess(event.data)
        break
      case 'transfer.failed':
        await handleTransferFailed(event.data)
        break
      case 'transfer.reversed':
        await handleTransferReversed(event.data)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing failed', { error, event })
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleTransferSuccess(data) {
  await sql`
    UPDATE "Payment"
    SET 
      "status" = 'COMPLETED',
      "transferStatus" = 'success',
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "transferRef" = ${data.reference}
  `
  
  console.info('Transfer successful', { reference: data.reference })
}

async function handleTransferFailed(data) {
  await sql`
    UPDATE "Payment"
    SET 
      "status" = 'FAILED',
      "transferStatus" = 'failed',
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "transferRef" = ${data.reference}
  `

  console.error('Transfer failed', { 
    reference: data.reference,
    reason: data.reason 
  })
}

async function handleTransferReversed(data) {
  await sql`
    UPDATE "Payment"
    SET 
      "status" = 'FAILED',
      "transferStatus" = 'reversed',
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE "transferRef" = ${data.reference}
  `

  console.warn('Transfer reversed', { reference: data.reference })
} 