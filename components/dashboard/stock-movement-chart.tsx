"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useInventoryStore } from "@/lib/inventory-store"
import { Package, TrendingUp, TrendingDown } from "lucide-react"

export function StockMovementChart() {
  const { items } = useInventoryStore()

  // Mock data for stock movements (in real app, this would come from stock movements API)
  const stockMovements = [
    { month: "Jan", stockIn: 150, stockOut: 120 },
    { month: "Feb", stockIn: 180, stockOut: 140 },
    { month: "Mar", stockIn: 200, stockOut: 160 },
    { month: "Apr", stockIn: 170, stockOut: 180 },
    { month: "May", stockIn: 190, stockOut: 170 },
    { month: "Jun", stockIn: 220, stockOut: 190 },
  ]

  const totalStockIn = stockMovements.reduce((sum, item) => sum + item.stockIn, 0)
  const totalStockOut = stockMovements.reduce((sum, item) => sum + item.stockOut, 0)
  const netMovement = totalStockIn - totalStockOut

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Stock Movement
        </CardTitle>
        <CardDescription>
          Stock in vs stock out over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Stock In</span>
              </div>
              <div className="text-2xl font-bold text-green-700">{totalStockIn.toLocaleString()}</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">Stock Out</span>
              </div>
              <div className="text-2xl font-bold text-red-700">{totalStockOut.toLocaleString()}</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${netMovement >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`flex items-center justify-center gap-1 mb-1 ${netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netMovement >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-sm font-medium">Net</span>
              </div>
              <div className={`text-2xl font-bold ${netMovement >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {netMovement >= 0 ? '+' : ''}{netMovement.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockMovements}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value.toLocaleString(), name === 'stockIn' ? 'Stock In' : 'Stock Out']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar dataKey="stockIn" fill="#10b981" name="Stock In" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stockOut" fill="#ef4444" name="Stock Out" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
