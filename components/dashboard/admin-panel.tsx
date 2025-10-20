"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Key, Settings, Users, Shield, Database } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { hasPermission } from "@/lib/utils/role-permissions"
import Link from "next/link"

export function AdminPanel() {
  const { user, company } = useAuth()
  const userRole = (user?.role as any) || 'viewer'
  
  const isAdmin = hasPermission(userRole, 'canManageSettings')
  const canViewReports = hasPermission(userRole, 'canViewReports')
  const canManageLicense = hasPermission(userRole, 'canManageLicense')
  const canManageUsers = hasPermission(userRole, 'canManageUsers')

  if (!isAdmin) {
    return null
  }

  const adminActions = [
    {
      title: "View All Reports",
      description: "Comprehensive analytics and insights",
      icon: BarChart3,
      href: "/crm/reports",
      color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
      iconColor: "text-blue-600",
      enabled: canViewReports
    },
    {
      title: "Manage License",
      description: "License settings and upgrades",
      icon: Key,
      href: "/license",
      color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20",
      iconColor: "text-purple-600",
      enabled: canManageLicense
    },
    {
      title: "User Management",
      description: "Manage team members and permissions",
      icon: Users,
      href: "/settings/users",
      color: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
      iconColor: "text-green-600",
      enabled: canManageUsers
    },
    {
      title: "System Settings",
      description: "Configure system preferences",
      icon: Settings,
      href: "/settings",
      color: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20",
      iconColor: "text-gray-600",
      enabled: true
    }
  ]

  const enabledActions = adminActions.filter(action => action.enabled)

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Admin Panel
        </CardTitle>
        <CardDescription>
          Administrative tools and system management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* License Status */}
          <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">License Status</div>
                <div className="text-sm text-muted-foreground">
                  {company?.licensePlan || "Standard"} Plan
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Active
            </Badge>
          </div>

          {/* Admin Actions */}
          <div className="grid grid-cols-2 gap-3">
            {enabledActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.title} href={action.href}>
                  <Button
                    variant="ghost"
                    className={`w-full h-auto p-4 flex flex-col items-center gap-2 ${action.color} border-0 hover:shadow-md transition-all`}
                  >
                    <Icon className={`h-6 w-6 ${action.iconColor}`} />
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* System Info */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>System Status: Online</span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                Healthy
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
