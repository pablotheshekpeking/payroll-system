import { EmployeeDetails } from "@/components/employees/employee-details";

export default function EmployeeDetailPage({ params }) {
  return <EmployeeDetails employeeId={params.id} />;
} 