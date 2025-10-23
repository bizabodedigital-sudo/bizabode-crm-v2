"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, Filter, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface CreditLimit {
  id: string
  companyId: string
  customerId: {
    id: string
    companyName: string
    contactPerson: string
    email: string
    phone: string
  }
  creditLimit: number
  currentBalance: number
  creditUsed: number
  creditAvailable: number
  paymentTerms: string
  creditHold: boolean
  creditHoldReason?: string
  riskLevel: string
  lastPaymentDate?: string
  lastPaymentAmount?: number
  averagePaymentDays?: number
  creditScore?: number
  approvedBy?: {
    id: string
    name: string
    email: string
  }
  approvedDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export function CreditLimitsTable() {
  const { company } = useAuth()
  const [creditLimits, setCreditLimits] = useState<CreditLimit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [holdFilter, setHoldFilter] = useState('')

  useEffect(() => {
    fetchCreditLimits()
  }, [])

  const fetchCreditLimits = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        companyId: company?.id || '',
        limit: '100'
      })

      if (riskFilter && riskFilter !== 'all') params.append('riskLevel', riskFilter)
      if (holdFilter && holdFilter !== 'all') params.append('creditHold', holdFilter)

      const response = await fetch(`/api/crm/credit-limits?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setCreditLimits(data.data)
      }
    } catch (error) {
      console.error('Error fetching credit limits:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCreditUtilization = (used: number, limit: number) => {
    return limit > 0 ? (used / limit) * 100 : 0
  }

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600'
    if (utilization >= 75) return 'text-orange-600'
    if (utilization >= 50) return 'text-yellow-600'
    return 'text-green-600'
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

  const filteredCreditLimits = creditLimits.filter(limit => {
    const matchesSearch = limit.customerId.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         limit.customerId.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
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
            <CardTitle>Credit Limits</CardTitle>
            <CardDescription>
              Manage customer credit limits and payment terms
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Credit Limit
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
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={holdFilter} onValueChange={setHoldFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Credit Hold" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">On Hold</SelectItem>
              <SelectItem value="false">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Credit Limit</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCreditLimits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    No credit limits found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCreditLimits.map((limit) => {
                  const utilization = getCreditUtilization(limit.creditUsed, limit.creditLimit)
                  
                  return (
                    <TableRow key={limit.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{limit.customerId.companyName}</div>
                          <div className="text-sm text-gray-500">{limit.customerId.contactPerson}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          {formatCurrency(limit.creditLimit)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          {formatCurrency(limit.creditUsed)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          {formatCurrency(limit.creditAvailable)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                utilization >= 90 ? 'bg-red-500' :
                                utilization >= 75 ? 'bg-orange-500' :
                                utilization >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getUtilizationColor(utilization)}`}>
                            {utilization.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{limit.paymentTerms}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(limit.riskLevel)}>
                          {limit.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {limit.creditHold ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">On Hold</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Active</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {limit.lastPaymentDate ? (
                          <div>
                            <div className="text-sm">{formatDate(limit.lastPaymentDate)}</div>
                            {limit.lastPaymentAmount && (
                              <div className="text-xs text-gray-500">
                                {formatCurrency(limit.lastPaymentAmount)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No payments</span>
                        )}
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
