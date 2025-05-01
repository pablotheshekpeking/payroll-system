'use client'

import { useEffect, useState } from 'react'

interface Balance {
  amount: number
}

export function PaymentsHeader() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBalance() {
      try {
        const response = await fetch('/api/balance')
        const data = await response.json()
        
        // Ensure we have a valid amount
        setBalance({ amount: data.amount || 0 })
      } catch (error) {
        console.error('Failed to fetch balance:', error)
        setBalance({ amount: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
      <p className="text-sm text-muted-foreground">Process and view employee payments.</p>

      {!isLoading && balance && (
        <p className="text-sm font-medium">
          Available Balance: ₦{(balance.amount || 0).toLocaleString()}
        </p>
      )}
    </div>
  )
}
