import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { RecentPayouts } from "@/components/payroll/recent-payouts"
import { UpcomingPayrolls } from "@/components/payroll/upcoming-payrolls"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader />
      <DashboardCards />
      <div className="grid gap-6 md:grid-cols-2">
        <RecentPayouts />
        <UpcomingPayrolls />
      </div>
    </div>
  )
}
