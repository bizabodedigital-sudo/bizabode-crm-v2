"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface Employee {
  _id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  trn?: string
  nisNumber?: string
  nhtNumber?: string
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed'
  hireDate?: string
  contractStartDate?: string
  contractEndDate?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  position: string
  department: string
  managerId?: string
  salary: number
  hourlyRate?: number
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern'
  status: 'active' | 'inactive' | 'terminated' | 'on-leave'
  payFrequency?: 'weekly' | 'bi-weekly' | 'monthly'
  paymentMethod?: 'bank-transfer' | 'cash' | 'cheque'
  bankName?: string
  bankAccountNumber?: string
  workSchedule?: string
  workLocation?: string
  supervisorId?: string
  driverLicenseExpiry?: string
  workPermitExpiry?: string
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
    email?: string
  }
  secondaryContact?: {
    name: string
    relationship: string
    phone: string
    email?: string
  }
  performanceRating?: number
  notes?: string
  createdBy?: string
  lastUpdated?: string
}

interface EmployeeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee | null
  onSuccess: () => void
}

export function EmployeeFormDialog({ open, onOpenChange, employee, onSuccess }: EmployeeFormDialogProps) {
  const { company } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [managers, setManagers] = useState<Array<{_id: string, firstName: string, lastName: string}>>([])
  
  const [formData, setFormData] = useState<{
    employeeId: string
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
    trn: string
    nisNumber: string
    nhtNumber: string
    maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
    hireDate: string
    contractStartDate: string
    contractEndDate: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    position: string
    department: string
    managerId: string
    salary: number
    hourlyRate: number
    employmentType: 'full-time' | 'part-time' | 'contract' | 'intern'
    status: 'active' | 'inactive' | 'terminated' | 'on-leave'
    payFrequency: 'weekly' | 'bi-weekly' | 'monthly'
    paymentMethod: 'bank-transfer' | 'cash' | 'cheque'
    bankName: string
    bankAccountNumber: string
    workSchedule: string
    workLocation: string
    supervisorId: string
    driverLicenseExpiry: string
    workPermitExpiry: string
    emergencyContact: {
      name: string
      relationship: string
      phone: string
      email: string
    }
    secondaryContact: {
      name: string
      relationship: string
      phone: string
      email: string
    }
    performanceRating: number
    notes: string
  }>({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "prefer-not-to-say" as 'male' | 'female' | 'other' | 'prefer-not-to-say',
    trn: "",
    nisNumber: "",
    nhtNumber: "",
    maritalStatus: "single" as 'single' | 'married' | 'divorced' | 'widowed',
    hireDate: "",
    contractStartDate: "",
    contractEndDate: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Jamaica"
    },
    position: "",
    department: "",
    managerId: "",
    salary: 0,
    hourlyRate: 0,
    employmentType: "full-time" as 'full-time' | 'part-time' | 'contract' | 'intern',
    status: "active" as 'active' | 'inactive' | 'terminated' | 'on-leave',
    payFrequency: "monthly" as 'weekly' | 'bi-weekly' | 'monthly',
    paymentMethod: "bank-transfer" as 'bank-transfer' | 'cash' | 'cheque',
    bankName: "",
    bankAccountNumber: "",
    workSchedule: "",
    workLocation: "",
    supervisorId: "",
    driverLicenseExpiry: "",
    workPermitExpiry: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
      email: ""
    },
    secondaryContact: {
      name: "",
      relationship: "",
      phone: "",
      email: ""
    },
    performanceRating: 0,
    notes: ""
  })

  useEffect(() => {
    if (open) {
      fetchManagers()
      if (employee) {
        setFormData({
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone || "",
          dateOfBirth: employee.dateOfBirth || "",
          gender: employee.gender || "prefer-not-to-say",
          trn: employee.trn || "",
          nisNumber: employee.nisNumber || "",
          nhtNumber: employee.nhtNumber || "",
          maritalStatus: employee.maritalStatus || "single",
          hireDate: employee.hireDate || "",
          contractStartDate: employee.contractStartDate || "",
          contractEndDate: employee.contractEndDate || "",
          address: employee.address || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "Jamaica"
          },
          position: employee.position,
          department: employee.department,
          managerId: employee.managerId || "none",
          salary: employee.salary,
          hourlyRate: employee.hourlyRate || 0,
          employmentType: employee.employmentType,
          status: employee.status,
          payFrequency: employee.payFrequency || "monthly",
          paymentMethod: employee.paymentMethod || "bank-transfer",
          bankName: employee.bankName || "",
          bankAccountNumber: employee.bankAccountNumber || "",
          workSchedule: employee.workSchedule || "",
          workLocation: employee.workLocation || "",
          supervisorId: employee.supervisorId || "",
          driverLicenseExpiry: employee.driverLicenseExpiry || "",
          workPermitExpiry: employee.workPermitExpiry || "",
          emergencyContact: {
            name: employee.emergencyContact?.name || "",
            relationship: employee.emergencyContact?.relationship || "",
            phone: employee.emergencyContact?.phone || "",
            email: employee.emergencyContact?.email || ""
          },
          secondaryContact: {
            name: employee.secondaryContact?.name || "",
            relationship: employee.secondaryContact?.relationship || "",
            phone: employee.secondaryContact?.phone || "",
            email: employee.secondaryContact?.email || ""
          },
          performanceRating: employee.performanceRating || 0,
          notes: employee.notes || ""
        })
      } else {
        resetForm()
      }
    }
  }, [open, employee])

  const fetchManagers = async () => {
    try {
      const { apiClient } = await import("@/lib/api-client")
      const employees = await apiClient.getEmployees()
      setManagers(employees.filter((emp: any) => emp.status === 'active'))
    } catch (error) {
      console.error('Failed to fetch managers:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      employeeId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "prefer-not-to-say",
      trn: "",
      nisNumber: "",
      nhtNumber: "",
      maritalStatus: "single",
      hireDate: "",
      contractStartDate: "",
      contractEndDate: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Jamaica"
      },
      position: "",
      department: "",
      managerId: "none",
      salary: 0,
      hourlyRate: 0,
      employmentType: "full-time",
      status: "active",
      payFrequency: "monthly",
      paymentMethod: "bank-transfer",
      bankName: "",
      bankAccountNumber: "",
      workSchedule: "",
      workLocation: "",
      supervisorId: "",
      driverLicenseExpiry: "",
      workPermitExpiry: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
        email: ""
      },
      secondaryContact: {
        name: "",
        relationship: "",
        phone: "",
        email: ""
      },
      performanceRating: 0,
      notes: ""
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation for required fields only
    const requiredFields = {
      employeeId: formData.employeeId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      position: formData.position,
      department: formData.department,
      salary: formData.salary
    }
    
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key]) => key)
    
    if (missingFields.length > 0) {
      toast({
        title: "Error",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      const { apiClient } = await import("@/lib/api-client")

      let data
      if (employee) {
        data = await apiClient.updateEmployee(employee._id, formData)
      } else {
        data = await apiClient.createEmployee({
          ...formData,
          companyId: company?.id || "company-1",
          createdBy: company?.id || "company-1", // Add createdBy field
        })
      }
      
      if (data.success) {
        toast({
          title: "Success",
          description: employee ? "Employee updated successfully" : "Employee added successfully",
        })
        onSuccess()
        onOpenChange(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save employee",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to save employee:', error)
      toast({
        title: "Error",
        description: "Failed to save employee",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            {employee ? "Update employee information below." : "Enter the details for the new employee."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>Employee's personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID *</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    required
                    placeholder="EMP-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal & Identity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal & Identity</CardTitle>
              <CardDescription>Personal details and identification information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value: any) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trn">TRN (Taxpayer Registration Number)</Label>
                  <Input
                    id="trn"
                    value={formData.trn}
                    onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                    placeholder="123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select value={formData.maritalStatus} onValueChange={(value: any) => setFormData({ ...formData, maritalStatus: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nisNumber">NIS Number</Label>
                  <Input
                    id="nisNumber"
                    value={formData.nisNumber}
                    onChange={(e) => setFormData({ ...formData, nisNumber: e.target.value })}
                    placeholder="NIS-123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nhtNumber">NHT Number</Label>
                  <Input
                    id="nhtNumber"
                    value={formData.nhtNumber}
                    onChange={(e) => setFormData({ ...formData, nhtNumber: e.target.value })}
                    placeholder="NHT-123456"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address</CardTitle>
              <CardDescription>Employee's home address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, street: e.target.value }
                  })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, city: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, state: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Information</CardTitle>
              <CardDescription>Employee's role and compensation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type *</Label>
                  <Select value={formData.employmentType} onValueChange={(value: any) => setFormData({ ...formData, employmentType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managerId">Manager</Label>
                  <Select value={formData.managerId || "none"} onValueChange={(value) => setFormData({ ...formData, managerId: value === "none" ? "" : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Manager</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem key={manager._id} value={manager._id}>
                          {manager.firstName} {manager.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary ($)</Label>
                  <Input
                    id="salary"
                    type="number"
                    min="0"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {employee && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on-leave">On Leave</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment & Contract Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employment & Contract</CardTitle>
              <CardDescription>Employment dates, contract information, and work details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payFrequency">Pay Frequency</Label>
                  <Select value={formData.payFrequency} onValueChange={(value: any) => setFormData({ ...formData, payFrequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractStartDate">Contract Start Date</Label>
                  <Input
                    id="contractStartDate"
                    type="date"
                    value={formData.contractStartDate}
                    onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractEndDate">Contract End Date</Label>
                  <Input
                    id="contractEndDate"
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workLocation">Work Location</Label>
                  <Input
                    id="workLocation"
                    value={formData.workLocation}
                    onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                    placeholder="e.g., May Pen Warehouse"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workSchedule">Work Schedule</Label>
                <Input
                  id="workSchedule"
                  value={formData.workSchedule}
                  onChange={(e) => setFormData({ ...formData, workSchedule: e.target.value })}
                  placeholder="e.g., Mon-Fri, 9-5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Banking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Banking Information</CardTitle>
              <CardDescription>Bank details for salary payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g., National Commercial Bank"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance & Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance & Documents</CardTitle>
              <CardDescription>Important dates and document expiry information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverLicenseExpiry">Driver's License Expiry</Label>
                  <Input
                    id="driverLicenseExpiry"
                    type="date"
                    value={formData.driverLicenseExpiry}
                    onChange={(e) => setFormData({ ...formData, driverLicenseExpiry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workPermitExpiry">Work Permit Expiry</Label>
                  <Input
                    id="workPermitExpiry"
                    type="date"
                    value={formData.workPermitExpiry}
                    onChange={(e) => setFormData({ ...formData, workPermitExpiry: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
              <CardDescription>Contact information for emergencies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyEmail">Email</Label>
                  <Input
                    id="emergencyEmail"
                    type="email"
                    value={formData.emergencyContact.email}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergencyContact: { ...formData.emergencyContact, email: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Secondary Contact</CardTitle>
              <CardDescription>Alternative emergency contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondaryName">Contact Name</Label>
                  <Input
                    id="secondaryName"
                    value={formData.secondaryContact.name}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      secondaryContact: { ...formData.secondaryContact, name: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryRelationship">Relationship</Label>
                  <Input
                    id="secondaryRelationship"
                    value={formData.secondaryContact.relationship}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      secondaryContact: { ...formData.secondaryContact, relationship: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondaryPhone">Phone</Label>
                  <Input
                    id="secondaryPhone"
                    value={formData.secondaryContact.phone}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      secondaryContact: { ...formData.secondaryContact, phone: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryEmail">Email</Label>
                  <Input
                    id="secondaryEmail"
                    type="email"
                    value={formData.secondaryContact.email}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      secondaryContact: { ...formData.secondaryContact, email: e.target.value }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance & Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance & Additional Information</CardTitle>
              <CardDescription>Performance rating and additional notes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="performanceRating">Performance Rating (1-10)</Label>
                <Input
                  id="performanceRating"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.performanceRating}
                  onChange={(e) => setFormData({ ...formData, performanceRating: parseInt(e.target.value) || 0 })}
                  placeholder="Rate from 1 to 10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional notes about this employee..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : employee ? "Update Employee" : "Add Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
