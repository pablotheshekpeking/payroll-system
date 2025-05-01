import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request) {
  try {
    const data = await request.json()

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return Response.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }

    // Create full name from firstName and lastName
    const fullName = `${data.firstName} ${data.lastName}`.trim()

    // Validate grade format
    const validGrades = ['JSS1', 'JSS2', 'JSS3', 'SS1', 'SS2', 'SS3']
    const grade = data.grade.toUpperCase()
    
    if (!validGrades.includes(grade)) {
      return Response.json(
        { error: "Invalid grade level" },
        { status: 400 }
      )
    }

    // Create user with STUDENT role (inactive until approved)
    const hashedPassword = await hash(data.passportNumber, 12)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: fullName,
        role: "STUDENT",
        student: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            dateOfBirth: new Date(data.dateOfBirth),
            grade: grade, // Use the validated grade
            enrollment: {
              create: {
                status: "PENDING",
                documents: {
                  createMany: {
                    data: data.documents.map(doc => ({
                      fileName: doc.fileName,
                      url: doc.url
                    }))
                  }
                }
              }
            }
          }
        }
      }
    })

    return Response.json({ 
      success: true,
      message: "Enrollment submitted successfully. Please wait for approval."
    })
  } catch (error) {
    console.error("Enrollment error:", error)
    
    // More detailed error handling
    if (error.code === 'P2002') {
      return Response.json(
        { error: "Email already registered" },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2009') {
      return Response.json(
        { error: "Invalid grade format" },
        { status: 400 }
      )
    }

    return Response.json(
      { error: "Failed to process enrollment" },
      { status: 500 }
    )
  }
} 