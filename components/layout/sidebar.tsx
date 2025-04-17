"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CreditCard, Calendar, Settings, X, DollarSign, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { signOut } from "next-auth/react"
interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  const logOut = () => {
    signOut()
  }

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Employees",
      icon: Users,
      href: "/employees",
      active: pathname === "/employees",
    },
    {
      label: "Payroll",
      icon: CreditCard,
      href: "/payroll",
      active: pathname === "/payroll" || pathname === "/payroll/run",
    },
    {
      label: "Payments",
      icon: DollarSign,
      href: "/payments",
      active: pathname === "/payments",
    },
    {
      label: "Schedule",
      icon: Calendar,
      href: "/schedule",
      active: pathname === "/schedule",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  const SidebarContent = (
    <div className="flex h-full flex-col gap-2 py-4">
      <div className="flex items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-primary-foreground"
            >
              <path d="M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z" />
              <path d="M12 10v4" />
              <path d="M9 10v4" />
              <path d="M15 10v4" />
              <path d="M5 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <span className="font-bold">Payroll System</span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {routes.map((route) => (
            <>
            <Link
              key={route.href}
              href={route.href}
              onClick={() => onClose()}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <route.icon className="h-5 w-5" />
              {route.label}
            </Link>
            {route.label === "Settings" && (
              <Button variant="ghost" size="icon" onClick={logOut} className="w-full justify-start py-2 px-3">
                <LogOut className="h-5 w-5" /> Logout
              </Button>
            )}
            </>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          {SidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden w-64 shrink-0 border-r bg-background md:block">{SidebarContent}</div>
    </>
  )
}
