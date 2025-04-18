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
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [toast])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      processImmediately: true,
      description: "",
    },
  })

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

      toast.success("The payment has been initiated successfully.")
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
        <CardTitle>Process Payment</CardTitle>
        <CardDescription>Process a payment for an employee.</CardDescription>
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
                  <FormDescription>Enter the payment amount in USD.</FormDescription>
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

            <FormField
              control={form.control}
              name="processImmediately"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Process immediately</FormLabel>
                    <FormDescription>If checked, payment will be processed immediately via Stripe.</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading ? "Processing..." : "Process Payment"}
        </Button>
      </CardFooter>
    </Card>
  )
}
