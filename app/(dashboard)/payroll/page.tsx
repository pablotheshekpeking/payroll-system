import { PayrollHeader } from "@/components/payroll/payroll-header"
import { PayrollSchedule } from "@/components/payroll/payroll-schedule"

export default function PayrollPage() {
  return (
    <div className="flex flex-col gap-6">
      <PayrollHeader />
      <PayrollSchedule />
    </div>
  )
}
