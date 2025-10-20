"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, Package, Loader2 } from "lucide-react"
import { PurchaseOrderFormDialog } from "@/components/procurement/purchase-order-form-dialog"
import { PurchaseOrderDetail } from "@/components/procurement/purchase-order-detail"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface PurchaseOrder {
  _id: string
  poNumber: string
  supplierId: {
    _id: string
    name: string
    email: string
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
  createdAt: string
  sentDate?: string
  receivedDate?: string
}

export default function PurchaseOrdersPage() {
  const { company } = useAuth()
  const { toast } = useToast()
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    fetchPurchaseOrders()
  }, [])

  const fetchPurchaseOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/purchase-orders')
      const data = await response.json()
      
      if (data.success) {
        setPurchaseOrders(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPOs = purchaseOrders.filter(po =>
    po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  const handleReceive = async (poId: string) => {
    try {
      const response = await fetch(`/api/purchase-orders/${poId}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh the list
        await fetchPurchaseOrders()
        // Show success message
        toast({
          title: "Success",
          description: data.data.message || "Purchase order received successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to receive purchase order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to receive purchase order:', error)
      toast({
        title: "Error",
        description: "Failed to receive purchase order",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage your supplier purchase orders and inventory receipts
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            Track and manage all your purchase orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by PO number, supplier, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPOs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No purchase orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPOs.map((po) => (
                      <TableRow key={po._id}>
                        <TableCell className="font-mono font-medium">
                          {po.poNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{po.supplierName}</div>
                            <div className="text-sm text-muted-foreground">
                              {po.supplierId?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(po.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            {po.items.length} items
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ${po.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(po.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPO(po)
                                setIsDetailOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {po.status === 'sent' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReceive(po._id)}
                              >
                                Receive
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PurchaseOrderFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchPurchaseOrders}
      />

      <PurchaseOrderDetail
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        purchaseOrder={
          selectedPO
            ? {
                ...selectedPO,
                createdBy: (selectedPO as any).createdBy || {
                  name: 'System',
                  email: 'system@bizabode.com'
                },
                supplierId: {
                  ...selectedPO.supplierId,
                  phone: (selectedPO.supplierId as any).phone || 'N/A'
                }
              }
            : null
        }
        onReceive={handleReceive}
      />
    </div>
  )
}
