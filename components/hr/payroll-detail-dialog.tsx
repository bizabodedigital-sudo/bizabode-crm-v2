"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, DollarSign, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

interface Payroll {
  _id: string
  employeeId?: {
    _id: string
    firstName: string
    lastName: string
    employeeId: string
    position: string
    department: string
  }
  payPeriod?: {
    startDate: string
    endDate: string
  }
  grossPay: number
  deductions: number
  netPay: number
  items?: Array<{
    type: 'salary' | 'overtime' | 'bonus' | 'commission' | 'allowance' | 'deduction'
    description: string
    amount: number
    taxable: boolean
  }>
  status?: 'draft' | 'approved' | 'paid' | 'cancelled'
  paymentDate?: string
  paymentMethod?: 'bank_transfer' | 'check' | 'cash'
  notes?: string
  processedBy?: {
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

interface PayrollDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payroll: Payroll | null
}

export function PayrollDetailDialog({ open, onOpenChange, payroll }: PayrollDetailDialogProps) {
  if (!payroll) return null

  const getStatusBadge = (status?: string) => {
    // Handle undefined/null status values
    if (!status) {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          Unknown
        </Badge>
      )
    }

    const colors = {
      draft: "bg-gray-100 text-gray-800",
      approved: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getStatusIcon = (status?: string) => {
    // Handle undefined/null status values
    if (!status) {
      return <Clock className="h-5 w-5 text-muted-foreground" />
    }

    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'approved':
        return <AlertTriangle className="h-5 w-5 text-blue-600" />
      case 'draft':
        return <Clock className="h-5 w-5 text-gray-600" />
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return '🏦'
      case 'check':
        return '📄'
      case 'cash':
        return '💵'
      default:
        return '💰'
    }
  }

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'salary':
        return 'text-blue-600'
      case 'overtime':
        return 'text-orange-600'
      case 'bonus':
        return 'text-green-600'
      case 'commission':
        return 'text-purple-600'
      case 'allowance':
        return 'text-cyan-600'
      case 'deduction':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getStatusIcon(payroll.status)}
            Payroll Record
          </DialogTitle>
          <DialogDescription>
            {payroll.payPeriod ? 
              `${format(new Date(payroll.payPeriod.startDate), 'MMM dd')} - ${format(new Date(payroll.payPeriod.endDate), 'MMM dd, yyyy')}` : 
              'Pay Period Not Available'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">
                    {payroll.employeeId?.firstName || 'Unknown'} {payroll.employeeId?.lastName || 'Employee'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {payroll.employeeId?.employeeId || 'N/A'} • {payroll.employeeId?.position || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {payroll.employeeId?.department || 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pay Period */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pay Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {payroll.payPeriod ? 
                    `${format(new Date(payroll.payPeriod.startDate), 'MMM dd, yyyy')} - ${format(new Date(payroll.payPeriod.endDate), 'MMM dd, yyyy')}` : 
                    'Pay Period Not Available'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payroll Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payroll Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payroll.items && payroll.items.length > 0 ? (
                  payroll.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${getItemTypeColor(item.type)}`}></div>
                      <div>
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {item.type} {item.taxable ? '(Taxable)' : '(Non-taxable)'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${item.type === 'deduction' ? 'text-red-600' : 'text-green-600'}`}>
                        {item.type === 'deduction' ? '-' : '+'}${item.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    No payroll items found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payroll Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payroll Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Gross Pay:</span>
                  <span className="font-medium">${payroll.grossPay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Deductions:</span>
                  <span className="font-medium text-red-600">-${payroll.deductions.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Net Pay:</span>
                  <span className="text-green-600">${payroll.netPay.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {payroll.paymentDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getPaymentMethodIcon(payroll.paymentMethod || '')}</span>
                  <div>
                    <div className="font-medium capitalize">
                      {payroll.paymentMethod?.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Paid on {format(new Date(payroll.paymentDate), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(payroll.status)}
                {getStatusBadge(payroll.status)}
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processed by:</span>
                <span>{payroll.processedBy?.name || 'Unknown'}</span>
              </div>
              
              {payroll.approvedBy && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Approved by:</span>
                    <span>{payroll.approvedBy.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Approved on:</span>
                    <span>{payroll.approvedAt ? format(new Date(payroll.approvedAt), 'MMM dd, yyyy h:mm a') : 'N/A'}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {payroll.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{payroll.notes}</p>
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
                <span className="text-muted-foreground">Created on:</span>
                <span>{format(new Date(payroll.createdAt), 'MMM dd, yyyy h:mm a')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
