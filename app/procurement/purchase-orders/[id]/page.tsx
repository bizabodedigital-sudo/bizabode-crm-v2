"use client"

import { PurchaseOrderDetail } from "@/components/procurement/purchase-order-detail"
import { useParams } from "next/navigation"

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const purchaseOrderId = params.id as string

  return (
    <div className="space-y-6">
      <PurchaseOrderDetail purchaseOrderId={purchaseOrderId} />
    </div>
  )
}
