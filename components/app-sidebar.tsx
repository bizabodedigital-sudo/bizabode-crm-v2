"use client"

import {
  LayoutDashboard,
  Package,
  Users,
  Target,
  FileText,
  Receipt,
  CreditCard,
  Truck,
  BarChart3,
  MessageSquare,
  Settings,
  Key,
  LogOut,
  ShoppingCart,
  Clock,
  Building,
  ShoppingBag,
  Activity,
  Tag,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getNavItemsForRole } from "@/lib/utils/role-permissions"
import { DynamicNavigation } from "@/components/navigation/dynamic-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Icon mapping for dynamic icons
const iconMap = {
  LayoutDashboard,
  Package,
  Users,
  Target,
  FileText,
  Receipt,
  CreditCard,
  Truck,
  BarChart3,
  MessageSquare,
  Settings,
  Key,
  ShoppingCart,
  Clock,
  Building,
  ShoppingBag,
  Activity,
  Tag,
  CheckCircle,
}

export function AppSidebar() {
  const pathname = usePathname()
  const { user, company, logout } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Get navigation items based on user role
  const { mainNavItems, crmNavItems, otherNavItems } = getNavItemsForRole(
    (user?.role as any) || 'viewer'
  )

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            BZ
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{company?.name}</span>
            <span className="text-xs text-muted-foreground">{company?.licensePlan}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <DynamicNavigation />
          </SidebarGroupContent>
        </SidebarGroup>

        {crmNavItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>CRM</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {crmNavItems.map((item) => {
                  const IconComponent = iconMap[item.icon as keyof typeof iconMap]
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <IconComponent className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {otherNavItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {otherNavItems.map((item) => {
                  const IconComponent = iconMap[item.icon as keyof typeof iconMap]
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
                        <Link href={item.href}>
                          <IconComponent className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Employee Portal Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Employee Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/employee" target="_blank">
                    <Clock className="h-4 w-4" />
                    <span>Clock In/Out System</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{user ? getInitials(user.name) : "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{user?.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="shrink-0">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
