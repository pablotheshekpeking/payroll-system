import { EdgeStoreProvider } from "@/lib/edgestore"
import { Toaster } from "sonner"
import { headers } from 'next/headers'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create a client
const queryClient = new QueryClient()

export default function RootLayout({ children }) {
  // Check for logout header
  const headersList = headers()
  const isLoggingOut = headersList.get('x-logout')

  if (isLoggingOut) {
    // Clear any server-side session data if needed
  }

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <EdgeStoreProvider>
            {children}
            <Toaster />
          </EdgeStoreProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
} 