"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface Supplier {
  _id: string
  name: string
  email: string
  phone: string
  contactPerson: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  taxId: string
  isActive: boolean
}

interface SupplierFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  supplier?: Supplier | null
}

export function SupplierFormDialog({ open, onOpenChange, onSuccess, supplier }: SupplierFormDialogProps) {
  const { company } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    contactPerson: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    taxId: '',
    isActive: true
  })

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone || '',
        contactPerson: supplier.contactPerson || '',
        address: supplier.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US'
        },
        taxId: supplier.taxId || '',
        isActive: supplier.isActive
      })
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        contactPerson: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US'
        },
        taxId: '',
        isActive: true
      })
    }
  }, [supplier])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      const url = supplier 
        ? `/api/procurement/suppliers/${supplier._id}`
        : '/api/procurement/suppliers'
      
      const method = supplier ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          companyId: company?.id
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: supplier ? "Supplier updated successfully" : "Supplier created successfully",
        })
        onSuccess()
        onOpenChange(false)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save supplier",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to save supplier:', error)
      toast({
        title: "Error",
        description: "Failed to save supplier",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Edit Supplier' : 'Add New Supplier'}
          </DialogTitle>
          <DialogDescription>
            {supplier ? 'Update supplier information' : 'Add a new supplier to your system'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Enter contact person name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              placeholder="Enter tax ID"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Address</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, street: e.target.value }
                  })}
                  placeholder="Enter street address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, city: e.target.value }
                  })}
                  placeholder="Enter city"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, state: e.target.value }
                  })}
                  placeholder="Enter state"
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
                  placeholder="Enter ZIP code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.address.country}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, country: e.target.value }
                  })}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active Supplier</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (supplier ? 'Update Supplier' : 'Create Supplier')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
