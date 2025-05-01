import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

export function useAllFees() {
  const { data: session } = useSession()
  const isStudent = session?.user?.role === "STUDENT"

  return useQuery({
    queryKey: ['fees', isStudent ? 'student' : 'admin'],
    queryFn: async () => {
      // For students, fetch their assigned fees
      if (isStudent) {
        const response = await fetch('/api/fees/student')
        if (!response.ok) {
          throw new Error('Failed to fetch student fees')
        }
        return response.json()
      }
      
      // For admin, fetch all fees
      const response = await fetch('/api/fees')
      if (!response.ok) {
        throw new Error('Failed to fetch fees')
      }
      return response.json()
    },
    enabled: !!session
  })
}

export function useStudentFees(studentId) {
  return useQuery({
    queryKey: ['studentFees', studentId],
    queryFn: async () => {
      const response = await fetch(`/api/students/${studentId}/fees`)
      if (!response.ok) {
        throw new Error('Failed to fetch student fees')
      }
      return response.json()
    },
    enabled: !!studentId
  })
}

export function useAssignFees(studentId) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`/api/students/${studentId}/fees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to assign fees')
      }
      
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentFees', studentId] })
      queryClient.invalidateQueries({ queryKey: ['student', studentId] })
    }
  })
} 