import { createEdgeStore } from "@edgestore/server"
import { z } from "zod"

const es = createEdgeStore()

const edgeStoreRouter = es.router({
  studentDocuments: es
    .fileBucket()
    .input(
      z.object({
        type: z.enum(["passport", "transcript", "birthCertificate"])
      })
    )
    .path(({ input }) => [{ type: input.type }])
    .beforeUpload(({ ctx, input, file }) => {
      // Add file type validation
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error("File too large. Maximum size is 5MB")
      }
      return true
    })
})

export { edgeStoreRouter } 