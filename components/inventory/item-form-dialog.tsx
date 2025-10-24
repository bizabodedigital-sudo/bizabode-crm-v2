"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { Item } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"
import { Loader2 } from "lucide-react"

interface ItemFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: Item
  onSuccess: () => void
}

export function ItemFormDialog({ open, onOpenChange, item, onSuccess }: ItemFormDialogProps) {
  const { company } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    category: "",
    quantity: 0,
    reorderLevel: 0,
    unitPrice: 0,
    critical: false,
  })

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku,
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        reorderLevel: item.reorderLevel,
        unitPrice: item.unitPrice,
        critical: item.critical || false,
      })
    } else {
      setFormData({
        sku: "",
        name: "",
        description: "",
        category: "",
        quantity: 0,
        reorderLevel: 0,
        unitPrice: 0,
        critical: false,
      })
    }
  }, [item, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!company?.id) {
      toast({
        title: "Error",
        description: "Company information is missing. Please log in again.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!formData.sku || !formData.name || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        companyId: company.id,
        ...formData,
      }

      let response
      if (item) {
        response = await api.inventory.items.update(item.id, submitData)
      } else {
        response = await api.inventory.items.create(submitData)
      }

      if (response.success) {
        toast({
          title: "Success",
          description: item ? "Item updated successfully" : "Item created successfully",
        })
        onOpenChange(false)
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to save item",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to save item:", error)
      toast({
        title: "Error",
        description: "Failed to save item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add New Item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update the item details below." : "Enter the details for the new inventory item."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: Number.parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price ($)</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number.parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="critical"
              checked={formData.critical}
              onCheckedChange={(checked) => setFormData({ ...formData, critical: !!checked })}
            />
            <Label htmlFor="critical" className="text-sm font-medium">
              Critical Item (Must-have inventory)
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {item ? "Updating..." : "Creating..."}
                </>
              ) : (
                item ? "Update Item" : "Add Item"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
