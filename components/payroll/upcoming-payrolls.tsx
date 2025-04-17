import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"

export function UpcomingPayrolls() {
  const upcomingPayrolls = [
    {
      id: "1",
      name: "May 2025 Payroll",
      date: "May 15, 2025",
      daysRemaining: 28,
      amount: 143825,
    },
    {
      id: "2",
      name: "May 2025 Payroll",
      date: "May 31, 2025",
      daysRemaining: 44,
      amount: 143825,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payrolls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingPayrolls.map((payroll) => (
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
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${payroll.amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
