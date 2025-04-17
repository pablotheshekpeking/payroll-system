"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePaymentsData } from "@/hooks/use-payments"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"

export function RecentPayouts() {
  const { data, isLoading } = usePaymentsData()
  const payments = data?.payments || []

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const getStatusColor = (status) => {
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

  // Get only completed/paid payments and sort by date
  const recentPayouts = payments
    .filter(payment => payment.status === "PAID")
    .sort((a, b) => {
      const dateA = new Date(a.processedAt || a.createdAt)
      const dateB = new Date(b.processedAt || b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 5) // Show only the 5 most recent payouts

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payouts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-16 text-center">
                  <div className="flex items-center justify-center">
                    <Spinner size="sm" />
                    <span className="ml-2">Loading payouts...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : recentPayouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-16 text-center">
                  No recent payouts found.
                </TableCell>
              </TableRow>
            ) : (
              recentPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">
                    {payout.employee.name}
                  </TableCell>
                  <TableCell>
                    {formatDate(payout.processedAt || payout.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className="flex w-fit items-center gap-1 font-normal"
                    >
                      <span className={`h-2 w-2 rounded-full ${getStatusColor(payout.status)}`} />
                      {payout.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatAmount(payout.amount)}
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
