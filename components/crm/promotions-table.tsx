"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Filter, Tag, Calendar, Users, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Promotion {
  id: string
  companyId: string
  name: string
  description: string
  type: string
  value: number
  minOrderValue?: number
  maxDiscount?: number
  applicableTo: string
  startDate: string
  endDate: string
  isActive: boolean
  usageLimit?: number
  usageCount: number
  status: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  approvedBy?: {
    id: string
    name: string
    email: string
  }
  approvedDate?: string
  createdAt: string
  updatedAt: string
}

export function PromotionsTable() {
  const { company } = useAuth()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        companyId: company?.id || '',
        limit: '100'
      })

      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      if (activeFilter && activeFilter !== 'all') params.append('isActive', activeFilter)

      const response = await fetch(`/api/crm/promotions?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setPromotions(data.data)
      }
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Percentage': return 'bg-blue-100 text-blue-800'
      case 'Fixed Amount': return 'bg-green-100 text-green-800'
      case 'Buy X Get Y': return 'bg-purple-100 text-purple-800'
      case 'Volume Discount': return 'bg-orange-100 text-orange-800'
      case 'Free Shipping': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-800'
      case 'Expired': return 'bg-red-100 text-red-800'
      case 'Cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const isActive = (startDate: string, endDate: string, status: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    return start <= now && end >= now && status === 'Active'
  }

  const getUsagePercentage = (used: number, limit?: number) => {
    if (!limit) return 0
    return (used / limit) * 100
  }

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Promotions</CardTitle>
            <CardDescription>
              Manage promotions, discounts, and pricing strategies
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search promotions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Percentage">Percentage</SelectItem>
              <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
              <SelectItem value="Buy X Get Y">Buy X Get Y</SelectItem>
              <SelectItem value="Volume Discount">Volume Discount</SelectItem>
              <SelectItem value="Free Shipping">Free Shipping</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Pending Approval">Pending Approval</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Active" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Applicable To</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No promotions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPromotions.map((promotion) => {
                  const usagePercentage = getUsagePercentage(promotion.usageCount, promotion.usageLimit)
                  const isCurrentlyActive = isActive(promotion.startDate, promotion.endDate, promotion.status)
                  
                  return (
                    <TableRow key={promotion.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{promotion.name}</div>
                          <div className="text-sm text-gray-500">{promotion.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(promotion.type)}>
                          {promotion.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {promotion.type === 'Percentage' ? (
                            <span>{promotion.value}%</span>
                          ) : promotion.type === 'Fixed Amount' ? (
                            <span>{formatCurrency(promotion.value)}</span>
                          ) : (
                            <span>{promotion.value}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{promotion.applicableTo}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm">{formatDate(promotion.startDate)}</div>
                            <div className="text-xs text-gray-500">to {formatDate(promotion.endDate)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm">
                            {promotion.usageCount}
                            {promotion.usageLimit && ` / ${promotion.usageLimit}`}
                          </div>
                          {promotion.usageLimit && (
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  usagePercentage >= 90 ? 'bg-red-500' :
                                  usagePercentage >= 75 ? 'bg-orange-500' :
                                  usagePercentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(promotion.status)}>
                            {promotion.status}
                          </Badge>
                          {isCurrentlyActive && (
                            <div className="flex items-center gap-1 text-green-600">
                              <TrendingUp className="h-3 w-3" />
                              <span className="text-xs">Live</span>
                            </div>
                          )}
                          {isExpired(promotion.endDate) && (
                            <div className="flex items-center gap-1 text-red-600">
                              <Calendar className="h-3 w-3" />
                              <span className="text-xs">Expired</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{promotion.createdBy.name}</div>
                          <div className="text-xs text-gray-500">{formatDate(promotion.createdAt)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
