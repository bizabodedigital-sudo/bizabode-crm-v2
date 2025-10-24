"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, DollarSign, FileText, UserPlus, Calendar, TrendingUp, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { EmployeeFormDialog } from "@/components/hr/employee-form-dialog"

interface HRStats {
  totalEmployees: number
  activeEmployees: number
  departments: number
  totalPayroll: number
  pendingLeaves: number
  attendanceToday: number
}

export default function HRPage() {
  const { company } = useAuth()
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false)
  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    totalPayroll: 0,
    pendingLeaves: 0,
    attendanceToday: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHRStats()
  }, [])

  const fetchHRStats = async () => {
    try {
      setIsLoading(true)

      const { apiClient } = await import("@/lib/api-client")
      const response = await apiClient.getEmployees()
      
      // The API client should return { employees: [...], pagination: {...} }
      const employees = response.employees || []

      // Ensure employees is an array
      if (!Array.isArray(employees)) {
        console.error('Employees data is not an array:', employees)
        console.log('Full response:', response)
        setStats({
          totalEmployees: 0,
          activeEmployees: 0,
          departments: 0,
          totalPayroll: 0,
          pendingLeaves: 0,
          attendanceToday: 0
        })
        return
      }

      const departments = [...new Set(employees.map((emp: any) => emp.department))]

      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((emp: any) => emp.status === 'active').length,
        departments: departments.length,
        totalPayroll: employees.reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0),
        pendingLeaves: 0, // Will be implemented with leave requests
        attendanceToday: 0 // Will be implemented with attendance tracking
      })
    } catch (error) {
      console.error('Failed to fetch HR stats:', error)
      // Set default stats on error
      setStats({
        totalEmployees: 0,
        activeEmployees: 0,
        departments: 0,
        totalPayroll: 0,
        pendingLeaves: 0,
        attendanceToday: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading HR dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Human Resources
        </h1>
        <p className="text-lg text-muted-foreground">Manage employees, attendance, and payroll</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeEmployees} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-muted-foreground">
              Active departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalPayroll || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total salary budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingLeaves} pending leaves
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/hr/employees">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Employee Management
              </CardTitle>
              <CardDescription>
                Manage employee information and records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.totalEmployees}
              </div>
              <p className="text-sm text-muted-foreground">Total employees</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/hr/attendance">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Attendance Tracking
              </CardTitle>
              <CardDescription>
                Track employee attendance and hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.attendanceToday}
              </div>
              <p className="text-sm text-muted-foreground">Present today</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/hr/payroll">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payroll Management
              </CardTitle>
              <CardDescription>
                Process salaries and manage payroll
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${(stats.totalPayroll / 1000).toFixed(0)}k
              </div>
              <p className="text-sm text-muted-foreground">Monthly budget</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/hr/leaves">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Leave Management
              </CardTitle>
              <CardDescription>
                Manage leave requests and approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.pendingLeaves}
              </div>
              <p className="text-sm text-muted-foreground">Pending requests</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/hr/reports">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                HR Reports
              </CardTitle>
              <CardDescription>
                Generate HR analytics and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                -
              </div>
              <p className="text-sm text-muted-foreground">Available reports</p>
            </CardContent>
          </Link>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsEmployeeFormOpen(true)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Employee
            </CardTitle>
            <CardDescription>
              Add new employee to the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              +
            </div>
            <p className="text-sm text-muted-foreground">Quick add</p>
          </CardContent>
        </Card>
      </div>

      {/* HR Admin Dashboard */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending Leave Requests
            </CardTitle>
            <CardDescription>
              Leave requests awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No pending leave requests</p>
              <p className="text-sm">All leave requests have been processed</p>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/hr/leave-approvals">
                    View All Requests
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Attendance
            </CardTitle>
            <CardDescription>
              Current attendance status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No attendance data available</p>
              <p className="text-sm">Attendance tracking will be available soon</p>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/hr/attendance">
                    View Full Attendance
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* HR Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            HR Analytics
          </CardTitle>
          <CardDescription>
            Key metrics and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>HR Analytics coming soon</p>
            <p className="text-sm">Advanced analytics and insights will be available</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent HR Activity</CardTitle>
          <CardDescription>
            Latest updates in your HR system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-2 h-2 bg-muted-foreground/20 rounded-full mx-auto mb-4"></div>
            <p>No recent activity</p>
            <p className="text-sm">HR activity will appear here as it happens</p>
          </div>
        </CardContent>
      </Card>

      {/* Employee Form Dialog */}
      <EmployeeFormDialog
        open={isEmployeeFormOpen}
        onOpenChange={setIsEmployeeFormOpen}
        onSuccess={fetchHRStats}
      />
    </div>
  )
}
