"use client"

import { useEffect, useState } from "react"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { SalesFunnelChart } from "@/components/dashboard/sales-funnel-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { StockAlerts } from "@/components/dashboard/stock-alerts"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { NotificationsPanel } from "@/components/dashboard/notifications-panel"
import { StockMovementChart } from "@/components/dashboard/stock-movement-chart"
import { RevenueOverTimeChart } from "@/components/dashboard/revenue-over-time-chart"
import { AdminPanel } from "@/components/dashboard/admin-panel"
import { DollarSign, TrendingUp, Package, Users, ShoppingCart, FileText, AlertTriangle } from "lucide-react"
import { useInventoryStore } from "@/lib/inventory-store"
import { useCRMStore } from "@/lib/crm-store"
import { useQuotesInvoicesStore } from "@/lib/quotes-invoices-store"
import { useAuth } from "@/lib/auth-context"
import { hasPermission } from "@/lib/utils/role-permissions"

export default function DashboardPage() {
  const { items, fetchItems } = useInventoryStore()
  const { leads, opportunities, fetchLeads, fetchOpportunities } = useCRMStore()
  const { invoices, quotes, fetchInvoices, fetchQuotes } = useQuotesInvoicesStore()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // Only fetch data if user is authenticated and auth is not loading
      if (isAuthenticated && !authLoading && user) {
        try {
          await Promise.all([
            fetchItems(),
            fetchLeads(),
            fetchOpportunities(),
            fetchInvoices(),
            fetchQuotes(),
          ])
        } catch (error) {
          console.error("Failed to load dashboard data:", error)
        }
        setIsLoading(false)
      }
    }
    loadData()
  }, [isAuthenticated, authLoading, user])

  // Calculate real metrics
  const totalRevenue = invoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0)
  
  const activeOpportunities = opportunities.filter(
    opp => opp.stage !== "closed-won" && opp.stage !== "closed-lost"
  ).length

  const inventoryCount = items.length
  const activeLeads = leads.filter(lead => lead.status !== "unqualified").length
  
  // Additional metrics
  const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel && item.quantity > 0).length
  const outOfStockItems = items.filter(item => item.quantity === 0).length
  const activeQuotes = quotes.filter(quote => quote.status === "sent" || quote.status === "draft").length
  const pendingInvoices = invoices.filter(inv => inv.status === "pending" || inv.status === "draft").length
  const monthlyRevenue = invoices
    .filter(inv => {
      const invDate = new Date(inv.createdAt)
      const currentDate = new Date()
      return invDate.getMonth() === currentDate.getMonth() && 
             invDate.getFullYear() === currentDate.getFullYear() &&
             inv.status === "paid"
    })
    .reduce((sum, inv) => sum + inv.total, 0)

  // Role-based permissions
  const userRole = (user?.role as any) || 'viewer'
  const canViewInventory = hasPermission(userRole, 'canManageInventory')
  const canViewCRM = hasPermission(userRole, 'canManageCRM')
  const canViewReports = hasPermission(userRole, 'canViewReports')
  const isAdmin = hasPermission(userRole, 'canManageCompany')

  // Show loading state while authentication is in progress
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {canViewInventory && (
          <KpiCard 
            title="Total Stock Items" 
            value={isLoading ? "..." : inventoryCount.toString()} 
            icon={Package}
            description={`${lowStockItems} low stock, ${outOfStockItems} out of stock`}
          />
        )}
        {canViewInventory && (
          <KpiCard 
            title="Low Stock Alerts" 
            value={isLoading ? "..." : lowStockItems.toString()} 
            icon={AlertTriangle}
            description="Items below reorder level"
          />
        )}
        {canViewCRM && (
          <KpiCard 
            title="Active Quotes" 
            value={isLoading ? "..." : activeQuotes.toString()} 
            icon={FileText}
            description="Pending customer quotes"
          />
        )}
        {canViewCRM && (
          <KpiCard 
            title="Pending Invoices" 
            value={isLoading ? "..." : pendingInvoices.toString()} 
            icon={DollarSign}
            description="Unpaid invoices"
          />
        )}
        {canViewCRM && (
          <KpiCard 
            title="Monthly Revenue" 
            value={isLoading ? "..." : `$${monthlyRevenue.toLocaleString()}`} 
            icon={TrendingUp}
            description="This month's revenue"
          />
        )}
        {canViewCRM && (
          <KpiCard 
            title="Active Opportunities" 
            value={isLoading ? "..." : activeOpportunities.toString()} 
            icon={Users}
            description="In sales pipeline"
          />
        )}
      </div>

      {/* Charts Section */}
      {canViewReports && (
        <div className="grid gap-6 lg:grid-cols-2">
          {canViewInventory && <StockMovementChart />}
          {canViewCRM && <RevenueOverTimeChart />}
        </div>
      )}

      {/* Sales Funnel and Revenue Charts */}
      {canViewReports && canViewCRM && (
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesFunnelChart />
        <RevenueChart />
      </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
        <ActivityFeed />
          {canViewInventory && <StockAlerts />}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <QuickActions />
          <NotificationsPanel />
          {isAdmin && <AdminPanel />}
        </div>
      </div>
    </div>
  )
}
