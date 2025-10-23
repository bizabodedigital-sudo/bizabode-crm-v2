"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, DollarSign } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getAuthHeaders } from "@/lib/utils/auth-headers"

interface PayrollItem {
  type: 'salary' | 'overtime' | 'bonus' | 'commission' | 'allowance' | 'deduction'
  description: string
  amount: number
  taxable: boolean
}

interface Payroll {
  _id: string
  employeeId: string
  payPeriod: {
    startDate: string
    endDate: string
  }
  items: PayrollItem[]
  status: 'draft' | 'approved' | 'paid' | 'cancelled'
  paymentDate?: string
  paymentMethod?: 'bank_transfer' | 'check' | 'cash'
  notes?: string
}

interface PayrollFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payroll?: Payroll | null
  onSuccess: () => void
}

export function PayrollFormDialog({ open, onOpenChange, payroll, onSuccess }: PayrollFormDialogProps) {
  const { company } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<Array<{_id: string, firstName: string, lastName: string, employeeId: string, salary: number}>>([])
  
  const [formData, setFormData] = useState({
    employeeId: "",
    payPeriod: {
      startDate: "",
      endDate: ""
    },
    items: [] as PayrollItem[],
    status: "draft" as 'draft' | 'approved' | 'paid' | 'cancelled',
    paymentDate: "",
    paymentMethod: "bank_transfer" as 'bank_transfer' | 'check' | 'cash',
    notes: ""
  })

  useEffect(() => {
    if (open) {
      fetchEmployees()
      if (payroll) {
        setFormData({
          employeeId: payroll.employeeId,
          payPeriod: {
            startDate: payroll.payPeriod.startDate.split('T')[0],
            endDate: payroll.payPeriod.endDate.split('T')[0]
          },
          items: payroll.items,
          status: payroll.status,
          paymentDate: payroll.paymentDate ? payroll.paymentDate.split('T')[0] : "",
          paymentMethod: payroll.paymentMethod || "bank_transfer",
          notes: payroll.notes || ""
        })
      } else {
        resetForm()
      }
    }
  }, [open, payroll])


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
      payPeriod: {
        startDate: "",
        endDate: ""
      },
      items: [],
      status: "draft",
      paymentDate: "",
      paymentMethod: "bank_transfer",
      notes: ""
    })
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setFormData({ ...formData, items: updatedItems })
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { type: 'salary', description: '', amount: 0, taxable: true }]
    })
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: updatedItems })
  }

  const calculateTotals = () => {
    const grossPay = formData.items.reduce((sum, item) => sum + item.amount, 0)
    const deductions = formData.items.filter(item => item.type === 'deduction').reduce((sum, item) => sum + item.amount, 0)
    const netPay = grossPay - deductions
    return { grossPay, deductions, netPay }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.employeeId || !formData.payPeriod.startDate || !formData.payPeriod.endDate || formData.items.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one payroll item",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      const url = payroll ? `/api/payroll/${payroll._id}` : '/api/payroll'
      const method = payroll ? 'PUT' : 'POST'
      
      const { grossPay, deductions, netPay } = calculateTotals()
      
      const payload = {
        ...formData,
        payPeriod: {
          startDate: `${formData.payPeriod.startDate}T00:00:00.000Z`,
          endDate: `${formData.payPeriod.endDate}T23:59:59.999Z`
        },
        grossPay,
        deductions,
        netPay,
        paymentDate: formData.paymentDate ? `${formData.paymentDate}T00:00:00.000Z` : undefined
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
        headers: getAuthHeaders() as HeadersInit,
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: payroll ? "Payroll updated successfully" : "Payroll processed successfully",
        })
        onSuccess()
        onOpenChange(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save payroll",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to save payroll:', error)
      toast({
        title: "Error",
        description: "Failed to save payroll",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totals = calculateTotals()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{payroll ? "Edit Payroll" : "Process Payroll"}</DialogTitle>
          <DialogDescription>
            {payroll ? "Update payroll information below." : "Create a new payroll record for an employee."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee *</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                disabled={!!payroll}
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Pay Period Start *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.payPeriod.startDate}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  payPeriod: { ...formData.payPeriod, startDate: e.target.value }
                })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Pay Period End *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.payPeriod.endDate}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  payPeriod: { ...formData.payPeriod, endDate: e.target.value }
                })}
                required
              />
            </div>
          </div>

          {/* Payroll Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payroll Items</CardTitle>
              <CardDescription>Add salary components, bonuses, and deductions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border p-3 rounded-md">
                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-type`}>Type</Label>
                    <Select
                      value={item.type}
                      onValueChange={(value: any) => handleItemChange(index, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salary">Salary</SelectItem>
                        <SelectItem value="overtime">Overtime</SelectItem>
                        <SelectItem value="bonus">Bonus</SelectItem>
                        <SelectItem value="commission">Commission</SelectItem>
                        <SelectItem value="allowance">Allowance</SelectItem>
                        <SelectItem value="deduction">Deduction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-description`}>Description</Label>
                    <Input
                      id={`item-${index}-description`}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      placeholder="Item description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-amount`}>Amount</Label>
                    <Input
                      id={`item-${index}-amount`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.amount}
                      onChange={(e) => handleItemChange(index, "amount", parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`item-${index}-taxable`}>Taxable</Label>
                    <Select
                      value={item.taxable.toString()}
                      onValueChange={(value) => handleItemChange(index, "taxable", value === "true")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional notes about this payroll..."
            />
          </div>

          {/* Totals Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payroll Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Gross Pay</p>
                  <p className="text-2xl font-bold">${(totals.grossPay || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deductions</p>
                  <p className="text-2xl font-bold text-red-600">${(totals.deductions || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Pay</p>
                  <p className="text-2xl font-bold text-green-600">${(totals.netPay || totals.grossPay || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : payroll ? "Update Payroll" : "Process Payroll"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
