import { prisma } from "@/lib/prisma"
import { GRADES } from "@/lib/constants"
import { hash } from "bcryptjs"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const grade = searchParams.get("grade") || undefined
    const hasDebt = searchParams.get("hasDebt") === "true"
    
    const skip = (page - 1) * limit

    // Build the where clause based on filters
    const where = {
      AND: [
        // Search in first name or last name
        search ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        // Only add grade filter if grade is provided and not empty
        grade && grade !== "" ? { grade } : {},
        // Add debt filter if specified
        hasDebt ? {
          fees: {
            some: {
              AND: [
                {
                  fee: {
                    amount: {
                      gt: 0
                    }
                  }
                },
                {
                  payments: {
                    none: {
                      status: "PAID"
                    }
                  }
                }
              ]
            }
          }
        } : {}
      ]
    }

    // Get students with pagination
    const students = await prisma.student.findMany({
      where,
      include: {
        enrollment: {
          select: {
            status: true
          }
        },
        fees: {
          include: {
            fee: true,
            payments: {
              where: {
                status: "PAID"
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Calculate debt for each student
    const studentsWithDebt = students.map(student => {
      const totalFees = student.fees.reduce((total, fee) => total + fee.fee.amount, 0)
      const totalPaid = student.fees.reduce((total, fee) => 
        total + fee.payments.reduce((sum, payment) => sum + payment.amount, 0), 0
      )
      
      return {
        ...student,
        totalFees,
        totalPaid,
        debt: totalFees - totalPaid
      }
    })

    // Get total count for pagination
    const total = await prisma.student.count({ where })

    return Response.json({
      students: studentsWithDebt,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })
  } catch (error) {
    console.error("Failed to fetch students:", error)
    return Response.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    // Create user with student
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: await hash(data.password, 10), // Hash the password
        role: "STUDENT",
        name: `${data.firstName} ${data.lastName}`,
        student: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: new Date(data.dateOfBirth),
            grade: data.grade,
            enrollment: {
              create: {
                status: "APPROVED",
                appliedAt: new Date(),
              }
            }
          }
        }
      },
      include: {
        student: {
          include: {
            enrollment: true
          }
        }
      }
    })

    return Response.json(user.student)
  } catch (error) {
    console.error("Failed to create student:", error)
    if (error.code === 'P2002') {
      return Response.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }
    return Response.json(
      { error: "Failed to create student" },
      { status: 500 }
    )
  }
} 