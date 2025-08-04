"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"

export function useStudentDocuments() {
  const { data: session } = useSession()
  
  return useQuery({
    queryKey: ['studentDocuments', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('No user session')
      }
      
      const response = await fetch(`/api/students/${session.user.id}/docs`)
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      return response.json()
    },
    enabled: !!session?.user?.id
  })
} 