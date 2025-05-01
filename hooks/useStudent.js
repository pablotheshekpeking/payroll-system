import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

async function fetchStudent(id) {
  const response = await fetch(`/api/students/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch student")
  }
  return response.json()
}

async function updateStudent({ id, data }) {
  const response = await fetch(`/api/students/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  
  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(result.error || "Failed to update student")
  }
  
  return result
}

async function assignFee({ id, data }) {
  const response = await fetch(`/api/students/${id}/fees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error("Failed to assign fee")
  }
  return response.json()
}

export function useStudent(id) {
  const queryClient = useQueryClient()

  const { data: student, isLoading, error } = useQuery({
    queryKey: ["student", id],
    queryFn: () => fetchStudent(id),
    enabled: !!id
  })

  const updateMutation = useMutation({
    mutationFn: updateStudent,
    onSuccess: () => {
      queryClient.invalidateQueries(["student", id])
    },
    onError: (error) => {
      // Handle error (show toast, etc.)
      console.error("Update failed:", error)
    }
  })

  const assignFeeMutation = useMutation({
    mutationFn: assignFee,
    onSuccess: () => {
      queryClient.invalidateQueries(["student", id])
    }
  })

  const downloadDocument = async (documentUrl) => {
    try {
      const response = await fetch(documentUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = documentUrl.split('/').pop()
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to download document:", error)
      throw new Error("Failed to download document")
    }
  }

  return {
    student,
    isLoading,
    error,
    updateStudent: (data) => updateMutation.mutate({ id, data }),
    assignFee: (data) => assignFeeMutation.mutate({ id, data }),
    downloadDocument,
    isUpdating: updateMutation.isLoading,
    isAssigningFee: assignFeeMutation.isLoading,
    updateError: updateMutation.error,
    assignFeeError: assignFeeMutation.error
  }
} 