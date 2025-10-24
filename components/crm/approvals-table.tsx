"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Filter, Clock, CheckCircle, XCircle, AlertTriangle, Eye, Edit } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { api, endpoints } from '@/lib/api-client-config'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { getStatusColor, getPriorityColor, getTypeColor } from '@/lib/utils/status-colors'
import SearchInput from '@/components/shared/SearchInput'
import Loading from '@/components/shared/Loading'

interface Approval {
  id: string
  companyId: string
  type: string
  relatedId: string
  relatedType: string
  title: string
  description: string
  requestedBy: {
    id: string
    name: string
    email: string
  }
  requestedDate: string
  amount?: number
  currency: string
  priority: string
  status: string
  approvers: {
    userId: {
      id: string
      name: string
      email: string
    }
    level: number
    status: string
    approvedDate?: string
    comments?: string
  }[]
  currentLevel: number
  totalLevels: number
  approvedBy?: {
    id: string
    name: string
    email: string
  }
  approvedDate?: string
  rejectedBy?: {
    id: string
    name: string
    email: string
  }
  rejectedDate?: string
  rejectionReason?: string
  comments?: string
  attachments?: string[]
  dueDate?: string
  isOverdue: boolean
  createdAt: string
  updatedAt: string
}

export function ApprovalsTable() {
  const { company } = useAuth()
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [overdueFilter, setOverdueFilter] = useState('')

  useEffect(() => {
    if (company?.id) {
      fetchApprovals()
    }
  }, [company?.id])

  const fetchApprovals = async () => {
    try {
      setLoading(true)
      const params: Record<string, string | number | boolean> = {
        companyId: company?.id || '',
        limit: 100
      }

      if (typeFilter && typeFilter !== 'all') params.type = typeFilter
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter
      if (priorityFilter && priorityFilter !== 'all') params.priority = priorityFilter
      if (overdueFilter && overdueFilter !== 'all') params.overdue = overdueFilter

      const response = await api.crm.approvals.list(params)
      
      if (response.success) {
        setApprovals(response.data)
      }
    } catch (error) {
      console.error('Error fetching approvals:', error)
    } finally {
      setLoading(false)
    }
  }


  const getProgressPercentage = (currentLevel: number, totalLevels: number) => {
    return (currentLevel / totalLevels) * 100
  }

  const filteredApprovals = approvals.filter(approval => {
    const matchesSearch = approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.requestedBy.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Loading />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Approval Workflows</CardTitle>
            <CardDescription>
              Manage approval workflows for quotes, discounts, and other requests
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <SearchInput
            placeholder="Search approvals..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Quote">Quote</SelectItem>
              <SelectItem value="Discount">Discount</SelectItem>
              <SelectItem value="Credit">Credit</SelectItem>
              <SelectItem value="Return">Return</SelectItem>
              <SelectItem value="Refund">Refund</SelectItem>
              <SelectItem value="Price">Price</SelectItem>
              <SelectItem value="Order">Order</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={overdueFilter} onValueChange={setOverdueFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Overdue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Overdue</SelectItem>
              <SelectItem value="false">On Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApprovals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No approvals found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApprovals.map((approval) => {
                  const progressPercentage = getProgressPercentage(approval.currentLevel, approval.totalLevels)
                  
                  return (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{approval.title}</div>
                          <div className="text-sm text-gray-500">{approval.description}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {approval.relatedType}: {approval.relatedId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(approval.type)}>
                          {approval.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {approval.amount ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">
                              {formatCurrency(approval.amount, approval.currency)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(approval.priority)}>
                          {approval.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">
                            {approval.currentLevel}/{approval.totalLevels}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(approval.status)}>
                            {approval.status}
                          </Badge>
                          {approval.isOverdue && (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="text-xs">Overdue</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{approval.requestedBy.name}</div>
                          <div className="text-xs text-gray-500">{formatDate(approval.requestedDate)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {approval.dueDate ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(approval.dueDate)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No due date</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {approval.status === 'Pending' && (
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
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
