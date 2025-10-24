"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Loader2 } from "lucide-react"
import type { SalesOrder, SalesOrderItem, Quote } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"

interface SalesOrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salesOrder?: SalesOrder
  quote?: Quote // For converting quote to sales order
  onSuccess: () => void
}

export function SalesOrderFormDialog({ open, onOpenChange, salesOrder, quote, onSuccess }: SalesOrderFormDialogProps) {
  const { company, user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    deliveryDate: "",
    deliveryAddress: "",
    paymentTerms: "Net 30" as SalesOrder["paymentTerms"],
    status: "Pending" as SalesOrder["status"],
    notes: "",
    driverName: "",
    driverPhone: "",
    deliveryNotes: "",
  })
  const [lineItems, setLineItems] = useState<SalesOrderItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [hasTax, setHasTax] = useState(true)
  const [taxRate, setTaxRate] = useState(15)

  // Fetch items when dialog opens
  useEffect(() => {
    if (open && items.length === 0 && company?.id) {
      fetchItems()
    }
  }, [open, company?.id])

  const fetchItems = async () => {
    try {
      const response = await api.inventory.items.list({ companyId: company?.id })
      if (response.success) {
        setItems(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
    }
  }

  useEffect(() => {
    if (salesOrder) {
      // Edit mode - populate form with sales order data
      setFormData({
        customerName: salesOrder.customerName,
        customerEmail: salesOrder.customerEmail,
        customerPhone: salesOrder.customerPhone || "",
        customerAddress: salesOrder.customerAddress || "",
        deliveryDate: salesOrder.deliveryDate ? new Date(salesOrder.deliveryDate).toISOString().split("T")[0] : "",
        deliveryAddress: salesOrder.deliveryAddress || "",
        paymentTerms: salesOrder.paymentTerms,
        status: salesOrder.status,
        notes: salesOrder.notes || "",
        driverName: salesOrder.driverName || "",
        driverPhone: salesOrder.driverPhone || "",
        deliveryNotes: salesOrder.deliveryNotes || "",
      })
      setLineItems(salesOrder.items)
      setTaxRate(salesOrder.taxRate)
      setHasTax(salesOrder.taxRate > 0)
    } else if (quote) {
      // Convert quote to sales order
      setFormData({
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: "",
        customerAddress: "",
        deliveryDate: "",
        deliveryAddress: "",
        paymentTerms: "Net 30",
        status: "Pending",
        notes: quote.notes || "",
        driverName: "",
        driverPhone: "",
        deliveryNotes: "",
      })
      setLineItems(quote.items.map(item => ({
        itemId: item.itemId,
        name: item.name,
        description: "",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: 0,
        total: item.total,
      })))
      setTaxRate(quote.taxRate)
      setHasTax(quote.taxRate > 0)
    } else {
      // Create mode - reset form
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 7)

      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        deliveryDate: defaultDate.toISOString().split("T")[0],
        deliveryAddress: "",
        paymentTerms: "Net 30",
        status: "Pending",
        notes: "",
        driverName: "",
        driverPhone: "",
        deliveryNotes: "",
      })
      setLineItems([])
      setTaxRate(15)
      setHasTax(true)
    }
  }, [salesOrder, quote, open])

  const handleAddItem = () => {
    const itemId = selectedItemId
    const item = items.find((i) => (i._id || i.id) === itemId)
    if (!item || quantity <= 0) return

    const existingItem = lineItems.find((li) => li.itemId === itemId)
    if (existingItem) {
      setLineItems(
        lineItems.map((li) =>
          li.itemId === itemId
            ? { ...li, quantity: li.quantity + quantity, total: (li.quantity + quantity) * li.unitPrice }
            : li,
        ),
      )
    } else {
      setLineItems([
        ...lineItems,
        {
          itemId: item._id || item.id,
          name: item.name,
          description: item.description || "",
          quantity,
          unitPrice: item.unitPrice,
          discount: 0,
          total: quantity * item.unitPrice,
        },
      ])
    }

    setSelectedItemId("")
    setQuantity(1)
  }

  const handleRemoveItem = (itemId: string) => {
    setLineItems(lineItems.filter((item) => item.itemId !== itemId))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0)
  const tax = hasTax ? subtotal * (taxRate / 100) : 0
  const total = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the sales order",
        variant: "destructive",
      })
      return
    }

    if (!company?.id) {
      toast({
        title: "Error",
        description: "Company information is missing. Please log in again.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!formData.customerName || !formData.customerEmail || !formData.deliveryDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const salesOrderData = {
      companyId: company.id,
      orderNumber: salesOrder?.orderNumber || `SO-${Date.now()}`,
      quoteId: quote?.id || salesOrder?.quoteId || undefined,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone || undefined,
      customerAddress: formData.customerAddress || undefined,
      items: lineItems,
      subtotal,
      tax,
      taxRate: hasTax ? taxRate : 0,
      discount: 0,
      total,
      orderDate: new Date(),
      deliveryDate: new Date(formData.deliveryDate),
      deliveryAddress: formData.deliveryAddress || undefined,
      paymentTerms: formData.paymentTerms,
      status: formData.status,
      notes: formData.notes || undefined,
      createdBy: user?.id || "",
      assignedTo: user?.id || undefined,
      driverName: formData.driverName || undefined,
      driverPhone: formData.driverPhone || undefined,
      deliveryNotes: formData.deliveryNotes || undefined,
    }

    try {
      let response
      if (salesOrder) {
        response = await api.crm.salesOrders.update(salesOrder.id, salesOrderData)
      } else {
        response = await api.crm.salesOrders.create(salesOrderData)
      }

      if (response.success) {
        toast({
          title: "Success",
          description: salesOrder ? "Sales order updated successfully" : "Sales order created successfully",
        })
        onOpenChange(false)
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to save sales order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to save sales order:", error)
      toast({
        title: "Error",
        description: "Failed to save sales order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {salesOrder ? "Edit Sales Order" : quote ? "Convert Quote to Sales Order" : "Create New Sales Order"}
          </DialogTitle>
          <DialogDescription>
            {salesOrder ? "Update the sales order details below." : 
             quote ? "Convert this quote into a sales order with delivery details." :
             "Enter the details for the new sales order."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Customer details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Customer Address</Label>
                  <Input
                    id="customerAddress"
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>Delivery scheduling and logistics</CardDescription>
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

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Current order status and processing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as SalesOrder["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Dispatched">Dispatched</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Products and quantities for this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!quote && (
                <div className="flex gap-2">
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select item..." />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item._id || item.id} value={item._id || item.id}>
                          {item.name} - ${item.unitPrice.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                    className="w-24"
                    placeholder="Qty"
                  />
                  <Button type="button" onClick={handleAddItem} disabled={!selectedItemId}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {lineItems.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        {!quote && <TableHead className="w-12"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lineItems.map((item) => (
                        <TableRow key={item.itemId}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                          {!quote && (
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item.itemId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="border-t p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="font-mono">${subtotal.toFixed(2)}</span>
                    </div>
                    {hasTax && (
                      <div className="flex justify-between text-sm">
                        <span>Tax ({taxRate}%):</span>
                        <span className="font-mono">${tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="font-mono">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tax Options */}
          <Card>
            <CardHeader>
              <CardTitle>Tax & Pricing</CardTitle>
              <CardDescription>Tax calculation and pricing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="hasTax" className="font-medium">Apply Tax</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable tax calculation for this order
                  </p>
                </div>
                <Switch
                  id="hasTax"
                  checked={hasTax}
                  onCheckedChange={setHasTax}
                />
              </div>

              {hasTax && (
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Current tax: ${tax.toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes and Delivery Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Notes and delivery instructions</CardDescription>
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
                  {salesOrder ? "Updating..." : "Creating..."}
                </>
              ) : (
                salesOrder ? "Update Sales Order" : quote ? "Convert to Sales Order" : "Create Sales Order"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
