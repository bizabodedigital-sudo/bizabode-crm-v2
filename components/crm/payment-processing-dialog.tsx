"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Invoice } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"
import { Loader2 } from "lucide-react"

interface PaymentProcessingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: Invoice
  onSuccess: () => void
}

export function PaymentProcessingDialog({ open, onOpenChange, invoice, onSuccess }: PaymentProcessingDialogProps) {
  const { company, user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    amount: 0,
    paymentMethod: "Bank Transfer",
    paymentDate: "",
    referenceNumber: "",
    notes: "",
  })

  useEffect(() => {
    if (invoice && open) {
      const remainingAmount = invoice.total - (invoice.paidAmount || 0)
      
      setFormData({
        amount: remainingAmount,
        paymentMethod: "Bank Transfer",
        paymentDate: new Date().toISOString().split("T")[0],
        referenceNumber: "",
        notes: "",
      })
    }
  }, [invoice, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!invoice || !company?.id) {
      toast({
        title: "Error",
        description: "Invoice or company information is missing",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!formData.amount || !formData.paymentDate || !formData.paymentMethod) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const remainingAmount = invoice.total - (invoice.paidAmount || 0)
    if (formData.amount > remainingAmount) {
      toast({
        title: "Validation Error",
        description: `Payment amount cannot exceed remaining balance of $${remainingAmount.toFixed(2)}`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Create the payment record
      const paymentData = {
        companyId: company.id,
        invoiceId: invoice.id,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        paymentDate: new Date(formData.paymentDate),
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined,
        createdBy: user?.id || "",
      }

      const paymentResponse = await api.crm.payments.create(paymentData)

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.error || "Failed to record payment")
      }

      // Step 2: Update the invoice with payment information
      const newPaidAmount = (invoice.paidAmount || 0) + formData.amount
      const isFullyPaid = newPaidAmount >= invoice.total
      
      const invoiceUpdateData = {
        paidAmount: newPaidAmount,
        status: isFullyPaid ? "paid" : "sent",
        lastPaymentDate: new Date(formData.paymentDate),
        notes: `${invoice.notes || ""}\n\nPayment recorded: $${formData.amount.toFixed(2)} on ${formData.paymentDate}`,
      }

      const invoiceUpdateResponse = await api.crm.invoices.update(invoice.id, invoiceUpdateData)

      if (invoiceUpdateResponse.success) {
        toast({
          title: "Success",
          description: `Payment of $${formData.amount.toFixed(2)} recorded successfully`,
        })
        
        if (isFullyPaid) {
          toast({
            title: "Invoice Paid",
            description: "Invoice has been fully paid",
          })
        }
      } else {
        toast({
          title: "Partial Success",
          description: "Payment recorded but invoice update failed",
          variant: "destructive",
        })
      }

      onOpenChange(false)
      onSuccess()

    } catch (error) {
      console.error("Failed to process payment:", error)
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!invoice) return null

  const remainingAmount = invoice.total - (invoice.paidAmount || 0)
  const isFullyPaid = remainingAmount <= 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Record a payment for invoice "{invoice.invoiceNumber}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
              <CardDescription>Current invoice status and amounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Invoice Number:</span> {invoice.invoiceNumber}
                </div>
                <div>
                  <span className="font-medium">Customer:</span> {invoice.customerName}
                </div>
                <div>
                  <span className="font-medium">Total Amount:</span> ${invoice.total.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Paid Amount:</span> ${(invoice.paidAmount || 0).toFixed(2)}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium">Remaining Balance:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">${remainingAmount.toFixed(2)}</span>
                  {isFullyPaid && <Badge variant="secondary" className="bg-green-500/10 text-green-700">Fully Paid</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>

          {!isFullyPaid && (
            <>
              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Enter the payment information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Payment Amount (JMD) *</Label>
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
                      <p className="text-xs text-muted-foreground">
                        Maximum: ${remainingAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentDate">Payment Date *</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method *</Label>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Mobile Payment">Mobile Payment</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referenceNumber">Reference Number</Label>
                      <Input
                        id="referenceNumber"
                        value={formData.referenceNumber}
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                        placeholder="Transaction/reference number"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Notes and additional details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Payment Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      placeholder="Additional notes about this payment"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {!isFullyPaid && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Record Payment"
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
