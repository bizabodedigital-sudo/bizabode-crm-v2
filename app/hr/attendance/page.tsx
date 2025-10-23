"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle, User, Search, Filter, Plus, Download, RotateCcw } from "lucide-react"
import { getAuthHeaders } from "@/lib/utils/auth-headers"
import { AttendanceFormDialog } from "@/components/hr/attendance-form-dialog"
import { AttendanceDetailDialog } from "@/components/hr/attendance-detail-dialog"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface Attendance {
  _id: string
  employeeId: {
    _id: string
    firstName: string
    lastName: string
    employeeId: string
    position: string
    department: string
  }
  date: string
  checkIn?: string
  checkOut?: string
  breakStart?: string
  breakEnd?: string
  totalHours: number
  overtimeHours: number
  status: 'present' | 'absent' | 'late' | 'half-day' | 'sick' | 'vacation' | 'holiday'
  notes?: string
  approvedBy?: {
    name: string
    email: string
  }
  approvedAt?: string
  createdAt: string
}

export default function AttendancePage() {
  const { company } = useAuth()
  const { toast } = useToast()
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      setIsLoading(true)
      const { apiClient } = await import("@/lib/api-client")
      const data = await apiClient.getAttendance()
      // Handle the response format - it might be wrapped in data property
      setAttendance(data.attendance || data || [])
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
      setAttendance([])
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = 
      record.employeeId.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.department.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    
    const matchesDate = !dateFilter || record.date.startsWith(dateFilter)
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      present: "default",
      absent: "destructive",
      late: "secondary",
      'half-day': "outline",
      sick: "secondary",
      vacation: "outline",
      holiday: "outline"
    } as const

    const colors = {
      present: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      late: "bg-yellow-100 text-yellow-800",
      'half-day': "bg-blue-100 text-blue-800",
      sick: "bg-orange-100 text-orange-800",
      vacation: "bg-purple-100 text-purple-800",
      holiday: "bg-gray-100 text-gray-800"
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'late':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const calculateStats = () => {
    const totalRecords = attendance.length
    const presentCount = attendance.filter(r => r.status === 'present').length
    const absentCount = attendance.filter(r => r.status === 'absent').length
    const lateCount = attendance.filter(r => r.status === 'late').length
    const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0
    const averageHours = totalRecords > 0 ? attendance.reduce((sum, r) => sum + r.totalHours, 0) / totalRecords : 0

    return {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate,
      averageHours
    }
  }

  const stats = calculateStats()

  const handleRevokeAttendance = async (attendanceId: string) => {
    if (!confirm('Are you sure you want to revoke the clock-out for this attendance record? This will allow the employee to continue working.')) {
      return
    }

    try {
      const response = await fetch(`/api/attendance/${attendanceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (data.success) {
        await fetchAttendance() // Refresh data
        toast({
          title: "Success",
          description: "Clock-out revoked successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to revoke attendance",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to revoke attendance:', error)
      toast({
        title: "Error",
        description: "Failed to revoke attendance",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Tracking</h1>
          <p className="text-muted-foreground">
            Monitor employee attendance and working hours
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Attendance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.presentCount} of {stats.totalRecords} records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.presentCount}</div>
            <p className="text-xs text-muted-foreground">
              Present employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absentCount}</div>
            <p className="text-xs text-muted-foreground">
              Absence records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Per day
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            Track and manage employee attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search attendance..."
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
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-48"
            />
            <Button variant="outline" onClick={() => {
              setSearchQuery("")
              setStatusFilter("all")
              setDateFilter("")
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
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendance.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {record.employeeId.firstName} {record.employeeId.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {record.employeeId.employeeId} • {record.employeeId.department}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(record.date), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.checkIn ? (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-green-600" />
                              {format(new Date(record.checkIn), 'h:mm a')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.checkOut ? (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-red-600" />
                              {format(new Date(record.checkOut), 'h:mm a')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">{record.totalHours.toFixed(1)}h</div>
                            {record.overtimeHours > 0 && (
                              <div className="text-xs text-orange-600">
                                +{record.overtimeHours.toFixed(1)}h OT
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(record.status)}
                            {getStatusBadge(record.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAttendance(record)
                                setIsDetailOpen(true)
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedAttendance(record)
                                setIsFormOpen(true)
                              }}
                            >
                              Edit
                            </Button>
                            {record.checkOut && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeAttendance(record._id)}
                                className="text-yellow-600 hover:text-yellow-700"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
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

      <AttendanceFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        attendance={
          selectedAttendance
            ? {
                ...selectedAttendance,
                employeeId:
                  typeof selectedAttendance.employeeId === 'object'
                    ? selectedAttendance.employeeId._id
                    : selectedAttendance.employeeId,
              }
            : null
        }
        onSuccess={fetchAttendance}
      />

      <AttendanceDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        attendance={selectedAttendance}
      />
    </div>
  )
}
