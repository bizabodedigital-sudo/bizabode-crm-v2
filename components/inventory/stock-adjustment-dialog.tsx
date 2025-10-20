"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Item } from "@/lib/types"
import { useInventoryStore } from "@/lib/inventory-store"

interface StockAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: Item
  onSuccess: () => void
}

export function StockAdjustmentDialog({ open, onOpenChange, item, onSuccess }: StockAdjustmentDialogProps) {
  const { adjustStock } = useInventoryStore()
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add")
  const [quantity, setQuantity] = useState(0)
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (open) {
      setAdjustmentType("add")
      setQuantity(0)
      setReason("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!item) return

    try {
      const adjustment = adjustmentType === "add" ? quantity : -quantity
      await adjustStock((item as any)._id || item.id, adjustment, reason)
      onSuccess()
    } catch (error) {
      console.error("Failed to adjust stock:", error)
    }
  }

  if (!item) return null

  const newQuantity = adjustmentType === "add" ? item.quantity + quantity : item.quantity - quantity

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>Adjust the stock level for {item.name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Current Stock</Label>
            <div className="text-2xl font-bold">{item.quantity}</div>
          </div>

          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <RadioGroup value={adjustmentType} onValueChange={(value) => setAdjustmentType(value as "add" | "remove")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add" className="font-normal cursor-pointer">
                  Add Stock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="remove" id="remove" />
                <Label htmlFor="remove" className="font-normal cursor-pointer">
                  Remove Stock
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Received shipment, Damaged goods, etc."
              required
            />
          </div>

          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">New Stock Level:</span>
              <span className="text-lg font-bold">{newQuantity}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Adjustment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
