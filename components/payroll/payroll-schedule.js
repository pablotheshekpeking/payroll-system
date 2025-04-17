"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, FileText, Download, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function PayrollSchedule() {
  const [payrolls, setPayrolls] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function fetchPayrolls() {
      try {
        const response = await fetch("/api/payroll")
        if (!response.ok) {
          throw new Error("Failed to fetch payrolls")
        }
        const data = await response.json()

        // Format the data to match our component's expected structure
        const formattedData = data.map((payroll) => ({
          id: payroll.id,
          name: payroll.name,
          payDate: new Date(payroll.payDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          periodStart: new Date(payroll.periodStart).toLocaleDateString(),
          periodEnd: new Date(payroll.periodEnd).toLocaleDateString(),
          period: `${new Date(payroll.periodStart).toLocaleDateString()} - ${new Date(payroll.periodEnd).toLocaleDateString()}`,
          totalAmount: payroll.totalAmount,
          employeeCount: payroll.employeeCount || 0,
          status: payroll.status,
        }))

        setPayrolls(formattedData)
      } catch (error) {
        console.error("Error fetching payrolls:", error)
        toast({
          title: "Error",
          description: "Failed to load payroll schedule. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayrolls()
  }, [toast])

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-500"
      case "SCHEDULED":
        return "bg-blue-500"
      case "PROCESSING":
        return "bg-yellow-500"
      case "COMPLETED":
        return "bg-green-500"
      case "FAILED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleViewDetails = (payrollId) => {
    router.push(`/payroll/${payrollId}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead className="hidden md:table-cell">Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-16 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payrolls
                    .filter((p) => p.status === "SCHEDULED" || p.status === "DRAFT")
                    .map((payroll) => (
                      <TableRow key={payroll.id}>
                        <TableCell>
                          <div className="font-medium">{payroll.name}</div>
                          <div className="text-sm text-muted-foreground">{payroll.employeeCount} employees</div>
                        </TableCell>
                        <TableCell>{payroll.payDate}</TableCell>
                        <TableCell className="hidden md:table-cell">{payroll.period}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex w-fit items-center gap-1 font-normal">
                            <span className={`h-2 w-2 rounded-full ${getStatusColor(payroll.status)}`} />
                            {payroll.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${payroll.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewDetails(payroll.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="past">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead className="hidden md:table-cell">Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-16 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payrolls
                    .filter((p) => p.status === "COMPLETED" || p.status === "FAILED")
                    .map((payroll) => (
                      <TableRow key={payroll.id}>
                        <TableCell>
                          <div className="font-medium">{payroll.name}</div>
                          <div className="text-sm text-muted-foreground">{payroll.employeeCount} employees</div>
                        </TableCell>
                        <TableCell>{payroll.payDate}</TableCell>
                        <TableCell className="hidden md:table-cell">{payroll.period}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex w-fit items-center gap-1 font-normal">
                            <span className={`h-2 w-2 rounded-full ${getStatusColor(payroll.status)}`} />
                            {payroll.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${payroll.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewDetails(payroll.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
