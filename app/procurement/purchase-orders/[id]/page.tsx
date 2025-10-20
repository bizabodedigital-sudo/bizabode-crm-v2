"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Truck, CheckCircle } from "lucide-react"
import Link from "next/link"

interface PurchaseOrder {
  _id: string
  poNumber: string
  supplier: {
    _id: string
    name: string
    email: string
    phone: string
  }
  items: Array<{
    itemId: string
    sku: string
    name: string
    quantity: number
    unitCost: number
    totalCost: number
  }>
  total: number
  status: 'draft' | 'sent' | 'received' | 'cancelled'
  notes?: string
  createdAt: string
  sentDate?: string
  receivedDate?: string
}

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const purchaseOrderId = params.id as string
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPurchaseOrder()
  }, [purchaseOrderId])

  const fetchPurchaseOrder = async () => {
    try {
      const response = await fetch(`/api/purchase-orders/${purchaseOrderId}`)
      const data = await response.json()
      if (data.success) {
        setPurchaseOrder(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch purchase order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!purchaseOrder) {
    return <div>Purchase order not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/procurement/purchase-orders">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchase Orders
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Purchase Order #{purchaseOrder.poNumber}</h1>
          <p className="text-muted-foreground">View purchase order details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={purchaseOrder.status === 'received' ? 'default' : 'secondary'}>
                {purchaseOrder.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">${purchaseOrder.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{new Date(purchaseOrder.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Supplier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">{purchaseOrder.supplier.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {purchaseOrder.supplier.email}
            </div>
            <div className="text-sm text-muted-foreground">
              {purchaseOrder.supplier.phone}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{new Date(purchaseOrder.createdAt).toLocaleDateString()}</span>
            </div>
            {purchaseOrder.sentDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent:</span>
                <span>{new Date(purchaseOrder.sentDate).toLocaleDateString()}</span>
              </div>
            )}
            {purchaseOrder.receivedDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Received:</span>
                <span>{new Date(purchaseOrder.receivedDate).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>Items in this purchase order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchaseOrder.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${item.totalCost.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.quantity} × ${item.unitCost.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
