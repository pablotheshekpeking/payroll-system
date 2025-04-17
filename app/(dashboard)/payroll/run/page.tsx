import { PayrollRunHeader } from "@/components/payroll/payroll-run-header"
import { PayrollRunForm } from "@/components/payroll/payroll-run-form"

export default function PayrollRunPage() {
  return (
    <div className="flex flex-col gap-6">
      <PayrollRunHeader />
      <PayrollRunForm />
    </div>
  )
}
