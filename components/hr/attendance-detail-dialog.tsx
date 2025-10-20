"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Clock, Calendar, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
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

interface AttendanceDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance: Attendance | null
}

export function AttendanceDetailDialog({ open, onOpenChange, attendance }: AttendanceDetailDialogProps) {
  if (!attendance) return null

  const getStatusBadge = (status: string) => {
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
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'late':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getStatusIcon(attendance.status)}
            Attendance Record
          </DialogTitle>
          <DialogDescription>
            {format(new Date(attendance.date), 'EEEE, MMMM dd, yyyy')}
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
                    {attendance.employeeId.firstName} {attendance.employeeId.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {attendance.employeeId.employeeId} • {attendance.employeeId.position}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {attendance.employeeId.department}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attendance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(attendance.date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(attendance.status)}
                    {getStatusBadge(attendance.status)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Check In</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      {attendance.checkIn ? format(new Date(attendance.checkIn), 'h:mm a') : 'Not recorded'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check Out</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="font-medium">
                      {attendance.checkOut ? format(new Date(attendance.checkOut), 'h:mm a') : 'Not recorded'}
                    </span>
                  </div>
                </div>
              </div>

              {(attendance.breakStart || attendance.breakEnd) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Break Start</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">
                          {attendance.breakStart ? format(new Date(attendance.breakStart), 'h:mm a') : 'Not recorded'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Break End</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">
                          {attendance.breakEnd ? format(new Date(attendance.breakEnd), 'h:mm a') : 'Not recorded'}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <div className="text-2xl font-bold text-primary">
                    {attendance.totalHours.toFixed(1)}h
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overtime Hours</p>
                  <div className="text-2xl font-bold text-orange-600">
                    {attendance.overtimeHours.toFixed(1)}h
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {attendance.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{attendance.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Approval Information */}
          {attendance.approvedBy && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approval Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Approved by:</span>
                  <span>{attendance.approvedBy.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Approved on:</span>
                  <span>{attendance.approvedAt ? format(new Date(attendance.approvedAt), 'MMM dd, yyyy h:mm a') : 'N/A'}</span>
                </div>
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
                <span>{format(new Date(attendance.createdAt), 'MMM dd, yyyy h:mm a')}</span>
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
