"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, CreditCard, Calendar, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { signOut } from "next-auth/react"
import NairaSign from "../ui/NairaSign"

export function Sidebar({ open, onClose }) {
  const pathname = usePathname()

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
      label: "Students",
      icon: Users,
      href: "/students",
      active: pathname === "/students",
    },
    {
      label: "Payroll",
      icon: CreditCard,
      href: "/payroll",
      active: pathname === "/payroll" || pathname === "/payroll/run",
    },
    {
      label: "Payments",
      icon: NairaSign,
      href: "/payments",
      active: pathname === "/payments",
    },
  ]

  const SidebarContent = (
    <div className="flex h-full flex-col">

      {/* Navigation Section */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => onClose()}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-muted/50",
                route.active ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Section */}
      <div className="mt-auto border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Log out</span>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent 
          side="left" 
          className="w-[280px] p-0"
        >
          {SidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-background md:block md:w-[280px]">
        {SidebarContent}
      </div>
    </>
  )
} 