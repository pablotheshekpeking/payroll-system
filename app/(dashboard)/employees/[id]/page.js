import { EmployeeDetails } from "@/components/employees/employee-details";

export default async function EmployeeDetailPage({ params }) {
  const { id } = await params;
  return <EmployeeDetails employeeId={id} />;
} 