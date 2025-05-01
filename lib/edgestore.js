"use client"

import { createEdgeStoreProvider } from "@edgestore/react"

const { EdgeStoreProvider, useEdgeStore } = createEdgeStoreProvider({
  maxConcurrentUploads: 3,
  // Add default error handling
  onUploadError: (error) => {
    console.error("Upload error:", error)
  },
  // Add default progress handling
  onUploadProgress: (progress) => {
    console.log("Upload progress:", progress)
  }
})

export { EdgeStoreProvider, useEdgeStore } 