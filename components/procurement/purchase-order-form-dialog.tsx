"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Package } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface Supplier {
  _id: string
  name: string
  email: string
  phone: string
}

interface Item {
  _id: string
  sku: string
  name: string
  costPrice: number
  unitPrice: number
}

interface PurchaseOrderItem {
  itemId: string
  sku: string
  name: string
  quantity: number
  unitCost: number
  totalCost: number
}

interface PurchaseOrderFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData?: any
}

export function PurchaseOrderFormDialog({ open, onOpenChange, onSuccess, initialData }: PurchaseOrderFormDialogProps) {
  const { company } = useAuth()
  const { toast } = useToast()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [poItems, setPoItems] = useState<PurchaseOrderItem[]>([])
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const hasProcessedInitialData = useRef(false)

  useEffect(() => {
    if (open) {
      fetchSuppliers()
      fetchItems()
      
      // Handle initial data from inventory system (only once)
      if (initialData && initialData.source === 'inventory-low-stock' && !hasProcessedInitialData.current) {
        console.log('Processing initial data:', initialData)
        if (initialData.items && initialData.items.length > 0) {
          const mappedItems = initialData.items.map((item: any) => ({
            itemId: item.itemId,
            sku: item.sku,
            name: item.name,
            quantity: item.quantity,
            unitCost: item.unitCost || 0, // Use provided unit cost or default to 0
            totalCost: item.quantity * (item.unitCost || 0)
          }))
          console.log('Mapped items:', mappedItems)
          setPoItems(mappedItems)
          setNotes(initialData.notes || '')
        } else {
          console.log('No items in initial data, adding default item')
          setPoItems([{
            itemId: '',
            sku: '',
            name: '',
            quantity: 1,
            unitCost: 0,
            totalCost: 0
          }])
        }
        hasProcessedInitialData.current = true
      }
    }
  }, [open, initialData])

  // Reset the ref when dialog closes
  useEffect(() => {
    if (!open) {
      hasProcessedInitialData.current = false
    }
  }, [open])

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`/api/procurement/suppliers?companyId=${company?.id}`)
      const data = await response.json()
      if (data.success) {
        setSuppliers(data.data.suppliers || [])
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
    }
  }

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/inventory/items?companyId=${company?.id}`)
      const data = await response.json()
      if (data.success) {
        setItems(data.data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
    }
  }

  const addItem = () => {
    setPoItems([...poItems, {
      itemId: "",
      sku: "",
      name: "",
      quantity: 1,
      unitCost: 0,
      totalCost: 0
    }])
  }

  const removeItem = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const updatedItems = [...poItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // If itemId changed, update sku, name, and unitCost
    if (field === 'itemId' && value) {
      const item = items.find(i => i._id === value)
      if (item) {
        updatedItems[index].sku = item.sku
        updatedItems[index].name = item.name
        updatedItems[index].unitCost = item.costPrice
        updatedItems[index].totalCost = updatedItems[index].quantity * item.costPrice
      }
    }
    
    // If quantity or unitCost changed, recalculate totalCost
    if (field === 'quantity' || field === 'unitCost') {
      updatedItems[index].totalCost = updatedItems[index].quantity * updatedItems[index].unitCost
    }
    
    setPoItems(updatedItems)
  }

  const calculateTotal = () => {
    return poItems.reduce((sum, item) => sum + item.totalCost, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSupplier || poItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select a supplier and add at least one item",
        variant: "destructive",
      })
      return
    }

    // Validate all items have required fields
    const invalidItems = poItems.filter(item => 
      !item.itemId || item.quantity <= 0 || item.unitCost <= 0
    )
    
    if (invalidItems.length > 0) {
      toast({
        title: "Error",
        description: "Please fill in all item details correctly",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/procurement/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplier,
          items: poItems.map(item => ({
            itemId: item.itemId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitCost
          })),
          notes,
          companyId: localStorage.getItem('companyId') || '68f5bc2cf855b93078938f4e',
          createdBy: localStorage.getItem('userId') || '68f5bc2cf855b93078938f4e'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Purchase order created successfully",
        })
        onSuccess()
        onOpenChange(false)
        resetForm()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create purchase order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to create purchase order:', error)
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedSupplier("")
    setPoItems([])
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] min-w-[800px] min-h-[400px] w-fit h-fit overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order for your supplier
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-lg font-semibold">Supplier *</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Total Amount</Label>
              <div className="text-4xl font-bold text-primary">
                ${calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Label className="text-lg font-semibold">Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-10 px-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {poItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items added yet</p>
                <p className="text-sm">Click "Add Item" to get started</p>
                {initialData && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Initial data received: {JSON.stringify(initialData, null, 2)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Item</TableHead>
                      <TableHead className="w-[120px]">SKU</TableHead>
                      <TableHead className="w-[100px]">Quantity</TableHead>
                      <TableHead className="w-[120px]">Unit Cost</TableHead>
                      <TableHead className="w-[120px]">Total</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="p-3">
                          <Select 
                            value={item.itemId} 
                            onValueChange={(value) => updateItem(index, 'itemId', value)}
                          >
                            <SelectTrigger className="w-full h-10 text-sm">
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {items.map((invItem) => (
                                <SelectItem key={invItem._id} value={invItem._id}>
                                  {invItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-3 font-mono text-sm">
                          {item.sku}
                        </TableCell>
                        <TableCell className="p-3">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full h-10 text-sm"
                          />
                        </TableCell>
                        <TableCell className="p-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                            className="w-full h-10 text-sm"
                          />
                        </TableCell>
                        <TableCell className="p-3 font-mono text-lg font-semibold">
                          ${item.totalCost.toFixed(2)}
                        </TableCell>
                        <TableCell className="p-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="w-full h-10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Label htmlFor="notes" className="text-base font-semibold">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes for this purchase order..."
              className="text-sm"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6 h-10">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedSupplier || poItems.length === 0} className="px-6 h-10">
              {isLoading ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}