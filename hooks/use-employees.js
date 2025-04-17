"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function useEmployees() {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees")
      if (!response.ok) {
        throw new Error("Failed to fetch employees")
      }
      return response.json()
    },
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (employeeData) => {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      })
      if (!response.ok) {
        throw new Error("Failed to create employee")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries("employees")
      toast.success("Employee created successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create employee")
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (employeeId) => {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete employee")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries("employees")
      toast.success("Employee deleted successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete employee")
    },
  })
}

export function useEmployee(employeeId) {
  return useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      const response = await fetch(`/api/employees/${employeeId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch employee");
      }
      const data = await response.json();
      if (!data) {
        throw new Error("Employee not found");
      }
      return data;
    },
    enabled: !!employeeId,
    retry: false // Don't retry on error
  });
} 