"use client"

import { useState } from "react"
import { Dialog } from "@/components/ui/dialog"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePaystack } from "@/hooks/use-paystack"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function PaymentModal({ isOpen, onClose, fees }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { initializePayment } = usePaystack()

  // Calculate total amount using the correct data structure
  const totalAmount = fees.reduce((total, fee) => {
    return total + fee.remainingAmount
  }, 0)

  const handlePayment = async () => {
    try {
      setIsProcessing(true)
      
      // Initialize payment with Paystack
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          feeIds: fees.map(fee => fee.id),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to initialize payment')
      }

      const data = await response.json()
      
      // Redirect to Paystack payment page
      window.location.href = data.authorization_url
    } catch (error) {
      toast.error("Failed to initialize payment", {
        description: error.message || "Please try again later"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Review your payment details before proceeding
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            {fees.map(fee => (
              <div key={fee.id} className="flex justify-between items-center">
                <span className="font-medium">{fee.name}</span>
                <span>₦{fee.remainingAmount.toLocaleString()}</span>
              </div>
            ))}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="font-semibold">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 