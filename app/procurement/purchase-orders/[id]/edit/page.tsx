"use client"

import { useState, useEffect } from "react"
import { PurchaseOrderFormDialog } from "@/components/procurement/purchase-order-form-dialog"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function EditPurchaseOrderPage() {
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const purchaseOrderId = params.id as string

  useEffect(() => {
    fetchPurchaseOrder()
  }, [purchaseOrderId])

  const fetchPurchaseOrder = async () => {
    try {
      const response = await fetch(`/api/procurement/purchase-orders/${purchaseOrderId}`)
      const data = await response.json()
      if (data.success) {
        setPurchaseOrder(data.data)
        setIsDialogOpen(true)
      } else {
        throw new Error(data.message || 'Failed to fetch purchase order')
      }
    } catch (error: any) {
      console.error('Failed to fetch purchase order:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch purchase order details.",
        variant: "destructive",
      })
      router.push("/procurement")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Purchase order updated successfully!",
    })
    router.push(`/procurement/purchase-orders/${purchaseOrderId}`)
  }

  const handleCancel = () => {
    router.push(`/procurement/purchase-orders/${purchaseOrderId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading purchase order...</p>
        </div>
      </div>
    )
  }

  return (
    <PurchaseOrderFormDialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleCancel()
        }
      }}
      onSuccess={handleSuccess}
    />
  )
}
