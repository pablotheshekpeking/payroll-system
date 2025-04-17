"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DashboardCards() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalPayroll: 0,
    nextPayday: "",
    growthRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch employees count
        const employeesRes = await fetch("/api/employees")
        const payrollsRes = await fetch("/api/payroll")

        if (employeesRes.ok && payrollsRes.ok) {
          const employees = await employeesRes.json()
          const payrolls = await payrollsRes.json()

          // Find the next scheduled payroll
          const upcomingPayrolls = payrolls
            .filter((p: any) => p.status === "SCHEDULED" || p.status === "DRAFT")
            .sort((a: any, b: any) => new Date(a.payDate).getTime() - new Date(b.payDate).getTime())

          const nextPayday =
            upcomingPayrolls.length > 0
              ? new Date(upcomingPayrolls[0].payDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Not scheduled"

          // Calculate total monthly payroll (simplified)
          const totalPayroll = employees.reduce((sum: number, emp: any) => sum + emp.salary / 12, 0)

          setStats({
            totalEmployees: employees.length,
            totalPayroll: Math.round(totalPayroll),
            nextPayday,
            growthRate: 12.5, // Placeholder for now
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [toast])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Active staff members</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">${stats.totalPayroll.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total monthly expenses</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Next Payday</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.nextPayday}</div>
              <p className="text-xs text-muted-foreground">Upcoming payment date</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">+{stats.growthRate}%</div>
              <p className="text-xs text-muted-foreground">Year-over-year increase</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
