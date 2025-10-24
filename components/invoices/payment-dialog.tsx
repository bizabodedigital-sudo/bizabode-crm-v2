"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Invoice, Payment } from "@/lib/types"
import { useQuotesInvoicesStore } from "@/lib/quotes-invoices-store"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: Invoice
  onSuccess: () => void
}

export function PaymentDialog({ open, onOpenChange, invoice, onSuccess }: PaymentDialogProps) {
  const { addPayment } = useQuotesInvoicesStore()
  const { company } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    amount: 0,
    method: "card" as Payment["method"],
    reference: "",
    notes: "",
  })

  useEffect(() => {
    if (invoice && open) {
      const remainingAmount = invoice.total - invoice.paidAmount
      setFormData({
        amount: remainingAmount,
        method: "card",
        reference: "",
        notes: "",
      })
    }
  }, [invoice, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!invoice) return

    const remainingAmount = invoice.total - invoice.paidAmount
    if (formData.amount > remainingAmount) {
      toast({
        title: "Invalid amount",
        description: `Payment amount cannot exceed remaining balance of $${remainingAmount.toFixed(2)}`,
        variant: "destructive",
      })
      return
    }

    try {
      if (!company?.id) {
        toast({
          title: "Error",
          description: "Company information is missing. Please log in again.",
          variant: "destructive",
        })
        return
      }

      await addPayment({
        ...formData,
        companyId: company.id,
        invoiceId: (invoice as any)._id || invoice.id,
        reference: formData.reference || `PAY-${Date.now()}`, // Auto-generate if empty
      })

      toast({
        title: "Payment recorded",
        description: `Payment of $${formData.amount.toFixed(2)} has been recorded.`,
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      })
    }
  }

  if (!invoice) return null

  const remainingAmount = invoice.total - invoice.paidAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Record a payment for invoice {invoice.invoiceNumber}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Invoice Total:</span>
              <span className="font-mono font-medium">${invoice.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Already Paid:</span>
              <span className="font-mono font-medium">${invoice.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Remaining:</span>
              <span className="font-mono">${remainingAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              min="0.01"
              max={remainingAmount}
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => setFormData({ ...formData, method: value as Payment["method"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="Transaction ID, check number, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional payment details..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Record Payment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
