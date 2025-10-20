"use client"

import { AuthGuard } from "@/components/auth-guard"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function HRLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background">
          <AppSidebar />
          <main className="flex-1 overflow-auto p-6 lg:p-8 w-full">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
