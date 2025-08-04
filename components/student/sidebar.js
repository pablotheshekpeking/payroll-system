import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home,
  GraduationCap,
  CreditCard,
  FileText,
  LogOut,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

export function Sidebar({ onClose }) {
  const pathname = usePathname()
  
  const links = [
    { href: "/studentdash", label: "Dashboard", icon: Home },
    //{ href: "/studentdash/enrollment", label: "Enrollment", icon: GraduationCap },
    { href: "/studentdash/fees", label: "Fees & Payments", icon: CreditCard },
    { href: "/studentdash/documents", label: "Documents", icon: FileText },
  ]

  return (
    <div className="h-full w-full bg-background flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden p-4 border-b bg-background/80 backdrop-blur-sm z-50">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg text-gray-900">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col h-full">
        <nav className="flex-1 p-4 bg-white">
          <div className="space-y-2">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || 
                (href !== "/studentdash" && pathname?.startsWith(href))
              
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium relative group",
                    isActive 
                      ? "bg-primary/10 text-primary hover:bg-primary/20" 
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary" : "text-gray-600 group-hover:text-gray-900"
                  )} />
                  <span className="font-medium">{label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
        
        {/* Mobile-only logout button */}
        <div className="p-4 border-t bg-gray-50/80 backdrop-blur-sm md:hidden">
          <Button 
            variant="ghost" 
            onClick={() => {
              onClose?.()
              signOut({ callbackUrl: "/login" })
            }}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50
              font-medium shadow-sm"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
} 