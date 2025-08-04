import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/utils/auth"

// GET /api/students/[id]/docs
export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get the student record for the current user
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        enrollment: {
          include: {
            documents: true
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (!student.enrollment) {
      return NextResponse.json({ error: "No enrollment found for this student" }, { status: 404 })
    }

    return NextResponse.json(student.enrollment.documents)
  } catch (error) {
    console.error("Failed to fetch documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents", details: error.message }, { status: 500 })
  }
}