import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/utils/auth"

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const student = await prisma.student.findUnique({
      where: { id: params.id },
      include: {
        enrollment: {
          include: {
            documents: true
          }
        },
        fees: {
          include: {
            fee: true,
            payments: true
          }
        },
        user: {
          select: {
            email: true
          }
        }
      }
    })

    if (!student) {
      return Response.json({ error: "Student not found" }, { status: 404 })
    }

    return Response.json(student)
  } catch (error) {
    console.error("Failed to fetch student:", error)
    return Response.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    
    // Convert the date string to a proper ISO DateTime
    const dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : undefined

    // Update student and enrollment status in a transaction
    const student = await prisma.$transaction(async (tx) => {
      const updatedStudent = await tx.student.update({
        where: { id: params.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          grade: data.grade,
          dateOfBirth: dateOfBirth
        }
      })

      if (data.enrollmentStatus) {
        await tx.enrollment.update({
          where: { studentId: params.id },
          data: {
            status: data.enrollmentStatus,
            approvedById: data.enrollmentStatus === "APPROVED" ? session.user.id : null,
            approvedAt: data.enrollmentStatus === "APPROVED" ? new Date() : null
          }
        })
      }

      return updatedStudent
    })

    return Response.json(student)
  } catch (error) {
    console.error("Failed to update student:", error)
    return Response.json(
      { error: error.message || "Failed to update student" },
      { status: 500 }
    )
  }
} 