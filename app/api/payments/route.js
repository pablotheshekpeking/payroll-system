import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/utils/auth"
import { paystack } from "@/lib/paystack"
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { 
      employeeId, 
      amount, 
      description, 
      payrollId, 
      currency = "NGN",
      dryRun = false 
    } = data

    console.log("Payment request data:", data)
    
    if (dryRun) {
      console.log("Running in dry run mode")
    }

    // Validate input
    if (!employeeId || !amount || amount <= 0 || !payrollId) {
      return NextResponse.json({ error: "Invalid payment details" }, { status: 400 })
    }

    // Get employee with bank account details
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        bankAccount: true
      }
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    if (!employee.bankAccount) {
      return NextResponse.json({ 
        error: "Employee bank details not found",
        message: "Please add bank account details before processing payment"
      }, { status: 400 })
    }

    // Get payroll details
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId }
    })

    if (!payroll) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 })
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        id: uuidv4(),
        amount,
        status: dryRun ? 'PAID' : 'PENDING',
        employeeId,
        payrollId,
        reason: description,
        transferStatus: dryRun ? 'SUCCESS' : 'PENDING',
        processedAt: dryRun ? new Date() : null
      }
    })

    if (dryRun) {
      // For dry run, return success immediately
      return NextResponse.json({
        success: true,
        message: "Dry run completed successfully",
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: 'PAID',
          transferStatus: 'SUCCESS',
          processedAt: payment.processedAt
        }
      })
    }

    // Check available balance
    try {
      const balance = await paystack.getBalance()
      if (balance.balance < amount) {
        // Update payment status to failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: { 
            status: 'FAILED',
            transferStatus: 'FAILED'
          }
        })
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
      }
    } catch (error) {
      console.error('Failed to check Paystack balance:', error)
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'FAILED',
          transferStatus: 'FAILED'
        }
      })
      return NextResponse.json({ error: "Unable to verify available balance" }, { status: 500 })
    }

    try {
      // Create transfer recipient
      const recipient = await paystack.createTransferRecipient({
        type: "nuban",
        name: employee.bankAccount.accountName,
        account_number: employee.bankAccount.accountNumber,
        bank_code: employee.bankAccount.bankCode,
        currency
      })

      // Generate unique reference
      const reference = `PAY_${payment.id}_${Date.now()}`

      // Initiate transfer
      const transfer = await paystack.initiateTransfer({
        source: "balance",
        amount: Math.round(amount * 100),
        recipient: recipient.recipient_code,
        reason: description || `Payment for ${payroll.name}`,
        currency,
        reference
      })

      // Update payment with transfer details
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PROCESSING',
          transferCode: transfer.transfer_code,
          transferRef: reference,
          transferStatus: 'PROCESSING',
          processedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: "Payment initiated successfully",
        payment: updatedPayment,
        transfer: transfer
      })

    } catch (error) {
      console.error("Transfer processing error:", error)
      
      // Update payment as failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          transferStatus: 'FAILED'
        }
      })

      if (error.code === 'transfer_unavailable') {
        return NextResponse.json({ 
          error: "Payment transfers are not available. Please upgrade your Paystack account.",
          code: error.code 
        }, { status: 400 })
      }

      return NextResponse.json({
        error: "Failed to process payment",
        details: error.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({
      error: "Failed to process payment",
      details: error.message
    }, { status: 500 })
  }
}

export async function GET(request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const payrollId = searchParams.get("payrollId")

    if (payrollId) {
      // Get payments for specific payroll
      const payments = await prisma.payment.findMany({
        where: { payrollId },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
              department: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json(payments)
    } else {
      // Get all payrolls with payment summaries
      const payrolls = await prisma.payroll.findMany({
        include: {
          payments: {
            include: {
              employee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  position: true,
                  department: true
                }
              }
            }
          },
          _count: {
            select: { payments: true }
          }
        },
        orderBy: { payDate: 'desc' }
      })

      return NextResponse.json(payrolls)
    }
  } catch (error) {
    console.error("Failed to fetch payments:", error)
    return NextResponse.json({
      error: "Failed to fetch payments",
      details: error.message
    }, { status: 500 })
  }
} 