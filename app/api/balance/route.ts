import { paystack } from '@/lib/paystack'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const balance = await paystack.getBalance()
    // Paystack returns an array of balances, we'll take the first one
    const amount = balance[0]?.balance || 0
    return NextResponse.json({ amount })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch balance', amount: 0 },
      { status: 500 }
    )
  }
} 