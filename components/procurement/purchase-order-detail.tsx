"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Calendar, User, Mail, Phone, MapPin, FileText } from "lucide-react"
import { format } from "date-fns"

interface PurchaseOrder {
  _id: string
  poNumber: string
  supplierId: {
    _id: string
    name: string
    email: string
    phone: string
    address?: string
  }
  supplierName: string
  status: 'draft' | 'sent' | 'received' | 'cancelled'
  total: number
  items: Array<{
    sku: string
    name: string
    quantity: number
    unitCost: number
    totalCost: number
  }>
  notes?: string
  createdBy: {
    name: string
    email: string
  }
  createdAt: string
  sentDate?: string
  receivedDate?: string
}

interface PurchaseOrderDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder: PurchaseOrder | null
  onReceive: (poId: string) => void
}

export function PurchaseOrderDetail({ 
  open, 
  onOpenChange, 
  purchaseOrder, 
  onReceive 
}: PurchaseOrderDetailDialogProps) {
  if (!purchaseOrder) return null

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      sent: "default", 
      received: "default",
      cancelled: "destructive"
    } as const

    const colors = {
      draft: "bg-gray-100 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      received: "bg-green-100 text-green-800", 
      cancelled: "bg-red-100 text-red-800"
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleReceive = () => {
    onReceive(purchaseOrder._id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Package className="h-6 w-6" />
            Purchase Order {purchaseOrder.poNumber}
          </DialogTitle>
          <DialogDescription>
            View purchase order details and manage status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusBadge(purchaseOrder.status)}
              <span className="text-sm text-muted-foreground">
                Created {format(new Date(purchaseOrder.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>
            {purchaseOrder.status === 'sent' && (
              <Button onClick={handleReceive}>
                Mark as Received
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supplier Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supplier Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{purchaseOrder.supplierName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{purchaseOrder.supplierId?.email}</span>
                </div>
                {purchaseOrder.supplierId?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{purchaseOrder.supplierId.phone}</span>
                  </div>
                )}
                {purchaseOrder.supplierId?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{purchaseOrder.supplierId.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Items:</span>
                  <span className="font-medium">{purchaseOrder.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Quantity:</span>
                  <span className="font-medium">
                    {purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span>${purchaseOrder.total.toFixed(2)}</span>
                </div>
                {purchaseOrder.sentDate && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Sent: {format(new Date(purchaseOrder.sentDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
                {purchaseOrder.receivedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Received: {format(new Date(purchaseOrder.receivedDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items</CardTitle>
              <CardDescription>
                {purchaseOrder.items.length} items in this purchase order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-mono">
                          ${item.unitCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          ${item.totalCost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {purchaseOrder.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{purchaseOrder.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Created By */}
          <div className="text-sm text-muted-foreground">
            Created by {purchaseOrder.createdBy.name} ({purchaseOrder.createdBy.email})
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}