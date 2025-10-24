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
import type { SalesOrder, Invoice } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"
import { Loader2 } from "lucide-react"

interface ConvertOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salesOrder?: SalesOrder
  onSuccess: () => void
}

export function ConvertOrderDialog({ open, onOpenChange, salesOrder, onSuccess }: ConvertOrderDialogProps) {
  const router = useRouter()
  const { company, user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    dueDate: "",
    status: "draft" as Invoice["status"],
    notes: "",
    paymentInstructions: "",
  })

  useEffect(() => {
    if (salesOrder && open) {
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 30) // Default to 30 days from now

      setFormData({
        dueDate: defaultDate.toISOString().split("T")[0],
        status: "draft",
        notes: salesOrder.notes || "",
        paymentInstructions: `Payment terms: ${salesOrder.paymentTerms}`,
      })
    }
  }, [salesOrder, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!salesOrder || !company?.id) {
      toast({
        title: "Error",
        description: "Sales order or company information is missing",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!formData.dueDate) {
      toast({
        title: "Validation Error",
        description: "Please select a due date",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Create the invoice from the sales order
      const invoiceData = {
        companyId: company.id,
        invoiceNumber: `INV-${Date.now()}`,
        salesOrderId: salesOrder.id,
        customerName: salesOrder.customerName,
        customerEmail: salesOrder.customerEmail,
        items: salesOrder.items.map(item => ({
          itemId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        subtotal: salesOrder.subtotal,
        tax: salesOrder.tax,
        taxRate: salesOrder.taxRate,
        discount: salesOrder.discount || 0,
        total: salesOrder.total,
        dueDate: new Date(formData.dueDate),
        status: formData.status,
        notes: formData.notes || undefined,
        paymentInstructions: formData.paymentInstructions || undefined,
        paidAmount: 0,
        createdBy: user?.id || "",
      }

      const invoiceResponse = await api.crm.invoices.create(invoiceData)

      if (!invoiceResponse.success) {
        throw new Error(invoiceResponse.error || "Failed to create invoice")
      }

      // Step 2: Update the sales order status and link to invoice
      const orderUpdateResponse = await api.crm.salesOrders.update(salesOrder.id, {
        status: "Processing",
        invoiceId: invoiceResponse.data.id,
        processedAt: new Date(),
        notes: `${salesOrder.notes || ""}\n\nInvoice generated: ${invoiceData.invoiceNumber}`,
      })

      if (orderUpdateResponse.success) {
        toast({
          title: "Success",
          description: "Sales order successfully converted to invoice",
        })
      } else {
        toast({
          title: "Partial Success",
          description: "Invoice created but order status update failed",
          variant: "destructive",
        })
      }

      onOpenChange(false)
      onSuccess()
      router.push("/crm/invoices")

    } catch (error) {
      console.error("Failed to convert sales order:", error)
      toast({
        title: "Error",
        description: "Failed to convert sales order to invoice",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!salesOrder) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Convert Sales Order to Invoice</DialogTitle>
          <DialogDescription>
            Generate an invoice for sales order "{salesOrder.orderNumber}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sales Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Order Summary</CardTitle>
              <CardDescription>Details from the original sales order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Order Number:</span> {salesOrder.orderNumber}
                </div>
                <div>
                  <span className="font-medium">Customer:</span> {salesOrder.customerName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {salesOrder.customerEmail}
                </div>
                <div>
                  <span className="font-medium">Total Value:</span> ${salesOrder.total.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Items:</span> {salesOrder.items.length} item(s)
                </div>
                <div>
                  <span className="font-medium">Delivery Date:</span> {
                    salesOrder.deliveryDate ? new Date(salesOrder.deliveryDate).toLocaleDateString() : "Not set"
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Configure the invoice settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Invoice Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Invoice["status"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentInstructions">Payment Instructions</Label>
                <Textarea
                  id="paymentInstructions"
                  value={formData.paymentInstructions}
                  onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                  placeholder="Special payment instructions for the customer"
                  rows={2}
                />
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
                <Label htmlFor="notes">Invoice Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional notes for this invoice"
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
                "Generate Invoice"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
