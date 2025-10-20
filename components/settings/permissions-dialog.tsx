"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { rolePermissions } from "@/lib/utils/role-permissions"

interface User {
  _id: string
  name: string
  email: string
  role: string
  permissions?: Record<string, boolean>
}

interface PermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSuccess: () => void
}

export function PermissionsDialog({ open, onOpenChange, user, onSuccess }: PermissionsDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [permissions, setPermissions] = useState({
    canViewDashboard: true,
    canManageInventory: false,
    canManageCRM: false,
    canViewReports: false,
    canManageUsers: false,
    canManageSettings: false,
    canManageLicense: false,
    canManageProcurement: false,
    canManageAfterSales: false,
    canManageHR: false,
  })

  useEffect(() => {
    if (user && open) {
      // Load user's current permissions or role defaults
      const roleDefaults = rolePermissions[user.role as keyof typeof rolePermissions]
      const currentPermissions = user.permissions || roleDefaults || {}
      
      setPermissions({
        canViewDashboard: currentPermissions.canViewDashboard ?? true,
        canManageInventory: currentPermissions.canManageInventory ?? false,
        canManageCRM: currentPermissions.canManageCRM ?? false,
        canViewReports: currentPermissions.canViewReports ?? false,
        canManageUsers: currentPermissions.canManageUsers ?? false,
        canManageSettings: currentPermissions.canManageSettings ?? false,
        canManageLicense: currentPermissions.canManageLicense ?? false,
        canManageProcurement: currentPermissions.canManageProcurement ?? false,
        canManageAfterSales: currentPermissions.canManageAfterSales ?? false,
        canManageHR: currentPermissions.canManageHR ?? false,
      })
    }
  }, [user, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setIsLoading(true)
      const { apiClient } = await import("@/lib/api-client")

      await apiClient.updateUserPermissions(user._id, permissions)

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Failed to update permissions:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const permissionItems = [
    { key: 'canViewDashboard', label: 'View Dashboard', description: 'Access to main dashboard and overview' },
    { key: 'canManageInventory', label: 'Manage Inventory', description: 'Add, edit, and manage inventory items' },
    { key: 'canManageCRM', label: 'Manage CRM', description: 'Access leads, opportunities, quotes, and invoices' },
    { key: 'canViewReports', label: 'View Reports', description: 'Access analytics and reports' },
    { key: 'canManageHR', label: 'Manage HR', description: 'Access employee, attendance, and payroll features' },
    { key: 'canManageProcurement', label: 'Manage Procurement', description: 'Create purchase orders and manage suppliers' },
    { key: 'canManageAfterSales', label: 'Manage After-Sales', description: 'Handle customer feedback and support' },
    { key: 'canManageUsers', label: 'Manage Users', description: 'Create and manage user accounts' },
    { key: 'canManageSettings', label: 'Manage Settings', description: 'Configure system settings' },
    { key: 'canManageLicense', label: 'Manage License', description: 'View and update license information' },
  ]

  if (!user) return null

  const roleDefaults = rolePermissions[user.role as keyof typeof rolePermissions]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Permissions - {user.name}
          </DialogTitle>
          <DialogDescription>
            Customize permissions for this user. Role defaults are shown below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">{user.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Role:</span>{" "}
                  <Badge className="ml-2">{user.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Defaults Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Role-Based Defaults</p>
                <p className="text-xs">
                  The <strong>{user.role}</strong> role has default permissions. You can override these below for this specific user.
                </p>
              </div>
            </div>
          </div>

          {/* Permissions List */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Permissions</CardTitle>
                <CardDescription>
                  Toggle permissions for this user. Green indicates permission is granted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {permissionItems.map((item) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={item.key} className="text-sm font-medium">
                            {item.label}
                          </Label>
                          {roleDefaults[item.key as keyof typeof roleDefaults] && (
                            <Badge variant="outline" className="text-xs">Role Default</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <Switch
                        id={item.key}
                        checked={permissions[item.key as keyof typeof permissions]}
                        onCheckedChange={(checked) => 
                          setPermissions({ ...permissions, [item.key]: checked })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Permissions"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
