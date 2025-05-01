import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"

async function fetchStudents({ page, limit, search, grade, hasDebt }) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(grade && { grade }),
    ...(hasDebt && { hasDebt: hasDebt.toString() })
  })

  const response = await fetch(`/api/students?${params}`)
  if (!response.ok) {
    throw new Error("Failed to fetch students")
  }
  return response.json()
}

export function useStudents({ page = 1, limit = 10, search = "", grade = "", hasDebt = false }) {
  return useQuery({
    queryKey: ["students", { page, limit, search, grade, hasDebt }],
    queryFn: () => fetchStudents({ page, limit, search, grade, hasDebt }),
    keepPreviousData: true
  })
}

export function useCreateStudent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create student')
      }
      
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    }
  })
} 