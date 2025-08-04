"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useEmployees } from "@/hooks/use-employees"
import { useCreatePayroll } from "@/hooks/use-payroll"
import { Spinner } from "@/components/ui/spinner"

const payrollTypes = [
  { label: "Regular Payroll", value: "regular" },
  { label: "Bonus", value: "bonus" },
  { label: "Commission", value: "commission" },
  { label: "Reimbursement", value: "reimbursement" },
]

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  type: z.string({
    required_error: "Please select a payroll type.",
  }),
  payDate: z.date({
    required_error: "Pay date is required.",
  }),
  periodStart: z.date({
    required_error: "Period start date is required.",
  }),
  periodEnd: z.date({
    required_error: "Period end date is required.",
  }),
  processImmediately: z.boolean().default(false),
})

export function PayrollRunForm() {
  const { data: employees = [], isLoading: employeesLoading } = useEmployees()
  const createPayroll = useCreatePayroll()
  const [selectedEmployees, setSelectedEmployees] = useState([])
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "regular",
      processImmediately: false,
    },
  })

  async function onSubmit(values) {
    if (selectedEmployees.length === 0) {
      toast({
        title: "No employees selected",
        description: "Please select at least one employee for this payroll run.",
        variant: "destructive",
      })
      return
    }

    try {
      await createPayroll.mutateAsync({
        ...values,
        employeeIds: selectedEmployees,
      })
      router.push("/payroll")
    } catch (error) {
      console.error("Payroll creation failed:", error)
    }
  }

  const toggleEmployee = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
    )
  }

  const selectAllEmployees = () => {
    setSelectedEmployees(
      selectedEmployees.length === employees.length
        ? []
        : employees.map((emp) => emp.id)
    )
  }

  const totalAmount = employees
    .filter((emp) => selectedEmployees.includes(emp.id))
    .reduce((sum, emp) => sum + emp.salary / 12, 0)

  if (employeesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Payroll Details</CardTitle>
              <CardDescription>Enter the details for this payroll run.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payroll Name</FormLabel>
                      <FormControl>
                        <Input placeholder="May 2025 Payroll" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payroll Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a payroll type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {payrollTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="payDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pay Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="periodStart"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Period Start</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="periodEnd"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Period End</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Select Employees</CardTitle>
              <CardDescription>Select the employees to include in this payroll run.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={selectAllEmployees}
                >
                  {selectedEmployees.length === employees.length ? "Deselect All" : "Select All"}
                </Button>
                <div className="text-sm text-muted-foreground">
                  {selectedEmployees.length} of {employees.length} selected
                </div>
              </div>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div 
                    key={employee.id} 
                    className="flex items-center justify-between rounded-md border p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        id={`employee-${employee.id}`}
                        checked={selectedEmployees.includes(employee.id)}
                        onCheckedChange={() => toggleEmployee(employee.id)}
                      />
                      <div>
                        <label 
                          htmlFor={`employee-${employee.id}`} 
                          className="font-medium"
                        >
                          {employee.name}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {employee.position}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ₦{(employee.salary / 12).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Monthly
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment Options</CardTitle>
              <CardDescription>Configure how this payroll will be processed.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="processImmediately"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Process immediately</FormLabel>
                      <FormDescription>
                        If checked, payments will be processed as soon as the payroll is created. 
                        Otherwise, they will be scheduled for the pay date.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-4">
              <div>
                <p className="text-sm font-medium">Total Amount</p>
                <p className="text-2xl font-bold">₦{totalAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedEmployees.length} employees
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPayroll.isPending}
                >
                  {createPayroll.isPending ? "Processing..." : "Create Payroll"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  )
}
