import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/bank`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch banks from Paystack')
    }

    const data = await response.json()
    
    // Filter to get only Nigerian banks (you can modify this based on your needs)
    const banks = data.data.filter(bank => bank.country === 'Nigeria')
    
    return NextResponse.json(banks)
  } catch (error) {
    console.error("Failed to fetch banks:", error)
    return NextResponse.json(
      { error: "Failed to fetch banks" },
      { status: 500 }
    )
  }
} 