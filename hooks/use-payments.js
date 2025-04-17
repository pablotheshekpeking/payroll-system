"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useInitiatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, amount, description }) => {
      const response = await fetch(`/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, amount, description }),
      });
      if (!response.ok) throw new Error("Failed to initiate payment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["payments"]);
      toast.success("Payment initiated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to initiate payment");
    }
  });
}

export function useEmployeePayments(employeeId) {
  return useQuery({
    queryKey: ["payments", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}/payments`);
      if (!response.ok) throw new Error("Failed to fetch payments");
      return response.json();
    }
  });
}

export function usePaymentsData() {
  return useQuery({
    queryKey: ["payrolls"],
    queryFn: async () => {
      const response = await fetch("/api/payments");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch payrolls data");
      }
      const payrolls = await response.json();
      
      // Transform the data to match the expected format in components
      return {
        payments: payrolls.flatMap(payroll => 
          (payroll.payments || []).map(payment => ({
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            processedAt: payment.processedAt,
            createdAt: payment.createdAt,
            employeeId: payment.employeeId,
            employeeName: payment.employeeName || 'N/A',
            payrollName: payroll.name,
            employeeCount: payroll.employeeCount,
            employee: {
                id: payment.employee.id,
                name: payment.employee.name,
                position: payment.employee.position,
                department: payment.employee.department,
                email: payment.employee.email,
                phone: payment.employee.phone,
                address: payment.employee.address,
            }
          }))
        )
      };
    }
  });
} 