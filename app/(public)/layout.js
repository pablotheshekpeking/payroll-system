import { EdgeStoreProvider } from "@/lib/edgestore"

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <EdgeStoreProvider>
          {children}
        </EdgeStoreProvider>
      </div>
    </div>
  )
} 