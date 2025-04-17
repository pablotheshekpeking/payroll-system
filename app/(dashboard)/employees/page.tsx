import { EmployeeHeader } from "@/components/employees/employee-header"
import { EmployeeList } from "@/components/employees/employee-list"

export default function EmployeesPage() {
  return (
    <div className="flex flex-col gap-6">
      <EmployeeHeader />
      <EmployeeList />
    </div>
  )
}
