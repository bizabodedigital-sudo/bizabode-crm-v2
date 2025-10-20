"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, Receipt, FileText, ShoppingCart, DollarSign } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { hasPermission } from "@/lib/utils/role-permissions"

export function QuickActions() {
  const { user } = useAuth()
  const userRole = (user?.role as any) || 'viewer'
  
  const canManageInventory = hasPermission(userRole, 'canManageInventory')
  const canManageCRM = hasPermission(userRole, 'canManageCRM')
  const canManagePurchaseOrders = hasPermission(userRole, 'canManagePurchaseOrders')

  const actions = [
    {
      title: "Add Item",
      description: "Add new inventory item",
      icon: Plus,
      href: "/inventory?action=add",
      color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
      iconColor: "text-blue-600",
      enabled: canManageInventory
    },
    {
      title: "Receive Stock",
      description: "Record stock receipt",
      icon: Package,
      href: "/inventory?action=receive",
      color: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
      iconColor: "text-green-600",
      enabled: canManageInventory
    },
    {
      title: "New Purchase Order",
      description: "Create purchase order",
      icon: ShoppingCart,
      href: "/procurement?action=new",
      color: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20",
      iconColor: "text-purple-600",
      enabled: canManagePurchaseOrders
    },
    {
      title: "Create Invoice",
      description: "Generate new invoice",
      icon: FileText,
      href: "/crm/invoices?action=new",
      color: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20",
      iconColor: "text-orange-600",
      enabled: canManageCRM
    },
    {
      title: "New Quote",
      description: "Create sales quote",
      icon: Receipt,
      href: "/crm/quotes?action=new",
      color: "bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20",
      iconColor: "text-cyan-600",
      enabled: canManageCRM
    },
    {
      title: "Record Payment",
      description: "Process payment",
      icon: DollarSign,
      href: "/crm/payments?action=new",
      color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
      iconColor: "text-emerald-600",
      enabled: canManageCRM
    }
  ]

  const enabledActions = actions.filter(action => action.enabled)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common tasks to get things done quickly
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
