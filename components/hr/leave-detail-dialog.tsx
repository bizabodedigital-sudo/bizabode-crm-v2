"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
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
  notes?: string
  createdAt: string
}

interface LeaveDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leave: LeaveRequest | null
}

export function LeaveDetailDialog({ open, onOpenChange, leave }: LeaveDetailDialogProps) {
  if (!leave) return null

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
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(leave.status)}
            Leave Request Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive view of the leave request and its current status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-base">{leave.employeeId.firstName} {leave.employeeId.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                  <p className="text-base font-mono">{leave.employeeId.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Position</p>
                  <p className="text-base">{leave.employeeId.position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-base">{leave.employeeId.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leave Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Leave Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Leave Type</p>
                  <div className="mt-1">
                    {getTypeBadge(leave.leaveType)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusIcon(leave.status)}
                    {getStatusBadge(leave.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{format(new Date(leave.startDate), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{format(new Date(leave.endDate), 'MMMM dd, yyyy')}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Duration:</span>
                  <span className="text-lg font-bold text-primary">{leave.totalDays} days</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Reason</p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">{leave.reason}</p>
                </div>
              </div>

              {leave.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</p>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">{leave.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Status Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Requested By</p>
                  <p className="text-base">{leave.requestedBy.name}</p>
                  <p className="text-sm text-muted-foreground">{leave.requestedBy.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Request Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-base">{format(new Date(leave.createdAt), 'MMMM dd, yyyy h:mm a')}</p>
                  </div>
                </div>
              </div>

              {leave.approvedBy && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                      <p className="text-base">{leave.approvedBy.name}</p>
                      <p className="text-sm text-muted-foreground">{leave.approvedBy.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Approval Date</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-base">{leave.approvedAt ? format(new Date(leave.approvedAt), 'MMMM dd, yyyy h:mm a') : '-'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {leave.status === 'rejected' && leave.rejectionReason && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Rejection Reason</p>
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <p className="text-sm text-red-700">{leave.rejectionReason}</p>
                    </div>
                  </div>
                </>
              )}
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
