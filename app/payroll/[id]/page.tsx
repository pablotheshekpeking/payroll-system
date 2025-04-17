"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"
import { usePayrollDetails } from "@/hooks/use-payroll"

// Move utility functions outside the component
const getStatusColor = (status: string) => {
  switch (status) {
    case "DRAFT": return "bg-gray-500"
    case "SCHEDULED": return "bg-blue-500"
    case "PROCESSING": return "bg-yellow-500"
    case "COMPLETED": return "bg-green-500"
    case "FAILED": return "bg-red-500"
    case "PENDING": return "bg-yellow-500"
    case "PAID": return "bg-green-500"
    default: return "bg-gray-500"
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
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

type Payment = {
  id: string
  amount: number
  status: string
  processedAt: string | null
  transferRef: string | null
  employee: {
    name: string
    position: string
  }
}

interface PaymentsTableProps {
  payments: Payment[]
}

function PaymentsTable({ payments }: PaymentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Processed At</TableHead>
          <TableHead>Reference</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No payments found
            </TableCell>
          </TableRow>
        ) : (
          payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <div className="font-medium">{payment.employee.name}</div>
                <div className="text-sm text-muted-foreground">
                  {payment.employee.position}
                </div>
              </TableCell>
              <TableCell>{formatAmount(payment.amount)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="flex w-fit items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${getStatusColor(payment.status)}`} />
                  {payment.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(payment.processedAt)}</TableCell>
              <TableCell>
                <span className="font-mono text-sm">
                  {payment.transferRef || 'N/A'}
                </span>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

export default function PayrollDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: payroll, isLoading } = usePayrollDetails(params.id as string)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!payroll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Payroll not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payrolls
        </Button>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{payroll.name}</CardTitle>
              <Badge variant="outline" className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${getStatusColor(payroll.status)}`} />
                {payroll.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Pay Date</p>
                <p className="text-lg font-medium">{formatDate(payroll.payDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Period</p>
                <p className="text-lg font-medium">
                  {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-lg font-medium">{formatAmount(payroll.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Payments</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <PaymentsTable payments={payroll.payments} />
              </TabsContent>
              <TabsContent value="pending" className="mt-4">
                <PaymentsTable 
                  payments={payroll.payments.filter(p => p.status === "PENDING")} 
                />
              </TabsContent>
              <TabsContent value="completed" className="mt-4">
                <PaymentsTable 
                  payments={payroll.payments.filter(p => p.status === "COMPLETED")} 
                />
              </TabsContent>
              <TabsContent value="failed" className="mt-4">
                <PaymentsTable 
                  payments={payroll.payments.filter(p => p.status === "FAILED")} 
                />
              </TabsContent>
              <TabsContent value="paid" className="mt-4">
                <PaymentsTable 
                  payments={payroll.payments.filter(p => p.status === "PAID")} 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 