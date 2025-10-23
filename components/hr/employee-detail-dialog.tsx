"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, MapPin, Building, DollarSign, Calendar, Users, FileText, CreditCard, Clock, Shield, Star, AlertTriangle, UserCheck, Calendar as CalendarIcon, Banknote } from "lucide-react"
import { format } from "date-fns"

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
  managerId?: {
    _id: string
    firstName: string
    lastName: string
    position: string
  }
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
  documents?: Array<{
    type: string
    name: string
    url: string
    uploadedAt: string
  }>
  notes?: string
  createdBy: {
    name: string
    email: string
  }
  createdAt: string
}

interface EmployeeDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
}

export function EmployeeDetailDialog({ open, onOpenChange, employee }: EmployeeDetailDialogProps) {
  if (!employee) return null

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      terminated: "bg-red-100 text-red-800",
      'on-leave': "bg-yellow-100 text-yellow-800"
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    )
  }

  const getEmploymentTypeBadge = (type: string) => {
    const colors = {
      'full-time': "bg-blue-100 text-blue-800",
      'part-time': "bg-purple-100 text-purple-800",
      'contract': "bg-orange-100 text-orange-800",
      'intern': "bg-pink-100 text-pink-800"
    }

    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors]}>
        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-6 w-6" />
            {employee.firstName} {employee.lastName}
          </DialogTitle>
          <DialogDescription>
            Employee ID: {employee.employeeId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Type */}
          <div className="flex items-center gap-4">
            {getStatusBadge(employee.status)}
            {getEmploymentTypeBadge(employee.employmentType)}
            <span className="text-sm text-muted-foreground">
              Hired {employee.hireDate ? format(new Date(employee.hireDate), 'MMM dd, yyyy') : 'N/A'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                )}
                {employee.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {employee.address.street}, {employee.address.city}, {employee.address.state} {employee.address.zipCode}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.department}</span>
                </div>
                {employee.managerId && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Reports to: {employee.managerId.firstName} {employee.managerId.lastName}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    ${(employee.salary || 0).toLocaleString()}/year
                    {employee.hourlyRate && ` ($${employee.hourlyRate}/hour)`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          {employee.emergencyContact && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{employee.emergencyContact.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({employee.emergencyContact.relationship})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.emergencyContact.phone}</span>
                </div>
                {employee.emergencyContact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.emergencyContact.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {employee.documents && employee.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {employee.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="text-sm font-medium">{doc.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({doc.type})
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal & Identity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Personal & Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {employee.dateOfBirth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Date of Birth:</span> {format(new Date(employee.dateOfBirth), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {employee.gender && employee.gender !== 'prefer-not-to-say' && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Gender:</span> {employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1)}
                  </span>
                </div>
              )}
              {employee.trn && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">TRN:</span> {employee.trn}
                  </span>
                </div>
              )}
              {employee.maritalStatus && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Marital Status:</span> {employee.maritalStatus.charAt(0).toUpperCase() + employee.maritalStatus.slice(1)}
                  </span>
                </div>
              )}
              {employee.nisNumber && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">NIS Number:</span> {employee.nisNumber}
                  </span>
                </div>
              )}
              {employee.nhtNumber && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">NHT Number:</span> {employee.nhtNumber}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment & Contract Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Employment & Contract
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {employee.hireDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Hire Date:</span> {format(new Date(employee.hireDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {employee.contractStartDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Contract Start:</span> {format(new Date(employee.contractStartDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {employee.contractEndDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Contract End:</span> {format(new Date(employee.contractEndDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              {employee.payFrequency && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Pay Frequency:</span> {employee.payFrequency.charAt(0).toUpperCase() + employee.payFrequency.slice(1)}
                  </span>
                </div>
              )}
              {employee.paymentMethod && (
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Payment Method:</span> {employee.paymentMethod.replace('-', ' ').charAt(0).toUpperCase() + employee.paymentMethod.replace('-', ' ').slice(1)}
                  </span>
                </div>
              )}
              {employee.workLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Work Location:</span> {employee.workLocation}
                  </span>
                </div>
              )}
              {employee.workSchedule && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Work Schedule:</span> {employee.workSchedule}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Banking Information */}
          {(employee.bankName || employee.bankAccountNumber) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {employee.bankName && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Bank:</span> {employee.bankName}
                    </span>
                  </div>
                )}
                {employee.bankAccountNumber && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Account:</span> {employee.bankAccountNumber}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Compliance & Documents */}
          {(employee.driverLicenseExpiry || employee.workPermitExpiry) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Compliance & Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {employee.driverLicenseExpiry && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Driver's License Expiry:</span> {format(new Date(employee.driverLicenseExpiry), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
                {employee.workPermitExpiry && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Work Permit Expiry:</span> {format(new Date(employee.workPermitExpiry), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Secondary Contact */}
          {employee.secondaryContact && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Secondary Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{employee.secondaryContact.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({employee.secondaryContact.relationship})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.secondaryContact.phone}</span>
                </div>
                {employee.secondaryContact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.secondaryContact.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Performance & Additional Information */}
          {employee.performanceRating && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Performance & Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Performance Rating:</span> {employee.performanceRating}/10
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {employee.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{employee.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created by:</span>
                <span>{employee.createdBy.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created on:</span>
                <span>{format(new Date(employee.createdAt), 'MMM dd, yyyy')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
