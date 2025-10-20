"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Calendar, CheckCircle, Clock, AlertTriangle, User, Search, Filter, Plus, Download, Eye, FileText } from "lucide-react"
import { PayrollFormDialog } from "@/components/hr/payroll-form-dialog"
import { PayrollDetailDialog } from "@/components/hr/payroll-detail-dialog"
import { useAuth } from "@/lib/auth-context"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Payroll {
  _id: string
  employeeId: {
    _id: string
    firstName: string
    lastName: string
    employeeId: string
    position: string
    department: string
  }
  payPeriod: {
    startDate: string
    endDate: string
  }
  grossPay: number
  deductions: number
  netPay: number
  items: Array<{
    type: 'salary' | 'overtime' | 'bonus' | 'commission' | 'allowance' | 'deduction'
    description: string
    amount: number
    taxable: boolean
  }>
  status?: 'draft' | 'approved' | 'paid' | 'cancelled'
  paymentDate?: string
  paymentMethod?: 'bank_transfer' | 'check' | 'cash'
  notes?: string
  processedBy: {
    name: string
    email: string
  }
  approvedBy?: {
    name: string
    email: string
  }
  approvedAt?: string
  createdAt: string
}

export default function PayrollPage() {
  const { company } = useAuth()
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPayrolls()
  }, [])

  const fetchPayrolls = async () => {
    try {
      setIsLoading(true)
      const { apiClient } = await import("@/lib/api-client")
      const data = await apiClient.getPayrolls()
      setPayrolls(data)
    } catch (error) {
      console.error('Failed to fetch payrolls:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGeneratePayslip = async (payroll: Payroll) => {
    try {
      console.log('Generating payslip for payroll:', payroll._id)
      
      const token = localStorage.getItem('bizabode_token')
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }
      
      const response = await fetch(`/api/payroll/${payroll._id}/payslip`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Payslip generation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.')
        } else if (response.status === 404) {
          throw new Error('Payroll record not found.')
        } else {
          throw new Error(`Payslip generation failed: ${response.status} ${response.statusText}`)
        }
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payslip-${payroll.employeeId?.firstName || 'Unknown'}-${payroll.employeeId?.lastName || 'Employee'}-${payroll.payPeriod?.startDate || 'Unknown'}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Success",
        description: "Payslip generated successfully",
      })
    } catch (error) {
      console.error('Payslip generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast({
        title: "Error",
        description: `Failed to generate payslip: ${errorMessage}`,
        variant: "destructive",
      })
    }
  }

  const filteredPayrolls = payrolls.filter(payroll => {
    const matchesSearch = 
      payroll.employeeId.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payroll.employeeId.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payroll.employeeId.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payroll.employeeId.department.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || payroll.status === statusFilter
    
    const matchesPeriod = !periodFilter || 
      payroll.payPeriod.startDate.startsWith(periodFilter) ||
      payroll.payPeriod.endDate.startsWith(periodFilter)
    
    return matchesSearch && matchesStatus && matchesPeriod
  })

  const getStatusBadge = (status?: string) => {
    // Handle undefined/null status values
    if (!status) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Unknown
        </Badge>
      )
    }

    const variants = {
      draft: "secondary",
      approved: "default",
      paid: "default",
      cancelled: "destructive"
    } as const

    const colors = {
      draft: "bg-gray-100 text-gray-800",
      approved: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getStatusIcon = (status?: string) => {
    // Handle undefined/null status values
    if (!status) {
      return <Clock className="h-4 w-4 text-muted-foreground" />
    }

    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'approved':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />
      case 'draft':
        return <Clock className="h-4 w-4 text-gray-600" />
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const calculateStats = () => {
    const totalPayrolls = payrolls.length
    const totalGrossPay = payrolls.reduce((sum, p) => sum + p.grossPay, 0)
    const totalDeductions = payrolls.reduce((sum, p) => sum + p.deductions, 0)
    const totalNetPay = payrolls.reduce((sum, p) => sum + p.netPay, 0)
    const paidCount = payrolls.filter(p => p.status === 'paid').length
    const pendingCount = payrolls.filter(p => p.status === 'draft' || p.status === 'approved').length

    return {
      totalPayrolls,
      totalGrossPay,
      totalDeductions,
      totalNetPay,
      paidCount,
      pendingCount
    }
  }

  const stats = calculateStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">
            Process salaries and manage employee payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => {/* Export functionality */}}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalGrossPay.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Before deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalDeductions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Taxes & benefits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Pay</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalNetPay.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              After deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paidCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingCount} pending
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>
            Manage employee salary payments and deductions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payroll..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="month"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-48"
            />
            <Button variant="outline" onClick={() => {
              setSearchQuery("")
              setStatusFilter("all")
              setPeriodFilter("")
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
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayrolls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No payroll records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayrolls.map((payroll) => (
                      <TableRow key={payroll._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {payroll.employeeId.firstName} {payroll.employeeId.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {payroll.employeeId.employeeId} • {payroll.employeeId.department}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-sm">
                                {format(new Date(payroll.payPeriod.startDate), 'MMM dd')} - {format(new Date(payroll.payPeriod.endDate), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          ${payroll.grossPay.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-red-600">
                          -${payroll.deductions.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-green-600">
                          ${payroll.netPay.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payroll.status)}
                            {getStatusBadge(payroll.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {payroll.paymentDate ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(payroll.paymentDate), 'MMM dd, yyyy')}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPayroll(payroll)
                                setIsDetailOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleGeneratePayslip(payroll)}
                              title="Generate Payslip"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPayroll(payroll)
                                setIsFormOpen(true)
                              }}
                            >
                              Edit
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

      <PayrollFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        payroll={
          selectedPayroll
            ? {
                ...selectedPayroll,
                employeeId:
                  typeof selectedPayroll.employeeId === 'object'
                    ? selectedPayroll.employeeId._id
                    : selectedPayroll.employeeId,
                status: selectedPayroll.status || 'draft',
              }
            : null
        }
        onSuccess={fetchPayrolls}
      />

      <PayrollDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        payroll={selectedPayroll}
      />
    </div>
  )
}
