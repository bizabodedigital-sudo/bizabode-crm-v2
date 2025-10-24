"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Key, DollarSign, Package, Bell } from "lucide-react"
import { useInventoryStore } from "@/lib/inventory-store"
import { useQuotesInvoicesStore } from "@/lib/quotes-invoices-store"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export function NotificationsPanel() {
  const { items } = useInventoryStore()
  const { invoices } = useQuotesInvoicesStore()
  const { company } = useAuth()

  // Calculate notifications
  const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel && item.quantity > 0)
  const outOfStockItems = items.filter(item => item.quantity === 0)
  const overdueInvoices = invoices.filter(inv => 
    inv.status === "sent" && 
    new Date(inv.dueDate) < new Date()
  )
  
  // Get license expiry from company data
  const licenseExpiryDate = company?.licenseExpiry ? new Date(company.licenseExpiry) : null
  const isLicenseExpiringSoon = licenseExpiryDate ? 
    (licenseExpiryDate.getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000) : false

  const notifications = [
    {
      id: "low-stock",
      type: "warning",
      title: "Low Stock Alert",
      message: `${lowStockItems.length} items are running low`,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/inventory?filter=low-stock"
    },
    {
      id: "out-of-stock",
      type: "critical",
      title: "Out of Stock",
      message: `${outOfStockItems.length} items are out of stock`,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      href: "/inventory?filter=out-of-stock"
    },
    {
      id: "overdue-invoices",
      type: "warning",
      title: "Overdue Invoices",
      message: `${overdueInvoices.length} invoices are overdue`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      href: "/crm/invoices?filter=overdue"
    },
    {
      id: "license-expiry",
      type: "info",
      title: "License Expiry",
      message: isLicenseExpiringSoon ? "License expires in 30 days" : "License is active",
      icon: Key,
      color: isLicenseExpiringSoon ? "text-red-600" : "text-green-600",
      bgColor: isLicenseExpiringSoon ? "bg-red-50" : "bg-green-50",
      href: "/license"
    }
  ]

  const criticalNotifications = notifications.filter(n => n.type === "critical")
  const warningNotifications = notifications.filter(n => n.type === "warning")
  const infoNotifications = notifications.filter(n => n.type === "info")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Important alerts and system notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical Notifications */}
        {criticalNotifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-600">Critical</h4>
            {criticalNotifications.map((notification) => {
              const Icon = notification.icon
              return (
                <Link key={notification.id} href={notification.href}>
                  <div className={`p-3 rounded-lg ${notification.bgColor} border border-red-200 hover:shadow-sm transition-all cursor-pointer`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${notification.color}`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-muted-foreground">{notification.message}</div>
                      </div>
                      <Badge variant="destructive" className="text-xs">!</Badge>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Warning Notifications */}
        {warningNotifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-orange-600">Warnings</h4>
            {warningNotifications.map((notification) => {
              const Icon = notification.icon
              return (
                <Link key={notification.id} href={notification.href}>
                  <div className={`p-3 rounded-lg ${notification.bgColor} border border-orange-200 hover:shadow-sm transition-all cursor-pointer`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${notification.color}`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-muted-foreground">{notification.message}</div>
                      </div>
                      <Badge variant="secondary" className="text-xs">!</Badge>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Info Notifications */}
        {infoNotifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-600">Info</h4>
            {infoNotifications.map((notification) => {
              const Icon = notification.icon
              return (
                <Link key={notification.id} href={notification.href}>
                  <div className={`p-3 rounded-lg ${notification.bgColor} border border-blue-200 hover:shadow-sm transition-all cursor-pointer`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${notification.color}`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-muted-foreground">{notification.message}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {notifications.length === 0 && (
          <div className="text-center py-6">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No notifications at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
