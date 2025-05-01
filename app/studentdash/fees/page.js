"use client"

import { useState } from "react"
import { useAllFees } from "@/hooks/useFees"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { Loader2, CreditCard } from "lucide-react"
import { PaymentModal } from "@/components/student/PaymentModal"
import { toast } from "sonner"

export default function StudentFeesPage() {
  const { data: fees, isLoading } = useAllFees()
  const [selectedFees, setSelectedFees] = useState([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalDebt = fees?.reduce((total, fee) => total + fee.remainingAmount, 0) || 0

  const handlePayAll = () => {
    setSelectedFees(fees.filter(fee => fee.remainingAmount > 0))
    setIsPaymentModalOpen(true)
  }

  const handlePaySingle = (fee) => {
    setSelectedFees([fee])
    setIsPaymentModalOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Fees Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Outstanding</p>
              <p className="text-2xl font-bold text-red-600">
                ₦{totalDebt.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Fees</p>
              <p className="text-2xl font-bold">
                ₦{fees?.reduce((total, fee) => total + fee.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
          {totalDebt > 0 && (
            <Button className="w-full" onClick={handlePayAll}>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay All Fees
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Individual Fees */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Fee Details</h2>
        {fees?.map((fee) => (
          <Card key={fee.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{fee.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Due: {format(new Date(fee.dueDate), "PP")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₦{fee.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Paid: ₦{fee.totalPaid.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Progress 
                  value={(fee.totalPaid / fee.amount) * 100} 
                  className="h-2" 
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {Math.round((fee.totalPaid / fee.amount) * 100)}% paid
                  </span>
                  {fee.remainingAmount > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePaySingle(fee)}
                    >
                      Pay ₦{fee.remainingAmount.toLocaleString()}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!fees || fees.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No fees assigned yet
            </CardContent>
          </Card>
        )}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        fees={selectedFees}
      />
    </div>
  )
} 