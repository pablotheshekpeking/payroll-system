import { useSession } from "next-auth/react"
import { toast } from "sonner"

export function usePaystack() {
  const { data: session } = useSession()

  const initializePayment = async ({ amount, feeIds }) => {
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          feeIds,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to initialize payment')
      }

      return response.json()
    } catch (error) {
      toast.error("Payment initialization failed", {
        description: error.message
      })
      throw error
    }
  }

  return { initializePayment }
} 