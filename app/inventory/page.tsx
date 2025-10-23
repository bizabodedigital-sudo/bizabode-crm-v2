"use client"

import { useState } from "react"
import { ItemTable } from "@/components/inventory/item-table"
import { InventoryStats } from "@/components/inventory/inventory-stats"
import { AnalyticsSection } from "@/components/inventory/analytics-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, BarChart3 } from "lucide-react"

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Manage your inventory items and stock levels</p>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          <InventoryStats />
          <ItemTable />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
