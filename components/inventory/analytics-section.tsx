"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, TrendingUp, Package, AlertTriangle, DollarSign, BarChart3 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface AnalyticsData {
  overview: {
    totalItems: number
    totalValue: number
    averageItemValue: number
    averageQuantity: number
  }
  stockLevels: {
    outOfStock: number
    lowStock: number
    inStock: number
    critical: number
  }
  categoryBreakdown: Record<string, {
    count: number
    totalValue: number
    items: Array<{
      sku: string
      name: string
      quantity: number
      unitPrice: number
    }>
  }>
  topItemsByValue: Array<{
    sku: string
    name: string
    category: string
    quantity: number
    unitPrice: number
    totalValue: number
  }>
  movementTypes: Record<string, {
    count: number
    totalQuantity: number
  }>
  recentMovements: Array<{
    id: string
    itemSku: string
    itemName: string
    movementType: string
    quantityChange: number
    reason: string
    performedByName: string
    createdAt: string
  }>
  lowStockItems: Array<{
    id: string
    sku: string
    name: string
    category: string
    currentQuantity: number
    reorderLevel: number
    unitPrice: number
    critical: boolean
  }>
  outOfStockItems: Array<{
    id: string
    sku: string
    name: string
    category: string
    reorderLevel: number
    unitPrice: number
    critical: boolean
  }>
}

export function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { company } = useAuth()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('bizabode_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      if (!company?.id) {
        console.error('Company ID is missing')
        return
      }

      const response = await fetch(`/api/inventory/analytics?companyId=${company.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalytics(data.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>Failed to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Items in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.overview.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.overview.averageItemValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Per item average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Levels</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.stockLevels.inStock}</div>
            <p className="text-xs text-muted-foreground">
              In stock items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Level Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Level Distribution</CardTitle>
            <CardDescription>Current inventory status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Out of Stock</span>
                </div>
                <Badge variant="destructive">{analytics.stockLevels.outOfStock}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Low Stock</span>
                </div>
                <Badge variant="secondary">{analytics.stockLevels.lowStock}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">In Stock</span>
                </div>
                <Badge variant="default">{analytics.stockLevels.inStock}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">Critical</span>
                </div>
                <Badge variant="outline">{analytics.stockLevels.critical}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Items and value by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.categoryBreakdown).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{category}</p>
                    <p className="text-sm text-muted-foreground">{data.count} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${data.totalValue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total value</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Items by Value */}
      <Card>
        <CardHeader>
          <CardTitle>Top Items by Value</CardTitle>
          <CardDescription>Most valuable items in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.topItemsByValue.slice(0, 10).map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{item.sku}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="font-mono">{item.quantity}</TableCell>
                  <TableCell className="font-mono">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="font-mono font-medium">${item.totalValue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Low Stock & Out of Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Low Stock Items</CardTitle>
            <CardDescription>Items that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.lowStockItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No low stock items</p>
            ) : (
              <div className="space-y-2">
                {analytics.lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">{item.currentQuantity}/{item.reorderLevel}</p>
                      {item.critical && <Badge variant="destructive" className="text-xs">Critical</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Out of Stock Items</CardTitle>
            <CardDescription>Items that need immediate restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.outOfStockItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No out of stock items</p>
            ) : (
              <div className="space-y-2">
                {analytics.outOfStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{item.sku}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">Out of Stock</Badge>
                      {item.critical && <Badge variant="destructive" className="text-xs ml-1">Critical</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Movement Types */}
      {Object.keys(analytics.movementTypes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Movement Types</CardTitle>
            <CardDescription>Recent inventory movement activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analytics.movementTypes).map(([type, data]) => (
                <div key={type} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{data.count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{type}</div>
                  <div className="text-xs text-muted-foreground">{data.totalQuantity} units</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
