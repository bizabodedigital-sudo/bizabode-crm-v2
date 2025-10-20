"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface Attendance {
  _id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  breakStart?: string
  breakEnd?: string
  status: 'present' | 'absent' | 'late' | 'half-day' | 'sick' | 'vacation' | 'holiday'
  notes?: string
}

interface AttendanceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance?: Attendance | null
  onSuccess: () => void
}

export function AttendanceFormDialog({ open, onOpenChange, attendance, onSuccess }: AttendanceFormDialogProps) {
  const { company } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<Array<{_id: string, firstName: string, lastName: string, employeeId: string}>>([])
  
  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    checkIn: "",
    checkOut: "",
    breakStart: "",
    breakEnd: "",
    status: "present" as const,
    notes: ""
  })

  useEffect(() => {
    if (open) {
      fetchEmployees()
      if (attendance) {
        setFormData({
          employeeId: attendance.employeeId,
          date: attendance.date.split('T')[0],
          checkIn: attendance.checkIn ? attendance.checkIn.split('T')[1].substring(0, 5) : "",
          checkOut: attendance.checkOut ? attendance.checkOut.split('T')[1].substring(0, 5) : "",
          breakStart: attendance.breakStart ? attendance.breakStart.split('T')[1].substring(0, 5) : "",
          breakEnd: attendance.breakEnd ? attendance.breakEnd.split('T')[1].substring(0, 5) : "",
          status: attendance.status,
          notes: attendance.notes || ""
        })
      } else {
        resetForm()
      }
    }
  }, [open, attendance])

  const getAuthHeaders = () => {
    const token = localStorage.getItem("bizabode_token")
    return token
      ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      : { 'Content-Type': 'application/json' }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees', {
        headers: getAuthHeaders()
      })
      const data = await response.json()
      if (data.success) {
        setEmployees(data.data.filter((emp: any) => emp.status === 'active'))
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      employeeId: "",
      date: new Date().toISOString().split('T')[0],
      checkIn: "",
      checkOut: "",
      breakStart: "",
      breakEnd: "",
      status: "present",
      notes: ""
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.employeeId || !formData.date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      const url = attendance ? `/api/attendance/${attendance._id}` : '/api/attendance'
      const method = attendance ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        checkIn: formData.checkIn ? `${formData.date}T${formData.checkIn}:00.000Z` : undefined,
        checkOut: formData.checkOut ? `${formData.date}T${formData.checkOut}:00.000Z` : undefined,
        breakStart: formData.breakStart ? `${formData.date}T${formData.breakStart}:00.000Z` : undefined,
        breakEnd: formData.breakEnd ? `${formData.date}T${formData.breakEnd}:00.000Z` : undefined,
        date: `${formData.date}T00:00:00.000Z`
      }
      
      const getAuthHeaders = () => {
        const token = localStorage.getItem("bizabode_token")
        return token
          ? {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          : { 'Content-Type': 'application/json' }
      }

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: attendance ? "Attendance updated successfully" : "Attendance recorded successfully",
        })
        onSuccess()
        onOpenChange(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save attendance",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to save attendance:', error)
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{attendance ? "Edit Attendance" : "Record Attendance"}</DialogTitle>
          <DialogDescription>
            {attendance ? "Update attendance information below." : "Record employee attendance for a specific date."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee *</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                disabled={!!attendance}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName} ({employee.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check In Time</Label>
              <Input
                id="checkIn"
                type="time"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut">Check Out Time</Label>
              <Input
                id="checkOut"
                type="time"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breakStart">Break Start Time</Label>
              <Input
                id="breakStart"
                type="time"
                value={formData.breakStart}
                onChange={(e) => setFormData({ ...formData, breakStart: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breakEnd">Break End Time</Label>
              <Input
                id="breakEnd"
                type="time"
                value={formData.breakEnd}
                onChange={(e) => setFormData({ ...formData, breakEnd: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
                <SelectItem value="sick">Sick</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional notes about attendance..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : attendance ? "Update Attendance" : "Record Attendance"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
