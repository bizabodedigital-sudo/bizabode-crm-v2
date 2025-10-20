"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
  email: string
  name: string
  role: string
  employeeId?: {
    _id: string
    employeeId: string
    firstName: string
    lastName: string
  }
  isActive: boolean
}

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  onSuccess: () => void
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const { company } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<Array<{_id: string, employeeId: string, firstName: string, lastName: string}>>([])
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "viewer" as const,
    employeeId: "none",
    isActive: true
  })

  useEffect(() => {
    if (open) {
      fetchEmployees()
      if (user) {
        setFormData({
          email: user.email,
          password: "",
          name: user.name,
          role: user.role as any,
          employeeId: user.employeeId?._id || "none",
          isActive: user.isActive
        })
      } else {
        resetForm()
      }
    }
  }, [open, user])

  const fetchEmployees = async () => {
    try {
      const { apiClient } = await import("@/lib/api-client")
      const data = await apiClient.getEmployees()
      setEmployees(data.filter((emp: any) => emp.status === 'active'))
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      role: "viewer",
      employeeId: "none",
      isActive: true
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.name || !formData.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!user && !formData.password) {
      toast({
        title: "Error",
        description: "Password is required for new users",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const { apiClient } = await import("@/lib/api-client")

      const submitData = {
        ...formData,
        employeeId: formData.employeeId === "none" ? null : formData.employeeId,
        companyId: company?.id
      }

      if (user) {
        await apiClient.updateUser(user._id, formData.password ? submitData : { ...submitData, password: undefined })
        toast({
          title: "Success",
          description: "User updated successfully",
        })
      } else {
        await apiClient.createUser(submitData)
        toast({
          title: "Success",
          description: "User created successfully",
        })
      }

      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      console.error('Failed to save user:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
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
          <DialogTitle>{user ? "Edit User" : "Create New User"}</DialogTitle>
          <DialogDescription>
            {user ? "Update user information and access." : "Create a new user account with role-based permissions."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
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
                disabled={isLoading || !!user}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {user ? "(leave blank to keep current)" : "*"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!user}
                disabled={isLoading}
                placeholder={user ? "••••••••" : "Enter password"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full Access</SelectItem>
                  <SelectItem value="manager">Manager - Most Features</SelectItem>
                  <SelectItem value="sales">Sales - CRM & Customers</SelectItem>
                  <SelectItem value="warehouse">Warehouse - Inventory & Orders</SelectItem>
                  <SelectItem value="viewer">Viewer - Read-only Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employeeId">Link to Employee (Optional)</Label>
            <Select 
              value={formData.employeeId || "none"} 
              onValueChange={(value) => setFormData({ ...formData, employeeId: value === "none" ? "none" : value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Employee Link</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} ({employee.employeeId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Link this user account to an employee for integrated time tracking and HR features
            </p>
          </div>

          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Inactive users cannot log in to the system
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : user ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
