"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw
} from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/lib/auth-context"
import { api, endpoints } from "@/lib/api-client-config"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import Loading from "@/components/shared/Loading"

interface HRAnalytics {
  overview: {
    totalEmployees: number
    activeEmployees: number
    departments: number
    recentHires: number
    upcomingReviews: number
    pendingLeaves: number
  }
  attendance: {
    totalRecords: number
    presentCount: number
    absentCount: number
    lateCount: number
    attendanceRate: number
    averageHours: number
  }
  payroll: {
    totalPayrolls: number
    totalGrossPay: number
    totalDeductions: number
    totalNetPay: number
    averageSalary: number
  }
  performance: {
    totalReviews: number
    averageScore: number
    scoreDistribution: Array<{ _id: number; count: number }>
  }
  leaves: {
    totalLeaves: number
    approvedLeaves: number
    pendingLeaves: number
    rejectedLeaves: number
    approvalRate: number
  }
}

export function HRAnalyticsDashboard() {
  const { company } = useAuth()
  const [analytics, setAnalytics] = useState<HRAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reportType, setReportType] = useState("overview")
  const [dateRange, setDateRange] = useState("30") // days
  const [department, setDepartment] = useState("all")

  useEffect(() => {
    if (company?.id) {
      fetchAnalytics()
    }
  }, [company?.id, reportType, dateRange, department])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

      const params = new URLSearchParams({
        type: reportType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })

      if (department !== "all") {
        params.append('department', department)
      }

      const response = await api.get(endpoints.hr.reports, {
        companyId: company?.id || '',
        type: reportType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        ...(department !== "all" && { department })
      })
      
      if (response.success) {
        setAnalytics(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch HR analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))

      const params = new URLSearchParams({
        type: reportType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        format
      })

      if (department !== "all") {
        params.append('department', department)
      }

      // In a real implementation, this would trigger a download
      console.log(`Exporting ${format} report with params:`, params.toString())
    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

  if (isLoading) {
    return <Loading />
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load HR analytics</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="attendance">Attendance</SelectItem>
              <SelectItem value="payroll">Payroll</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="leaves">Leaves</SelectItem>
              <SelectItem value="departments">Departments</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="HR">Human Resources</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {reportType === 'overview' && analytics.overview && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.activeEmployees} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.departments}</div>
              <p className="text-xs text-muted-foreground">
                Active departments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Hires</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.recentHires}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.upcomingReviews}</div>
              <p className="text-xs text-muted-foreground">
                Performance reviews
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Analytics */}
      {reportType === 'attendance' && analytics.attendance && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.attendance.attendanceRate.toFixed(1)}%
              </div>
              <Progress value={analytics.attendance.attendanceRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.attendance.presentCount}
              </div>
              <p className="text-xs text-muted-foreground">
                of {analytics.attendance.totalRecords} records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {analytics.attendance.absentCount}
              </div>
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
              <div className="text-2xl font-bold">
                {analytics.attendance.averageHours.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Per day
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll Analytics */}
      {reportType === 'payroll' && analytics.payroll && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(analytics.payroll.totalGrossPay || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Before deductions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(analytics.payroll.totalDeductions || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Taxes & benefits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${(analytics.payroll.totalNetPay || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                After deductions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(analytics.payroll.averageSalary || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Per employee
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Analytics */}
      {reportType === 'performance' && analytics.performance && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.performance.averageScore.toFixed(1)}/5
              </div>
              <p className="text-xs text-muted-foreground">
                Performance rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.performance.totalReviews}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Score Distribution</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.performance.scoreDistribution.map((score) => (
                  <div key={score._id} className="flex items-center justify-between">
                    <span className="text-sm">{score._id} stars</span>
                    <Badge variant="outline">{score.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaves Analytics */}
      {reportType === 'leaves' && analytics.leaves && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.leaves.approvalRate.toFixed(1)}%
              </div>
              <Progress value={analytics.leaves.approvalRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.leaves.approvedLeaves}
              </div>
              <p className="text-xs text-muted-foreground">
                Leave requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.leaves.pendingLeaves}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {analytics.leaves.rejectedLeaves}
              </div>
              <p className="text-xs text-muted-foreground">
                Denied requests
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
