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
import { Plus, Trash2 } from "lucide-react"
import type { Invoice, QuoteItem } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { FileUpload } from "@/components/ui/file-upload"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"
import { Loader2 } from "lucide-react"

interface InvoiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: Invoice
  onSuccess: () => void
}

export function InvoiceFormDialog({ open, onOpenChange, invoice, onSuccess }: InvoiceFormDialogProps) {
  const { company } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    dueDate: "",
    status: "draft" as Invoice["status"],
    notes: "",
  })
  const [lineItems, setLineItems] = useState<QuoteItem[]>([])
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
    if (invoice) {
      setFormData({
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
        status: invoice.status,
        notes: invoice.notes,
      })
      setLineItems(invoice.items)
    } else {
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 30)

      setFormData({
        customerName: "",
        customerEmail: "",
        dueDate: defaultDate.toISOString().split("T")[0],
        status: "draft",
        notes: "",
      })
      setLineItems([])
    }
  }, [invoice, open])

  const handleAddItem = () => {
    const itemId = (selectedItemId as any)
    const item = items.find((i) => (i as any)._id === itemId || i.id === itemId)
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
          itemId: (item as any)._id || item.id,
          name: item.name,
          quantity,
          unitPrice: item.unitPrice,
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
        description: "Please add at least one item to the invoice",
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
    if (!formData.customerName || !formData.customerEmail || !formData.dueDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const invoiceData = {
      companyId: company.id,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      invoiceNumber: invoice?.invoiceNumber || `INV-${Date.now()}`,
      items: lineItems,
      subtotal,
      tax,
      taxRate: hasTax ? taxRate : 0,
      discount: 0,
      total,
      dueDate: new Date(formData.dueDate),
      status: formData.status,
      notes: formData.notes || undefined,
      paidAmount: invoice?.paidAmount || 0,
    }

    try {
      let response
      if (invoice) {
        response = await api.crm.invoices.update(invoice.id, invoiceData)
      } else {
        response = await api.crm.invoices.create(invoiceData)
      }

      if (response.success) {
        toast({
          title: "Success",
          description: invoice ? "Invoice updated successfully" : "Invoice created successfully",
        })
        onOpenChange(false)
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to save invoice",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to save invoice:", error)
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
          <DialogDescription>
            {invoice ? "Update the invoice details below." : "Enter the details for the new invoice."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
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

          <div className="space-y-3">
            <Label>Line Items</Label>
            <div className="flex gap-2">
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select item..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={(item as any)._id || item.id} value={(item as any)._id || item.id}>
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

            {lineItems.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.itemId}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
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
          </div>

          {/* Tax Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="hasTax" className="font-medium">Apply Tax</Label>
                <p className="text-sm text-muted-foreground">
                  Enable tax calculation for this invoice
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {invoice && (
            <div className="space-y-2">
              <Label>Attachments</Label>
              <FileUpload
                type="invoice"
                entityId={(invoice as any)._id || invoice.id}
                maxFiles={5}
                acceptedTypes={['image/*', 'application/pdf']}
                onUploadComplete={(fileInfo) => {
                  console.log('File uploaded:', fileInfo)
                }}
                onUploadError={(error) => {
                  console.error('Upload error:', error)
                }}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {invoice ? "Updating..." : "Creating..."}
                </>
              ) : (
                invoice ? "Update Invoice" : "Create Invoice"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
