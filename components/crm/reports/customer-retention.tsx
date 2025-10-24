"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Users, Repeat, DollarSign, Calendar, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api-client-config'
import Loading from '@/components/shared/Loading'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'

interface RetentionMetrics {
  repeatOrderRate: number
  customerLifetimeValue: number
  churnRate: number
  averageOrderFrequency: number
  totalCustomers: number
  activeCustomers: number
  newCustomers: number
}

interface CustomerSegment {
  segment: string
  count: number
  revenue: number
  averageOrderValue: number
  orderFrequency: number
  churnRate: number
}

interface InactiveCustomer {
  customerId: string
  customerName: string
  lastOrderDate: string
  daysSinceLastOrder: number
  totalOrders: number
  totalRevenue: number
  assignedTo: string
}

interface RetentionTrend {
  month: string
  newCustomers: number
  retainedCustomers: number
  churnedCustomers: number
  retentionRate: number
}

export function CustomerRetentionDashboard() {
  const { company } = useAuth()
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState('90d')
  const [isLoading, setIsLoading] = useState(true)
  const [retentionMetrics, setRetentionMetrics] = useState<RetentionMetrics | null>(null)
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([])
  const [inactiveCustomers, setInactiveCustomers] = useState<InactiveCustomer[]>([])
  const [retentionTrends, setRetentionTrends] = useState<RetentionTrend[]>([])

  useEffect(() => {
    if (company?.id) {
      fetchRetentionData()
    }
  }, [company?.id, timeRange])

  const fetchRetentionData = async () => {
    try {
      setIsLoading(true)
      
      const response = await api.get('/api/crm/reports/retention', {
        companyId: company?.id,
        timeRange
      })
      
      if (response.success) {
        setRetentionMetrics(response.data.retentionMetrics)
        setCustomerSegments(response.data.customerSegments || [])
        setInactiveCustomers(response.data.inactiveCustomers || [])
        setRetentionTrends(response.data.retentionTrends || [])
      }
    } catch (error) {
      console.error('Failed to fetch retention data:', error)
      toast({
        title: "Error",
        description: "Failed to load customer retention data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getChurnColor = (rate: number) => {
    if (rate <= 5) return 'text-green-600'
    if (rate <= 15) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRetentionColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGrowthIcon = (rate: number) => {
    return rate > 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Retention</h1>
          <p className="text-gray-600">Analyze customer loyalty, churn, and lifetime value</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchRetentionData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Order Rate</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retentionMetrics ? `${retentionMetrics.repeatOrderRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Customers with multiple orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Lifetime Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retentionMetrics ? formatCurrency(retentionMetrics.customerLifetimeValue) : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average per customer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getChurnColor(retentionMetrics?.churnRate || 0)}`}>
              {retentionMetrics ? `${retentionMetrics.churnRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Customers lost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retentionMetrics ? retentionMetrics.activeCustomers : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              of {retentionMetrics?.totalCustomers || 0} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segments</CardTitle>
          <CardDescription>Performance by customer segment</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Segment</TableHead>
                <TableHead>Customers</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Avg Order Value</TableHead>
                <TableHead>Order Frequency</TableHead>
                <TableHead>Churn Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerSegments.map((segment) => (
                <TableRow key={segment.segment}>
                  <TableCell className="font-medium">{segment.segment}</TableCell>
                  <TableCell>{segment.count}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(segment.revenue)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(segment.averageOrderValue)}
                  </TableCell>
                  <TableCell>
                    {segment.orderFrequency.toFixed(1)} orders/year
                  </TableCell>
                  <TableCell>
                    <span className={getChurnColor(segment.churnRate)}>
                      {segment.churnRate.toFixed(1)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inactive Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Inactive Customers</CardTitle>
          <CardDescription>Customers with no recent orders (30+ days)</CardDescription>
        </CardHeader>
        <CardContent>
          {inactiveCustomers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>All customers are active</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Days Since</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveCustomers.map((customer) => (
                  <TableRow key={customer.customerId}>
                    <TableCell className="font-medium">{customer.customerName}</TableCell>
                    <TableCell>{customer.lastOrderDate}</TableCell>
                    <TableCell>
                      <span className={customer.daysSinceLastOrder > 90 ? 'text-red-600' : 'text-yellow-600'}>
                        {customer.daysSinceLastOrder} days
                      </span>
                    </TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(customer.totalRevenue)}
                    </TableCell>
                    <TableCell>{customer.assignedTo}</TableCell>
                    <TableCell>
                      <Badge variant={
                        customer.daysSinceLastOrder > 90 ? 'destructive' : 
                        customer.daysSinceLastOrder > 60 ? 'default' : 'secondary'
                      }>
                        {customer.daysSinceLastOrder > 90 ? 'High Risk' : 
                         customer.daysSinceLastOrder > 60 ? 'Medium Risk' : 'Low Risk'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Retention Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Retention Trends</CardTitle>
            <CardDescription>Monthly customer retention overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {retentionTrends.map((trend) => (
                <div key={trend.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{trend.month}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-green-600">
                          {trend.newCustomers} new
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-blue-600">
                          {trend.retainedCustomers} retained
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-red-600">
                          {trend.churnedCustomers} churned
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${getRetentionColor(trend.retentionRate)}`}>
                          {trend.retentionRate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <Progress value={trend.retentionRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retention Summary</CardTitle>
            <CardDescription>Key retention metrics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Repeat Order Rate</span>
                  <span className="text-sm font-bold">
                    {retentionMetrics ? `${retentionMetrics.repeatOrderRate.toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <Progress value={retentionMetrics?.repeatOrderRate || 0} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Order Frequency</span>
                  <span className="text-sm font-bold">
                    {retentionMetrics ? `${retentionMetrics.averageOrderFrequency.toFixed(1)}` : '0'} orders/year
                  </span>
                </div>
                <Progress value={Math.min((retentionMetrics?.averageOrderFrequency || 0) * 10, 100)} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Customer Lifetime Value</span>
                  <span className="text-sm font-bold">
                    {retentionMetrics ? formatCurrency(retentionMetrics.customerLifetimeValue) : '$0'}
                  </span>
                </div>
                <Progress value={Math.min((retentionMetrics?.customerLifetimeValue || 0) / 1000, 100)} className="h-2" />
              </div>
              
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {retentionMetrics ? retentionMetrics.activeCustomers : 0}
                    </div>
                    <div className="text-xs text-gray-500">Active Customers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {retentionMetrics ? retentionMetrics.totalCustomers - retentionMetrics.activeCustomers : 0}
                    </div>
                    <div className="text-xs text-gray-500">Inactive Customers</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
