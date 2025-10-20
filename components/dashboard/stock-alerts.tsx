"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useInventoryStore } from "@/lib/inventory-store"
import Link from "next/link"

export function StockAlerts() {
  const { items } = useInventoryStore()
  
  // Get items below or at reorder level
  const lowStockItems = items
    .filter(item => item.quantity <= item.reorderLevel)
    .map(item => ({
      ...item,
      status: item.quantity === 0 ? "critical" : (item.quantity < item.reorderLevel * 0.5 ? "critical" : "warning")
    }))
    .slice(0, 10) // Show top 10

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Stock Alerts</CardTitle>
            <CardDescription>Items below reorder level</CardDescription>
          </div>
          <Link href="/inventory">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          {lowStockItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">All items are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={(item as any)._id || item.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all hover:shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${item.status === "critical" ? "bg-destructive/10" : "bg-orange-500/10"}`}
                    >
                      <AlertTriangle
                        className={`h-5 w-5 ${item.status === "critical" ? "text-destructive" : "text-orange-500"}`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {item.sku}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge
                      variant={item.status === "critical" ? "destructive" : "secondary"}
                      className="font-mono font-semibold"
                    >
                      {item.quantity} / {item.reorderLevel}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {Math.max(0, item.reorderLevel - item.quantity)} needed
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
