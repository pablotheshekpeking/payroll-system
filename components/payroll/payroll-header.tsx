import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export function PayrollHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
        <p className="text-sm text-muted-foreground">Manage your company's payroll schedules and payments.</p>
      </div>
      <Button asChild>
        <Link href="/payroll/run">
          <PlusCircle className="mr-2 h-4 w-4" />
          Run Payroll
        </Link>
      </Button>
    </div>
  )
}
