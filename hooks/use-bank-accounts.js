"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useBanks() {
  return useQuery({
    queryKey: ["banks"],
    queryFn: async () => {
      const response = await fetch("/api/banks");
      if (!response.ok) throw new Error("Failed to fetch banks");
      return response.json();
    }
  });
}

export function useEmployeeBankAccount(employeeId) {
  return useQuery({
    queryKey: ["bankAccount", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}/bank-account`);
      if (!response.ok) throw new Error("Failed to fetch bank account");
      return response.json();
    }
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, accountData }) => {
      const response = await fetch(`/api/employees/${employeeId}/bank-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create bank account");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bankAccounts"]);
      toast.success("Bank account added successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add bank account");
    }
  });
} 