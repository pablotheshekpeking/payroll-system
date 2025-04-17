"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function usePayrolls() {
  return useQuery({
    queryKey: ["payrolls"],
    queryFn: async () => {
      const response = await fetch("/api/payroll")
      if (!response.ok) throw new Error("Failed to fetch payrolls")
      return response.json()
    }
  })
}

export function useCreatePayroll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payrollData) => {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payrollData)
      })
      if (!response.ok) throw new Error("Failed to create payroll")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["payrolls"])
      toast.success("Payroll created successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create payroll")
    }
  })
}

export function useProcessPayroll() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payrollId) => {
      const response = await fetch(`/api/payroll/${payrollId}/process`, {
        method: "POST"
      })
      if (!response.ok) throw new Error("Failed to process payroll")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["payrolls"])
      toast.success("Payroll processing initiated")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process payroll")
    }
  })
}

export function usePayrollDetails(payrollId) {
  return useQuery({
    queryKey: ["payroll", payrollId],
    queryFn: async () => {
      const response = await fetch(`/api/payroll/${payrollId}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch payroll details")
      }
      return response.json()
    },
    enabled: !!payrollId
  })
} 