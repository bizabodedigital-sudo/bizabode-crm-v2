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
import { getAuthHeaders } from "@/lib/utils/auth-headers"
import { api, endpoints } from "@/lib/api-client-config"

interface LeaveRequest {
  _id: string
  employeeId: string
  leaveType: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'other'
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  notes?: string
}

interface LeaveFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leave?: LeaveRequest | null
  onSuccess: () => void
}

export function LeaveFormDialog({ open, onOpenChange, leave, onSuccess }: LeaveFormDialogProps) {
  const { company } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<Array<{_id: string, firstName: string, lastName: string, employeeId: string}>>([])
  
  const [formData, setFormData] = useState({
    employeeId: "",
    leaveType: "vacation" as 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'other',
    startDate: "",
    endDate: "",
    reason: "",
    status: "pending" as 'pending' | 'approved' | 'rejected' | 'cancelled',
    notes: ""
  })

  useEffect(() => {
    if (open) {
      fetchEmployees()
      if (leave) {
        setFormData({
          employeeId: leave.employeeId,
          leaveType: leave.leaveType,
          startDate: leave.startDate.split('T')[0],
          endDate: leave.endDate.split('T')[0],
          reason: leave.reason,
          status: leave.status,
          notes: leave.notes || ""
        })
      } else {
        resetForm()
      }
    }
  }, [open, leave])


  const fetchEmployees = async () => {
    try {
      const response = await api.get(endpoints.employees, {
        companyId: company?.id || ''
      })
      if (response.success) {
        setEmployees(response.data.filter((emp: any) => emp.status === 'active'))
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      employeeId: "",
      leaveType: "vacation",
      startDate: "",
      endDate: "",
      reason: "",
      status: "pending",
      notes: ""
    })
  }

  const calculateTotalDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      const payload = {
        ...formData,
        startDate: `${formData.startDate}T00:00:00.000Z`,
        endDate: `${formData.endDate}T23:59:59.999Z`,
        totalDays: calculateTotalDays()
      }
      
      const response = leave 
        ? await api.put(`${endpoints.hr.leaves}/${leave._id}`, payload)
        : await api.post(endpoints.hr.leaves, payload)
      
      if (response.success) {
        toast({
          title: "Success",
          description: leave ? "Leave request updated successfully" : "Leave request submitted successfully",
        })
        onSuccess()
        onOpenChange(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save leave request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to save leave request:', error)
      toast({
        title: "Error",
        description: "Failed to save leave request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalDays = calculateTotalDays()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{leave ? "Edit Leave Request" : "Request Leave"}</DialogTitle>
          <DialogDescription>
            {leave ? "Update leave request information below." : "Submit a new leave request for an employee."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee *</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                disabled={!!leave}
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
              <Label htmlFor="leaveType">Leave Type *</Label>
              <Select
                value={formData.leaveType}
                onValueChange={(value: any) => setFormData({ ...formData, leaveType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="maternity">Maternity</SelectItem>
                  <SelectItem value="paternity">Paternity</SelectItem>
                  <SelectItem value="bereavement">Bereavement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          {totalDays > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Total Days:</div>
              <div className="text-lg font-semibold">{totalDays} {totalDays === 1 ? 'day' : 'days'}</div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
              placeholder="Please provide a reason for this leave request..."
              required
            />
          </div>

          {leave && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional notes or comments..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : leave ? "Update Leave Request" : "Submit Leave Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
