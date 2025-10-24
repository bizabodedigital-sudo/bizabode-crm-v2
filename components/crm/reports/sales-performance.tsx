"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Users, Target, Award, Calendar, MapPin } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api-client-config'
import Loading from '@/components/shared/Loading'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'

interface SalesRepMetrics {
  repId: string
  repName: string
  territory: string
  leadsGenerated: number
  leadsQualified: number
  opportunitiesCreated: number
  ordersClosed: number
  revenue: number
  conversionRate: number
  averageDealSize: number
  activitiesCompleted: number
  tasksCompleted: number
  lastActivity: string
}

interface TerritoryMetrics {
  territory: string
  totalLeads: number
  totalRevenue: number
  conversionRate: number
  topRep: string
  growthRate: number
}

interface ConversionFunnel {
  stage: string
  count: number
  percentage: number
  color: string
}

export function SalesPerformanceDashboard() {
  const { company } = useAuth()
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [salesReps, setSalesReps] = useState<SalesRepMetrics[]>([])
  const [territories, setTerritories] = useState<TerritoryMetrics[]>([])
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([])
  const [topPerformers, setTopPerformers] = useState<SalesRepMetrics[]>([])

  useEffect(() => {
    if (company?.id) {
      fetchSalesPerformance()
    }
  }, [company?.id, timeRange])

  const fetchSalesPerformance = async () => {
    try {
      setIsLoading(true)
      
      // Fetch sales performance data
      const response = await api.get('/api/crm/reports/sales-performance', {
        companyId: company?.id,
        timeRange
      })
      
      if (response.success) {
        setSalesReps(response.data.salesReps || [])
        setTerritories(response.data.territories || [])
        setConversionFunnel(response.data.conversionFunnel || [])
        setTopPerformers(response.data.topPerformers || [])
      }
    } catch (error) {
      console.error('Failed to fetch sales performance:', error)
      toast({
        title: "Error",
        description: "Failed to load sales performance data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getConversionColor = (rate: number) => {
    if (rate >= 20) return 'text-green-600'
    if (rate >= 10) return 'text-yellow-600'
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
          <h1 className="text-3xl font-bold">Sales Performance</h1>
          <p className="text-gray-600">Track sales rep performance and conversion metrics</p>
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
          <Button onClick={fetchSalesPerformance} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesReps.reduce((sum, rep) => sum + rep.leadsGenerated, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(salesReps.reduce((sum, rep) => sum + rep.revenue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesReps.length > 0 
                ? `${(salesReps.reduce((sum, rep) => sum + rep.conversionRate, 0) / salesReps.length).toFixed(1)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Across all reps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reps</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesReps.length}</div>
            <p className="text-xs text-muted-foreground">
              Sales representatives
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Lead progression through sales stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{stage.count}</span>
                    <Badge variant="secondary">{stage.percentage.toFixed(1)}%</Badge>
                  </div>
                </div>
                <Progress 
                  value={stage.percentage} 
                  className="h-2"
                  style={{ backgroundColor: stage.color + '20' }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Best performing sales representatives</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Conversion</TableHead>
                <TableHead>Deals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topPerformers.map((rep, index) => (
                <TableRow key={rep.repId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {index < 3 && <Award className="h-4 w-4 text-yellow-500" />}
                      <span className="font-medium">#{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{rep.repName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      {rep.territory}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(rep.revenue)}
                  </TableCell>
                  <TableCell>
                    <span className={getConversionColor(rep.conversionRate)}>
                      {rep.conversionRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>{rep.ordersClosed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sales Rep Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Rep Performance</CardTitle>
          <CardDescription>Detailed metrics for each sales representative</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Rep</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Qualified</TableHead>
                <TableHead>Opportunities</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Conversion</TableHead>
                <TableHead>Avg Deal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesReps.map((rep) => (
                <TableRow key={rep.repId}>
                  <TableCell className="font-medium">{rep.repName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      {rep.territory}
                    </div>
                  </TableCell>
                  <TableCell>{rep.leadsGenerated}</TableCell>
                  <TableCell>{rep.leadsQualified}</TableCell>
                  <TableCell>{rep.opportunitiesCreated}</TableCell>
                  <TableCell>{rep.ordersClosed}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(rep.revenue)}
                  </TableCell>
                  <TableCell>
                    <span className={getConversionColor(rep.conversionRate)}>
                      {rep.conversionRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(rep.averageDealSize)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Territory Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Territory Analysis</CardTitle>
          <CardDescription>Performance by geographic territory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {territories.map((territory) => (
              <Card key={territory.territory}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{territory.territory}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className="font-medium">{formatCurrency(territory.totalRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Leads</span>
                    <span className="font-medium">{territory.totalLeads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Conversion</span>
                    <span className={getConversionColor(territory.conversionRate)}>
                      {territory.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Top Rep</span>
                    <span className="font-medium">{territory.topRep}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Growth</span>
                    <div className="flex items-center gap-1">
                      {getGrowthIcon(territory.growthRate)}
                      <span className="text-sm">{Math.abs(territory.growthRate).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
