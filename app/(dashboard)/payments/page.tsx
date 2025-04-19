import { PaymentsHeader } from "@/components/payments/payments-header"
import { RecentPayments } from "@/components/payments/recent-payments"
import { ProcessPayment } from "@/components/payments/process-payment"

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PaymentsHeader />
      <div className="grid gap-6 md:grid-cols-2">
        <ProcessPayment />
        <RecentPayments />
      </div>
    </div>
  )
}
