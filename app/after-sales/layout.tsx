import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

export default function AfterSalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
              <div className="flex h-14 items-center px-4 lg:px-6">
                <SidebarTrigger />
              </div>
            </div>
            <div className="flex-1 p-6 lg:p-8 w-full">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </AuthGuard>
  )
}

