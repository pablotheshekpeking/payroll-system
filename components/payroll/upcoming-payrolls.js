"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function UpcomingPayrolls() {
  const [upcomingPayrolls, setUpcomingPayrolls] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchUpcomingPayrolls() {
      try {
        const response = await fetch("/api/payroll")
        if (!response.ok) {
          throw new Error("Failed to fetch payrolls")
        }
        const data = await response.json()

        // Filter for upcoming payrolls and sort by pay date
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const upcoming = data
          .filter(payroll => {
            const payDate = new Date(payroll.payDate)
            payDate.setHours(0, 0, 0, 0)
            return payDate >= today
          })
          .sort((a, b) => new Date(a.payDate) - new Date(b.payDate))
          .slice(0, 2) // Get only the next 2

        // Format the data
        const formattedPayrolls = upcoming.map(payroll => {
          const payDate = new Date(payroll.payDate)
          const today = new Date()
          const daysRemaining = Math.ceil((payDate - today) / (1000 * 60 * 60 * 24))

          return {
            id: payroll.id,
            name: payroll.name,
            date: payDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            daysRemaining: daysRemaining,
            amount: payroll.totalAmount,
            employeeCount: payroll.employeeCount || 0,
            status: payroll.status
          }
        })

        setUpcomingPayrolls(formattedPayrolls)
      } catch (error) {
        console.error("Error fetching upcoming payrolls:", error)
        toast({
          title: "Error",
          description: "Failed to load upcoming payrolls.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUpcomingPayrolls()
  }, [toast])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payrolls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-md border p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-md bg-muted p-2">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payrolls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingPayrolls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p>No upcoming payrolls</p>
            </div>
          ) : (
            upcomingPayrolls.map((payroll) => (
              <div key={payroll.id} className="flex items-center justify-between rounded-md border p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-md bg-primary/10 p-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{payroll.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {payroll.date} ({payroll.daysRemaining} days remaining)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payroll.employeeCount} employees
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₦{payroll.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
} 