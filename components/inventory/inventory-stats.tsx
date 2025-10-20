"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react"
import { useInventoryStore } from "@/lib/inventory-store"

export function InventoryStats() {
  const { items } = useInventoryStore()

  const totalItems = items.length
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const lowStockItems = items.filter((item) => item.quantity <= item.reorderLevel).length
  const outOfStockItems = items.filter((item) => item.quantity === 0).length

  const stats = [
    {
      title: "Total Items",
      value: totalItems,
      icon: Package,
      description: "Unique products",
    },
    {
      title: "Total Value",
      value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: "Inventory worth",
    },
    {
      title: "Low Stock",
      value: lowStockItems,
      icon: AlertTriangle,
      description: "Items need reorder",
    },
    {
      title: "Out of Stock",
      value: outOfStockItems,
      icon: TrendingUp,
      description: "Items unavailable",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
