import { EdgeStoreProvider } from "@/lib/edgestore"
import { ThemeProvider } from "@/components/theme-provider"

export default function PublicLayout({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen">
        <EdgeStoreProvider>
          {children}
        </EdgeStoreProvider>
      </div>
    </ThemeProvider>
  )
} 