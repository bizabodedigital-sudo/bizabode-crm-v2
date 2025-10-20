"use client"

import { useState } from "react"
import { PurchaseOrderFormDialog } from "@/components/procurement/purchase-order-form-dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function NewPurchaseOrderPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Purchase order created successfully!",
    })
    router.push("/procurement")
  }

  const handleCancel = () => {
    router.push("/procurement")
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
