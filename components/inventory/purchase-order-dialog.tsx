"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Loader2, AlertTriangle, Package, ExternalLink, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { api, endpoints } from "@/lib/api-client-config"
import { formatCurrency } from "@/lib/utils/formatters"
import Loading from "@/components/shared/Loading"

interface LowStockItem {
  id: string
  sku: string
  name: string
  currentQuantity: number
  reorderLevel: number
  suggestedQuantity: number
}

interface PurchaseOrderItem {
  itemId: string
  name: string
  sku: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

interface PurchaseOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PurchaseOrderDialog({ open, onOpenChange, onSuccess }: PurchaseOrderDialogProps) {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const { company } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (open) {
      fetchLowStockItems()
    }
  }, [open])

  const fetchLowStockItems = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(endpoints.inventory.lowStockPurchaseOrder, {
        companyId: company?.id || ''
      })
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch low stock items')
      }

      console.log('Low stock items data:', response.data)
      setLowStockItems(response.data.lowStockItems || [])
    } catch (error) {
      console.error('Error fetching low stock items:', error)
      toast({
        title: "Error",
        description: "Failed to fetch low stock items",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePurchaseOrder = async () => {
    if (lowStockItems.length === 0) {
      toast({
        title: "No items to reorder",
        description: "There are no low stock items to create a purchase order for",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      // Store low stock items data for the procurement page
      const purchaseOrderData = {
        source: 'inventory-low-stock',
        items: lowStockItems.map(item => ({
          itemId: item.id,
          name: item.name,
          sku: item.sku,
          quantity: item.suggestedQuantity,
          unitCost: item.unitCost || 0, // Use the unit cost from inventory
          totalCost: item.suggestedQuantity * (item.unitCost || 0)
        })),
        notes: `Auto-generated from low stock items. ${lowStockItems.length} items need reordering.`,
        total: lowStockItems.reduce((sum, item) => sum + (item.suggestedQuantity * (item.unitCost || 0)), 0)
      }

      localStorage.setItem('pending-purchase-order', JSON.stringify(purchaseOrderData))
      
      toast({
        title: "Redirecting to Procurement",
        description: "You will be taken to the procurement page to complete the purchase order",
      })

      // Close dialog and redirect
      onOpenChange(false)
      router.push('/procurement?action=create-po&source=inventory')
      
    } catch (error) {
      console.error('Error creating purchase order:', error)
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const totalItems = lowStockItems.length
  const totalQuantity = lowStockItems.reduce((sum, item) => sum + item.suggestedQuantity, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Generate Purchase Order
          </DialogTitle>
          <DialogDescription>
            Create a purchase order for low stock items that need reordering
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {isLoading ? (
            <Loading />
          ) : lowStockItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Low Stock Items</h3>
              <p className="text-muted-foreground mb-4">
                All items are currently well-stocked. No purchase order needed.
              </p>
              <Button 
                onClick={fetchLowStockItems} 
                variant="outline"
                className="mt-4"
              >
                Refresh Items
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-orange-800 dark:text-orange-200">Low Stock Items</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{totalItems}</div>
                  <div className="text-sm text-orange-600/80">Items need reordering</div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">Total Quantity</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{totalQuantity}</div>
                  <div className="text-sm text-blue-600/80">Units to order</div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">Ready to Order</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-sm text-green-600/80">Purchase order ready</div>
                </div>
              </div>

              {/* Low Stock Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b">
                  <h3 className="font-medium">Low Stock Items ({lowStockItems.length})</h3>
                  <p className="text-sm text-muted-foreground">
                    Items that are below their reorder level
                  </p>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Reorder Level</TableHead>
                        <TableHead>Suggested Qty</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-center">{item.currentQuantity}</TableCell>
                          <TableCell className="text-center">{item.reorderLevel}</TableCell>
                          <TableCell className="text-center font-medium text-blue-600">
                            {item.suggestedQuantity}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Low Stock
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 pt-4 border-t">
                <Button 
                  onClick={() => onOpenChange(false)} 
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreatePurchaseOrder}
                  disabled={isCreating || lowStockItems.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Go to Procurement
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}