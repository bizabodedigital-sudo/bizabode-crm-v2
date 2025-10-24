"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api-client-config'
import Loading from '@/components/shared/Loading'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'

interface PaymentSummary {
  totalPending: number
  totalOverdue: number
  totalCollected: number
  collectionRate: number
  averageDaysToPay: number
}

interface OverdueAccount {
  customerId: string
  customerName: string
  invoiceNumber: string
  amount: number
  daysOverdue: number
  lastContact: string
  assignedTo: string
}

interface RevenueByCategory {
  category: string
  revenue: number
  percentage: number
  growth: number
}

interface PaymentTrend {
  month: string
  collected: number
  pending: number
  overdue: number
}

export function FinancialTrackingDashboard() {
  const { company } = useAuth()
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [overdueAccounts, setOverdueAccounts] = useState<OverdueAccount[]>([])
  const [revenueByCategory, setRevenueByCategory] = useState<RevenueByCategory[]>([])
  const [paymentTrends, setPaymentTrends] = useState<PaymentTrend[]>([])

  useEffect(() => {
    if (company?.id) {
      fetchFinancialData()
    }
  }, [company?.id, timeRange])

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true)
      
      const response = await api.get('/api/crm/reports/financial', {
        companyId: company?.id,
        timeRange
      })
      
      if (response.success) {
        setPaymentSummary(response.data.paymentSummary)
        setOverdueAccounts(response.data.overdueAccounts || [])
        setRevenueByCategory(response.data.revenueByCategory || [])
        setPaymentTrends(response.data.paymentTrends || [])
      }
    } catch (error) {
      console.error('Failed to fetch financial data:', error)
      toast({
        title: "Error",
        description: "Failed to load financial data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getOverdueColor = (days: number) => {
    if (days >= 60) return 'text-red-600'
    if (days >= 30) return 'text-orange-600'
    return 'text-yellow-600'
  }

  const getOverdueBadge = (days: number) => {
    if (days >= 60) return 'destructive'
    if (days >= 30) return 'default'
    return 'secondary'
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
          <h1 className="text-3xl font-bold">Financial Tracking</h1>
          <p className="text-gray-600">Monitor payments, overdue accounts, and revenue analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchFinancialData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentSummary ? formatCurrency(paymentSummary.totalPending) : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {paymentSummary ? formatCurrency(paymentSummary.totalOverdue) : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentSummary ? `${paymentSummary.collectionRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days to Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentSummary ? `${paymentSummary.averageDaysToPay.toFixed(0)}` : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Days average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Overdue Accounts</CardTitle>
          <CardDescription>Customers with outstanding payments</CardDescription>
        </CardHeader>
        <CardContent>
          {overdueAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No overdue accounts</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueAccounts.map((account) => (
                  <TableRow key={account.customerId}>
                    <TableCell className="font-medium">{account.customerName}</TableCell>
                    <TableCell>{account.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(account.amount)}
                    </TableCell>
                    <TableCell>
                      <span className={getOverdueColor(account.daysOverdue)}>
                        {account.daysOverdue} days
                      </span>
                    </TableCell>
                    <TableCell>{account.lastContact}</TableCell>
                    <TableCell>{account.assignedTo}</TableCell>
                    <TableCell>
                      <Badge variant={getOverdueBadge(account.daysOverdue) as any}>
                        {account.daysOverdue >= 60 ? 'Critical' : 
                         account.daysOverdue >= 30 ? 'High' : 'Medium'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Sales breakdown by customer type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByCategory.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {formatCurrency(category.revenue)}
                      </span>
                      <div className="flex items-center gap-1">
                        {getGrowthIcon(category.growth)}
                        <span className="text-xs">{Math.abs(category.growth).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={category.percentage} className="h-2" />
                    <span className="text-xs text-gray-500">
                      {category.percentage.toFixed(1)}% of total revenue
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Trends</CardTitle>
            <CardDescription>Monthly payment collection overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentTrends.map((trend) => (
                <div key={trend.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{trend.month}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-green-600">
                          {formatCurrency(trend.collected)}
                        </div>
                        <div className="text-xs text-gray-500">Collected</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-yellow-600">
                          {formatCurrency(trend.pending)}
                        </div>
                        <div className="text-xs text-gray-500">Pending</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-red-600">
                          {formatCurrency(trend.overdue)}
                        </div>
                        <div className="text-xs text-gray-500">Overdue</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Rate Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Performance</CardTitle>
          <CardDescription>Payment collection rate and targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Collection Rate</span>
                <span className="text-sm font-bold">
                  {paymentSummary ? `${paymentSummary.collectionRate.toFixed(1)}%` : '0%'}
                </span>
              </div>
              <Progress 
                value={paymentSummary?.collectionRate || 0} 
                className="h-3"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {paymentSummary ? formatCurrency(paymentSummary.totalCollected) : '$0'}
                </div>
                <div className="text-xs text-gray-500">Collected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {paymentSummary ? formatCurrency(paymentSummary.totalPending) : '$0'}
                </div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {paymentSummary ? formatCurrency(paymentSummary.totalOverdue) : '$0'}
                </div>
                <div className="text-xs text-gray-500">Overdue</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
