import { Card, CardContent } from "@/components/ui/card"

export function DashboardHeader() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome to your payroll dashboard. Here's an overview of your payroll system.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
