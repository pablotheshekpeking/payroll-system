import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { name, payDate, periodStart, periodEnd, employeeIds, processImmediately } = data

    // Create payroll
    const payroll = await prisma.payroll.create({
      data: {
        name,
        payDate: new Date(payDate),
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        status: processImmediately ? "PROCESSING" : "SCHEDULED",
        totalAmount: 0, // Will be updated after payments are created
      }
    })

    // Get employees
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds }
      }
    })

    // Create payments for each employee
    const payments = await Promise.all(
      employees.map(employee =>
        prisma.payment.create({
          data: {
            amount: employee.salary / 24, // Bi-monthly payment
            status: "PENDING",
            reason: `${name} - Salary payment for ${employee.name}`,
            employeeId: employee.id,
            payrollId: payroll.id
          }
        })
      )
    )

    // Update payroll total amount
    await prisma.payroll.update({
      where: { id: payroll.id },
      data: {
        totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0)
      }
    })

    // If processImmediately is true, initiate payments
    if (processImmediately) {
      // Process payments logic here
    }

    return NextResponse.json(payroll)
  } catch (error) {
    console.error("Payroll creation error:", error)
    return NextResponse.json(
      { error: "Failed to create payroll" },
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
      orderBy: {
        payDate: 'desc'
      }
    })

    // Transform the data to include employeeCount and format payments
    const formattedPayrolls = payrolls.map(payroll => {
      // Get unique employee count (in case an employee has multiple payments)
      const uniqueEmployees = new Set(payroll.payments.map(payment => payment.employee.id))
      
      return {
        id: payroll.id,
        name: payroll.name,
        payDate: payroll.payDate,
        periodStart: payroll.periodStart,
        periodEnd: payroll.periodEnd,
        totalAmount: payroll.totalAmount,
        status: payroll.status,
        createdAt: payroll.createdAt,
        updatedAt: payroll.updatedAt,
        employeeCount: uniqueEmployees.size,
        payments: payroll.payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          processedAt: payment.processedAt,
          transferCode: payment.transferCode,
          transferRef: payment.transferRef,
          transferStatus: payment.transferStatus,
          reason: payment.reason,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          employee: payment.employee
        }))
      }
    })

    return NextResponse.json(formattedPayrolls)
  } catch (error) {
    console.error("Payroll fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payrolls" },
      { status: 500 }
    )
  }
} 