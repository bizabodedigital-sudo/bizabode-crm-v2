"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HRAnalyticsDashboard } from "@/components/hr/hr-analytics-dashboard"
import { useAuth } from "@/lib/auth-context"
import { BarChart3, Download, RefreshCw, TrendingUp, Users, Clock, DollarSign, Calendar } from "lucide-react"

export default function HRReportsPage() {
  const { company } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate comprehensive HR reports and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {/* Export functionality */}}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button variant="outline" onClick={() => setIsLoading(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">
              Total salary cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Dashboard */}
      <HRAnalyticsDashboard />

      {/* Report Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Reports
            </CardTitle>
            <CardDescription>
              Employee demographics, turnover, and performance analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Department Breakdown</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hiring Trends</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Employee Satisfaction</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attendance Reports
            </CardTitle>
            <CardDescription>
              Attendance patterns, punctuality, and overtime analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Daily Attendance</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Overtime Analysis</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Punctuality Report</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payroll Reports
            </CardTitle>
            <CardDescription>
              Salary analysis, cost breakdown, and compensation trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Salary Distribution</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cost by Department</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Benefits Analysis</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Leave Reports
            </CardTitle>
            <CardDescription>
              Leave patterns, approval rates, and absence analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Leave Trends</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Approval Rates</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Absence Patterns</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Reports
            </CardTitle>
            <CardDescription>
              Performance reviews, goals, and development analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Review Scores</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Goal Achievement</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Development Plans</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Custom Reports
            </CardTitle>
            <CardDescription>
              Create custom reports with specific criteria and filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Report Builder</span>
                <Button variant="ghost" size="sm">Create</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Scheduled Reports</span>
                <Button variant="ghost" size="sm">Manage</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Export Templates</span>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Your recently generated HR reports and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Monthly HR Summary - December 2024</p>
                <p className="text-xs text-muted-foreground">
                  Generated on Dec 31, 2024 at 11:59 PM
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
            
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent reports</p>
              <p className="text-sm">Generate your first HR report to get started</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
