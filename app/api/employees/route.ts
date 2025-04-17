import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { sql } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const employees = await sql`
      SELECT * FROM "Employee"
      ORDER BY "name" ASC
    `

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { name, email, position, department, salary, status } = data

    const result = await sql`
      INSERT INTO "Employee" (
        "id", "name", "email", "position", "department", "salary", "status", "createdAt", "updatedAt"
      ) VALUES (
        ${"emp_" + Math.random().toString(36).substr(2, 9)}, 
        ${name}, 
        ${email}, 
        ${position}, 
        ${department}, 
        ${salary}, 
        ${status || "ACTIVE"}, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
