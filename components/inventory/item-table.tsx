"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Edit, Trash2, Plus, Search, Loader2, Download, ShoppingCart, History } from "lucide-react"
import type { Item } from "@/lib/types"
import { useInventoryStore } from "@/lib/inventory-store"
import { ItemFormDialog } from "./item-form-dialog"
import { StockAdjustmentDialog } from "./stock-adjustment-dialog"
import { MovementLogsDialog } from "./movement-logs-dialog"
import { BulkImportDialog } from "./bulk-import-dialog"
import { PurchaseOrderDialog } from "./purchase-order-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ItemTable() {
  const { items, deleteItem, fetchItems, isLoading } = useInventoryStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [adjustingItem, setAdjustingItem] = useState<Item | null>(null)
  const [deletingItem, setDeletingItem] = useState<Item | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [movementLogsItem, setMovementLogsItem] = useState<Item | null>(null)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [isPurchaseOrderOpen, setIsPurchaseOrderOpen] = useState(false)
  const { toast } = useToast()

  // Fetch items from API on mount
  useEffect(() => {
    fetchItems()
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCritical = showCriticalOnly ? item.critical : true
    
    return matchesSearch && matchesCritical
  })

  const getStockStatus = (item: Item) => {
    if (item.quantity === 0) return { label: "Out of Stock", variant: "destructive" as const }
    if (item.quantity <= item.reorderLevel) return { label: "Low Stock", variant: "secondary" as const }
    return { label: "In Stock", variant: "default" as const }
  }

  const handleDelete = () => {
    if (deletingItem) {
      deleteItem((deletingItem as any)._id || deletingItem.id)
      setDeletingItem(null)
    }
  }

  const handleExportCSV = async () => {
    try {
      setIsExporting(true)
      const token = localStorage.getItem('bizabode_token')
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      const response = await fetch('/api/inventory/items/export-csv', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Export failed:', response.status, errorText)
        throw new Error(`Export failed: ${response.status} ${response.statusText}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Export ready!",
        description: "CSV file downloaded successfully",
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: "Failed to export",
        description: `Failed to export inventory data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      setIsExporting(true)
      const token = localStorage.getItem('bizabode_token')
      if (!token) {
        throw new Error('No authentication token found. Please log in again.')
      }

      const response = await fetch('/api/inventory/items/export-csv?format=pdf', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Export failed:', response.status, errorText)
        throw new Error(`Export failed: ${response.status} ${response.statusText}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Export ready!",
        description: "PDF report downloaded successfully",
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: "Failed to export",
        description: `Failed to export inventory data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="critical-only"
              checked={showCriticalOnly}
              onCheckedChange={setShowCriticalOnly}
            />
            <Label htmlFor="critical-only" className="text-sm">
              Show Critical Only
            </Label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline" disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
          <Button onClick={() => setIsBulkImportOpen(true)} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => setIsPurchaseOrderOpen(true)} variant="outline">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Reorder
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
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
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
              filteredItems.map((item) => {
                const status = getStockStatus(item)
                return (
                  <TableRow key={(item as any)._id || item.id}>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {item.critical && (
                          <Badge variant="destructive" className="text-xs">
                            Critical
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right font-mono">{item.quantity}</TableCell>
                    <TableCell className="text-right font-mono">{item.reorderLevel}</TableCell>
                    <TableCell className="text-right font-mono">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setAdjustingItem(item)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setMovementLogsItem(item)}>
                          <History className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingItem(item)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      )}

      <ItemFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => setIsAddDialogOpen(false)}
      />

      <ItemFormDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem || undefined}
        onSuccess={() => setEditingItem(null)}
      />

      <StockAdjustmentDialog
        open={!!adjustingItem}
        onOpenChange={(open) => !open && setAdjustingItem(null)}
        item={adjustingItem || undefined}
        onSuccess={() => setAdjustingItem(null)}
      />

      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MovementLogsDialog
        open={!!movementLogsItem}
        onOpenChange={(open) => !open && setMovementLogsItem(null)}
        itemId={(movementLogsItem as any)?._id || movementLogsItem?.id || ''}
        itemName={movementLogsItem?.name || ''}
      />

      <BulkImportDialog
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        onSuccess={() => {
          fetchItems()
          setIsBulkImportOpen(false)
        }}
      />

      <PurchaseOrderDialog
        open={isPurchaseOrderOpen}
        onOpenChange={setIsPurchaseOrderOpen}
        onSuccess={() => {
          fetchItems()
          setIsPurchaseOrderOpen(false)
        }}
      />
    </div>
  )
}