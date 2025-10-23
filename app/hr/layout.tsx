"use client"

import { AuthGuard } from "@/components/auth-guard"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Clock, DollarSign, FileText, CheckCircle, Calendar } from "lucide-react"

export default function HRLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const hrNavItems = [
    { title: "Dashboard", href: "/hr", icon: Users },
    { title: "Employees", href: "/hr/employees", icon: Users },
    { title: "Attendance", href: "/hr/attendance", icon: Clock },
    { title: "Attendance Summary", href: "/hr/attendance-summary", icon: Calendar },
    { title: "Leave Requests", href: "/hr/leaves", icon: FileText },
    { title: "Leave Approvals", href: "/hr/leave-approvals", icon: CheckCircle },
    { title: "Payroll", href: "/hr/payroll", icon: DollarSign },
  ]

  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            {/* HR Sub Navigation */}
            <div className="border-b bg-background">
              <div className="flex items-center space-x-2 p-4">
                {hrNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Button
                      key={item.href}
                      variant={pathname === item.href ? "default" : "ghost"}
                      size="sm"
                      asChild
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4 mr-2" />
                        {item.title}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </div>
            <main className="flex-1 overflow-auto p-6 lg:p-8 w-full">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
