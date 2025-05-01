"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function VerifyPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState("verifying") // verifying, success, failed

  useEffect(() => {
    const reference = searchParams.get("reference")
    if (!reference) {
      setStatus("failed")
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payments/verify?reference=${reference}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Verification failed")
        }

        setStatus("success")
        toast.success("Payment verified successfully")
      } catch (error) {
        console.error("Verification error:", error)
        setStatus("failed")
        toast.error("Payment verification failed", {
          description: error.message
        })
      }
    }

    verifyPayment()
  }, [searchParams])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          {status === "verifying" && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Verifying Payment</h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your payment...
                </p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <h2 className="text-xl font-semibold text-green-600">
                  Payment Successful
                </h2>
                <p className="text-muted-foreground">
                  Your payment has been verified successfully
                </p>
              </div>
              <Button
                className="mt-4"
                onClick={() => router.push("/studentdash/fees")}
              >
                Return to Fees
              </Button>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 mx-auto text-red-500" />
              <div>
                <h2 className="text-xl font-semibold text-red-600">
                  Payment Verification Failed
                </h2>
                <p className="text-muted-foreground">
                  We couldn't verify your payment. Please contact support if you believe this is an error.
                </p>
              </div>
              <Button
                className="mt-4"
                onClick={() => router.push("/studentdash/fees")}
              >
                Return to Fees
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 