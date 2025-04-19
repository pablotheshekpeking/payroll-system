import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { sql } from "@/lib/db"
import { authOptions } from "@/app/utils/auth"
import { paystack } from "@/lib/paystack"
import { v4 as uuidv4 } from 'uuid'

// Define PaystackError class
class PaystackError extends Error {
  constructor(message, code, response) {
    super(message)
    this.name = 'PaystackError'
    this.code = code
    this.response = response
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { employeeId, amount, description, payrollId, currency = "NGN" } = data

    // Validate input
    if (!employeeId || !amount || amount <= 0 || !payrollId) {
      return NextResponse.json({ error: "Invalid payment details" }, { status: 400 })
    }

    // Check employee bank details first
    const [employee] = await sql`
      SELECT e.*, ba."accountNumber", ba."bankCode", ba."accountName"
      FROM "Employee" e
      LEFT JOIN "BankAccount" ba ON ba."employeeId" = e."id"
      WHERE e."id" = ${employeeId}
    `

    if (!employee || !employee.accountNumber || !employee.bankCode) {
      return NextResponse.json({ 
        error: "Employee bank details not found",
        message: "Please add bank account details before processing payment"
      }, { status: 400 })
    }

    // Check available balance
    try {
      const balance = await paystack.getBalance()
      if (balance.balance < amount * 100) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
      }
    } catch (error) {
      console.error('Failed to check Paystack balance:', error)
      return NextResponse.json({ error: "Unable to verify available balance" }, { status: 500 })
    }

    // Create payment record first
    const id = uuidv4()
    const [payment] = await sql`
      INSERT INTO "Payment" (
        "id",
        "amount", 
        "status", 
        "employeeId", 
        "payrollId",
        "reason",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${id},
        ${amount},
        'PENDING',
        ${employeeId},
        ${payrollId},
        ${description},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    try {
      // Create transfer recipient
      const recipient = await paystack.createTransferRecipient({
        type: "nuban",
        name: employee.accountName,
        account_number: employee.accountNumber,
        bank_code: employee.bankCode,
        currency
      })

      // Generate unique reference
      const reference = `PAY_${payment.id}_${Date.now()}`

      // Initiate transfer
      const transfer = await paystack.initiateTransfer({
        source: "balance",
        amount: Math.round(amount * 100),
        recipient: recipient.recipient_code,
        reason: description,
        currency,
        reference
      })

      // Update payment with transfer details
      const [updatedPayment] = await sql`
        UPDATE "Payment"
        SET 
          "status" = 'PROCESSING',
          "transferCode" = ${transfer.transfer_code},
          "transferRef" = ${reference},
          "transferStatus" = ${transfer.status},
          "processedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${payment.id}
        RETURNING *
      `

      return NextResponse.json(updatedPayment)

    } catch (error) {
      // If Paystack transfer fails, update payment status to FAILED
      await sql`
        UPDATE "Payment"
        SET 
          "status" = 'FAILED',
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${payment.id}
      `

      if (error.code === 'transfer_unavailable') {
        return NextResponse.json({ 
          error: "Payment transfers are not available. Please upgrade your Paystack account.",
          code: error.code 
        }, { status: 400 })
      }

      throw error
    }

  } catch (error) {
    console.error('Payment processing failed', { error })
    
    if (error instanceof PaystackError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'INSUFFICIENT_FUNDS' ? 400 : 500 }
      )
    }

    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    )
  }
}

export async function GET() {
    const session = await getServerSession(authOptions)
  
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    try {
      const payrolls = await sql`
        SELECT 
          p.*,
          (SELECT COUNT(*) FROM "Payment" WHERE "payrollId" = p.id) as "employeeCount",
          (
            SELECT json_agg(
              json_build_object(
                'id', pm.id,
                'amount', pm.amount,
                'status', pm.status,
                'processedAt', pm."processedAt",
                'transferCode', pm."transferCode",
                'transferRef', pm."transferRef",
                'transferStatus', pm."transferStatus",
                'reason', pm.reason,
                'createdAt', pm."createdAt",
                'updatedAt', pm."updatedAt",
                'employee', json_build_object(
                  'id', e.id,
                  'name', e.name,
                  'email', e.email,
                  'position', e.position,
                  'department', e.department
                )
              )
            )
            FROM "Payment" pm
            JOIN "Employee" e ON e.id = pm."employeeId"
            WHERE pm."payrollId" = p.id
          ) as "payments"
        FROM "Payroll" p
        ORDER BY p."payDate" DESC
      `
  
      return NextResponse.json(payrolls)
    } catch (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch payrolls" }, { status: 500 })
    }
  } 