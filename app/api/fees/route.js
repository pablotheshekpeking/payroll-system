import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/utils/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const fees = await prisma.fee.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return Response.json(fees)
  } catch (error) {
    console.error("Failed to fetch fees:", error)
    return Response.json(
      { error: "Failed to fetch fees" },
      { status: 500 }
    )
  }
} 