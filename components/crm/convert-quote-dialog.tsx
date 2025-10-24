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
import type { Quote, SalesOrder } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"
import { Loader2 } from "lucide-react"

interface ConvertQuoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote?: Quote
  onSuccess: () => void
}

export function ConvertQuoteDialog({ open, onOpenChange, quote, onSuccess }: ConvertQuoteDialogProps) {
  const router = useRouter()
  const { company, user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    deliveryDate: "",
    deliveryAddress: "",
    paymentTerms: "Net 30" as SalesOrder["paymentTerms"],
    driverName: "",
    driverPhone: "",
    deliveryNotes: "",
    notes: "",
  })

  useEffect(() => {
    if (quote && open) {
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 7) // Default to 1 week from now

      setFormData({
        deliveryDate: defaultDate.toISOString().split("T")[0],
        deliveryAddress: "",
        paymentTerms: "Net 30",
        driverName: "",
        driverPhone: "",
        deliveryNotes: "",
        notes: quote.notes || "",
      })
    }
  }, [quote, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!quote || !company?.id) {
      toast({
        title: "Error",
        description: "Quote or company information is missing",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!formData.deliveryDate) {
      toast({
        title: "Validation Error",
        description: "Please select a delivery date",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Create the sales order from the quote
      const salesOrderData = {
        companyId: company.id,
        orderNumber: `SO-${Date.now()}`,
        quoteId: quote.id,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        items: quote.items.map(item => ({
          itemId: item.itemId,
          name: item.name,
          description: "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: 0,
          total: item.total,
        })),
        subtotal: quote.subtotal,
        tax: quote.tax,
        taxRate: quote.taxRate,
        discount: quote.discount || 0,
        total: quote.total,
        orderDate: new Date(),
        deliveryDate: new Date(formData.deliveryDate),
        deliveryAddress: formData.deliveryAddress || undefined,
        paymentTerms: formData.paymentTerms,
        status: "Pending",
        notes: formData.notes || undefined,
        createdBy: user?.id || "",
        assignedTo: user?.id || undefined,
        driverName: formData.driverName || undefined,
        driverPhone: formData.driverPhone || undefined,
        deliveryNotes: formData.deliveryNotes || undefined,
      }

      const salesOrderResponse = await api.crm.salesOrders.create(salesOrderData)

      if (!salesOrderResponse.success) {
        throw new Error(salesOrderResponse.error || "Failed to create sales order")
      }

      // Step 2: Update the quote status to "accepted"
      const quoteUpdateResponse = await api.crm.quotes.update(quote.id, {
        status: "accepted",
        notes: `${quote.notes || ""}\n\nConverted to sales order: ${salesOrderData.orderNumber}`,
        convertedToOrderId: salesOrderResponse.data.id,
        convertedAt: new Date(),
      })

      if (quoteUpdateResponse.success) {
        toast({
          title: "Success",
          description: "Quote successfully converted to sales order",
        })
      } else {
        toast({
          title: "Partial Success", 
          description: "Sales order created but quote status update failed",
          variant: "destructive",
        })
      }

      onOpenChange(false)
      onSuccess()
      router.push("/crm/sales-orders")

    } catch (error) {
      console.error("Failed to convert quote:", error)
      toast({
        title: "Error",
        description: "Failed to convert quote to sales order",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!quote) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Convert Quote to Sales Order</DialogTitle>
          <DialogDescription>
            Convert quote "{quote.customerName}" to a sales order with delivery details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quote Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
              <CardDescription>Details from the original quote</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Customer:</span> {quote.customerName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {quote.customerEmail}
                </div>
                <div>
                  <span className="font-medium">Total Value:</span> ${quote.total.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Items:</span> {quote.items.length} item(s)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>Specify delivery details for the sales order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date *</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select
                    value={formData.paymentTerms}
                    onValueChange={(value) => setFormData({ ...formData, paymentTerms: value as SalesOrder["paymentTerms"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">Cash on Delivery</SelectItem>
                      <SelectItem value="Net 15">Net 15 Days</SelectItem>
                      <SelectItem value="Net 30">Net 30 Days</SelectItem>
                      <SelectItem value="Net 60">Net 60 Days</SelectItem>
                      <SelectItem value="Prepaid">Prepaid</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Textarea
                  id="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="Enter delivery address"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverName">Driver Name</Label>
                  <Input
                    id="driverName"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    placeholder="Assigned driver"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverPhone">Driver Phone</Label>
                  <Input
                    id="driverPhone"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    placeholder="Driver contact number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Notes and special instructions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes about this order"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                <Textarea
                  id="deliveryNotes"
                  value={formData.deliveryNotes}
                  onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                  rows={2}
                  placeholder="Special delivery instructions"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                "Convert to Sales Order"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
