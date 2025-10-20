"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useQuotesInvoicesStore } from "@/lib/quotes-invoices-store"
import { DollarSign, TrendingUp } from "lucide-react"

export function RevenueOverTimeChart() {
  const { invoices } = useQuotesInvoicesStore()

  // Generate revenue data for the last 6 months
  const generateRevenueData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    const currentDate = new Date()
    
    return months.map((month, index) => {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1)
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt)
        return invDate.getMonth() === monthDate.getMonth() && 
               invDate.getFullYear() === monthDate.getFullYear() &&
               inv.status === "paid"
      })
      
      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0)
      const previousMonth = index > 0 ? 
        months.map((m, i) => {
          const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1)
          const prevInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.createdAt)
            return invDate.getMonth() === prevDate.getMonth() && 
                   invDate.getFullYear() === prevDate.getFullYear() &&
                   inv.status === "paid"
          })
          return prevInvoices.reduce((sum, inv) => sum + inv.total, 0)
        })[index - 1] : 0
      
      const growth = previousMonth > 0 ? ((revenue - previousMonth) / previousMonth) * 100 : 0
      
      return {
        month,
        revenue: Math.round(revenue),
        growth: Math.round(growth)
      }
    })
  }

  const revenueData = generateRevenueData()
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const averageGrowth = revenueData.length > 1 ? 
    revenueData.slice(1).reduce((sum, item) => sum + item.growth, 0) / (revenueData.length - 1) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenue Over Time
        </CardTitle>
        <CardDescription>
          Monthly revenue trends and growth
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Total Revenue</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">${totalRevenue.toLocaleString()}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Avg Growth</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {averageGrowth >= 0 ? '+' : ''}{averageGrowth.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `$${value.toLocaleString()}` : `${value}%`,
                    name === 'revenue' ? 'Revenue' : 'Growth'
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="growth" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
                  name="Growth %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
