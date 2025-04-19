import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { sql } from "@/lib/db"
import { authOptions } from "@/app/utils/auth"

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    await sql`DELETE FROM "Employee" WHERE id = ${id}`
    return NextResponse.json({ message: "Employee deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
} 

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    const employees = await sql`SELECT * FROM "Employee" WHERE id = ${id}`
    
    // Return 404 if employee not found
    if (!employees || employees.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Return the first (and should be only) employee
    return NextResponse.json(employees[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 })
  }
}