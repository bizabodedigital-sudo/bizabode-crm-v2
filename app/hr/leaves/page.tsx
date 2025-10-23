"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle, User, Search, Filter, Plus, Download, Eye, Edit } from "lucide-react"
import { LeaveFormDialog } from "@/components/hr/leave-form-dialog"
import { LeaveDetailDialog } from "@/components/hr/leave-detail-dialog"
import { useAuth } from "@/lib/auth-context"
import { format } from "date-fns"

interface LeaveRequest {
  _id: string
  employeeId: {
    _id: string
    firstName: string
    lastName: string
    employeeId: string
    position: string
    department: string
  }
  leaveType: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'other'
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  requestedBy: {
    name: string
    email: string
  }
  approvedBy?: {
    name: string
    email: string
  }
  approvedAt?: string
  rejectionReason?: string
  attachments?: Array<{
    name: string
    url: string
    uploadedAt: string
  }>
  notes?: string
  createdAt: string
}

export default function LeavesPage() {
  const { company } = useAuth()
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    if (company?.id) {
      fetchLeaves()
    }
  }, [company?.id])

  const fetchLeaves = async () => {
    try {
      setIsLoading(true)
      const { apiClient } = await import("@/lib/api-client")
      const data = await apiClient.getLeaveRequests({
        companyId: company?.id || '',
        limit: 1000
      })
      // Handle the response format - it might be wrapped in data property
      setLeaves(data.leaveRequests || data || [])
    } catch (error) {
      console.error('Failed to fetch leaves:', error)
      setLeaves([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = 
      (leave.employeeId?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (leave.employeeId?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (leave.employeeId?.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (leave.employeeId?.department || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || leave.status === statusFilter
    const matchesType = typeFilter === "all" || leave.leaveType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      cancelled: "outline"
    } as const

    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800"
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      vacation: "bg-blue-100 text-blue-800",
      sick: "bg-red-100 text-red-800",
      personal: "bg-purple-100 text-purple-800",
      maternity: "bg-pink-100 text-pink-800",
      paternity: "bg-cyan-100 text-cyan-800",
      bereavement: "bg-gray-100 text-gray-800",
      other: "bg-orange-100 text-orange-800"
    }

    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const calculateStats = () => {
    const totalLeaves = leaves.length
    const pendingCount = leaves.filter(l => l.status === 'pending').length
    const approvedCount = leaves.filter(l => l.status === 'approved').length
    const rejectedCount = leaves.filter(l => l.status === 'rejected').length
    const approvalRate = totalLeaves > 0 ? (approvedCount / totalLeaves) * 100 : 0
    const totalDays = leaves.reduce((sum, l) => sum + l.totalDays, 0)

    return {
      totalLeaves,
      pendingCount,
      approvedCount,
      rejectedCount,
      approvalRate,
      totalDays
    }
  }

  const stats = calculateStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">
            Manage employee leave requests and approvals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {/* Export functionality */}}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Leave
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.approvedCount} of {stats.totalLeaves} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedCount}</div>
            <p className="text-xs text-muted-foreground">
              Approved requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDays}</div>
            <p className="text-xs text-muted-foreground">
              Leave days taken
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            Manage and approve employee leave requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leaves..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="maternity">Maternity</SelectItem>
                <SelectItem value="paternity">Paternity</SelectItem>
                <SelectItem value="bereavement">Bereavement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchQuery("")
              setStatusFilter("all")
              setTypeFilter("all")
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No leave requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <TableRow key={leave._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {leave.employeeId?.firstName || 'Unknown'} {leave.employeeId?.lastName || 'Employee'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {leave.employeeId?.employeeId || 'N/A'} • {leave.employeeId?.department || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(leave.leaveType)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">{leave.totalDays}</div>
                            <div className="text-xs text-muted-foreground">days</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(leave.status)}
                            {getStatusBadge(leave.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(leave.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLeave(leave)
                                setIsDetailOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLeave(leave)
                                setIsFormOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <LeaveFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        leave={
          selectedLeave
            ? {
                ...selectedLeave,
                employeeId:
                  typeof selectedLeave.employeeId === 'object'
                    ? selectedLeave.employeeId._id
                    : selectedLeave.employeeId,
              }
            : null
        }
        onSuccess={fetchLeaves}
      />

      <LeaveDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        leave={selectedLeave}
      />
    </div>
  )
}
