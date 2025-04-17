"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { usePaymentsData } from "@/hooks/use-payments"
import { Spinner } from "@/components/ui/spinner"

type Payment = {
  id: string
  amount: number
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED"
  processedAt: string | null
  createdAt: string
  employeeName: string
  payrollName: string
  employeeCount: number
}

export function RecentPayments() {
  const { data, isLoading } = usePaymentsData()
  const payments = data?.payments || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500"
      case "PROCESSING":
        return "bg-blue-500"
      case "PAID":
        return "bg-green-500"
      case "FAILED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatAmount = (amount: number | undefined) => {
    if (typeof amount !== 'number') return '₦0.00'
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Payroll</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-16 text-center">
                  <div className="flex items-center justify-center">
                    <Spinner size="sm" />
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-16 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              payments.slice(0, 10).map((payment) => (
                <TableRow key={payment?.id}>
                  <TableCell>{payment?.employee.name}</TableCell>
                  <TableCell>
                    {payment?.payrollName}
                    <div className="text-xs text-muted-foreground">
                      {payment?.employeeCount} employees
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(payment?.processedAt || payment?.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex w-fit items-center gap-1 font-normal">
                      <span className={`h-2 w-2 rounded-full ${getStatusColor(payment?.status)}`} />
                      {payment?.status || 'UNKNOWN'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatAmount(payment?.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
