"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Play, TestTube } from "lucide-react"

const formSchema = z.object({
  employeeId: z.string({
    required_error: "Please select an employee.",
  }),
  payrollId: z.string({
    required_error: "Please select a payroll.",
  }),
  amount: z.coerce.number().positive({
    message: "Amount must be a positive number.",
  }),
  processImmediately: z.boolean().default(false),
  dryRun: z.boolean().default(false),
  description: z.string().optional(),
})

export function ProcessPayment() {
  const [employees, setEmployees] = useState([])
  const [payrolls, setPayrolls] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Fetch employees and payrolls when component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const [employeesRes, payrollsRes] = await Promise.all([fetch("/api/employees"), fetch("/api/payroll")])

        if (employeesRes.ok && payrollsRes.ok) {
          const employeesData = await employeesRes.json()
          const payrollsData = await payrollsRes.json()

          setEmployees(employeesData)
          setPayrolls(payrollsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data. Please try again.")
      }
    }

    fetchData()
  }, [])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      processImmediately: true,
      dryRun: false,
      description: "",
    },
  })

  const watchDryRun = form.watch("dryRun")

  async function onSubmit(values) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...values,
          processPayment: values.processImmediately,
          dryRun: values.dryRun,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error cases
        if (data.error === "Employee bank details not found") {
          toast.error("Employee does not have bank account details. Please add bank details before processing payment.")
          return
        }

        if (response.status === 400) {
          toast.error("Insufficient balance. Please add more funds to your account.")
          return
        }

        if (response.status === 401) {
          toast.error("Your session has expired. Please log in again.")
          return
        }

        throw new Error(data.error || "Failed to process payment")
      }

      // Show appropriate success message based on dry run mode
      if (values.dryRun) {
        toast.success("Payment simulation completed successfully!", {
          description: "This was a test run - no actual payment was processed."
        })
      } else {
        toast.success("Payment has been initiated successfully!")
      }
      
      router.refresh()
      form.reset()
    } catch (error) {
      console.error("Payment error:", error)
      toast.error(error.message || "Failed to process payment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Process Payment
          {watchDryRun && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <TestTube className="h-3 w-3" />
              Test Mode
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {watchDryRun 
            ? "Simulate a payment without actually processing it. Useful for testing."
            : "Process a payment for an employee."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payrollId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payroll</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payroll" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {payrolls.map((payroll) => (
                        <SelectItem key={payroll.id} value={payroll.id}>
                          {payroll.name} - {payroll.payDate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormDescription>Enter the payment amount in NGN.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Payment description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="dryRun"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <TestTube className="h-4 w-4" />
                        Dry Run Mode
                      </FormLabel>
                      <FormDescription>
                        Simulate the payment without actually processing it. Perfect for testing payment flows.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="processImmediately"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Process immediately
                      </FormLabel>
                      <FormDescription>
                        If checked, payment will be processed immediately via Paystack.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {watchDryRun ? "Simulating..." : "Processing..."}
            </>
          ) : (
            <>
              {watchDryRun ? <TestTube className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {watchDryRun ? "Simulate Payment" : "Process Payment"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
