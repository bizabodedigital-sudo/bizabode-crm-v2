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
import type { Quote, QuoteItem } from "@/lib/types"
import { useQuotesInvoicesStore } from "@/lib/quotes-invoices-store"
import { useInventoryStore } from "@/lib/inventory-store"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface QuoteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote?: Quote
  onSuccess: () => void
}

export function QuoteFormDialog({ open, onOpenChange, quote, onSuccess }: QuoteFormDialogProps) {
  const { addQuote, updateQuote } = useQuotesInvoicesStore()
  const { items, fetchItems } = useInventoryStore()
  const { company } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    validUntil: "",
    status: "draft" as Quote["status"],
    notes: "",
  })
  const [lineItems, setLineItems] = useState<QuoteItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [hasTax, setHasTax] = useState(true)
  const [taxRate, setTaxRate] = useState(15)

  // Fetch items when dialog opens
  useEffect(() => {
    if (open && items.length === 0) {
      fetchItems()
    }
  }, [open])

  useEffect(() => {
    if (quote) {
      setFormData({
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        validUntil: new Date(quote.validUntil).toISOString().split("T")[0],
        status: quote.status,
        notes: quote.notes,
      })
      setLineItems(quote.items)
    } else {
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 30)

      setFormData({
        customerName: "",
        customerEmail: "",
        validUntil: defaultDate.toISOString().split("T")[0],
        status: "draft",
        notes: "",
      })
      setLineItems([])
    }
  }, [quote, open])

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
        description: "Please add at least one item to the quote",
        variant: "destructive",
      })
      return
    }

    const quoteData = {
      ...formData,
      companyId: company?.id || "company-1",
      items: lineItems,
      subtotal,
      tax,
      taxRate: hasTax ? taxRate : 0,
      discount: 0,
      total,
      validUntil: new Date(formData.validUntil),
    }

    try {
      if (quote) {
        await updateQuote((quote as any)._id || quote.id, quoteData)
        toast({
          title: "Success",
          description: "Quote updated successfully",
        })
      } else {
        await addQuote(quoteData)
        toast({
          title: "Success",
          description: "Quote created successfully",
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Failed to save quote:", error)
      toast({
        title: "Error",
        description: "Failed to save quote. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quote ? "Edit Quote" : "Create New Quote"}</DialogTitle>
          <DialogDescription>
            {quote ? "Update the quote details below." : "Enter the details for the new quote."}
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
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Quote["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
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
                  Enable tax calculation for this quote
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{quote ? "Update Quote" : "Create Quote"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
