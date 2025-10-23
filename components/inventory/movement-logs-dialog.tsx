"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Loader2, Search, Filter, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface Movement {
  _id: string
  itemSku: string
  itemName: string
  movementType: string
  quantityChange: number
  previousQuantity: number
  newQuantity: number
  reason: string
  notes?: string
  performedByName: string
  createdAt: string
}

interface MovementLogsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
  itemName: string
}

export function MovementLogsDialog({ open, onOpenChange, itemId, itemName }: MovementLogsDialogProps) {
  const [movements, setMovements] = useState<Movement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [movementTypeFilter, setMovementTypeFilter] = useState("")
  const { toast } = useToast()

  // Fetch movements when dialog opens
  useEffect(() => {
    if (open && itemId) {
      fetchMovements()
    }
  }, [open, itemId])

  const fetchMovements = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/inventory/movements?item_id=${itemId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch movements')
      }

      const data = await response.json()
      setMovements(data.data || [])
    } catch (error) {
      console.error('Error fetching movements:', error)
      toast({
        title: "Error",
        description: "Failed to fetch movement logs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getMovementIcon = (movementType: string) => {
    switch (movementType.toLowerCase()) {
      case 'in':
      case 'receipt':
      case 'purchase':
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'out':
      case 'sale':
      case 'consumption':
        return <ArrowDown className="h-4 w-4 text-red-600" />
      case 'adjustment':
      case 'correction':
        return <Minus className="h-4 w-4 text-blue-600" />
      default:
        return <History className="h-4 w-4 text-gray-600" />
    }
  }

  const getMovementBadgeVariant = (movementType: string) => {
    switch (movementType.toLowerCase()) {
      case 'in':
      case 'receipt':
      case 'purchase':
        return 'default' as const
      case 'out':
      case 'sale':
      case 'consumption':
        return 'destructive' as const
      case 'adjustment':
      case 'correction':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  const filteredMovements = movements.filter((movement) => {
    const matchesSearch = 
      movement.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.performedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.movementType.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = !movementTypeFilter || movement.movementType === movementTypeFilter
    
    return matchesSearch && matchesType
  })

  const movementTypes = [...new Set(movements.map(m => m.movementType))]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Movement History
          </DialogTitle>
          <DialogDescription>
            Track all inventory movements for {itemName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search movements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={movementTypeFilter} onValueChange={setMovementTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {movementTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Movements Table */}
          <div className="flex-1 overflow-hidden border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3" />
                <span>Loading movements...</span>
              </div>
            ) : filteredMovements.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Movements Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || movementTypeFilter 
                    ? "No movements match your current filters"
                    : "No movements recorded for this item yet"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-96">
                <Table>
                  <TableHeader className="sticky top-0 bg-white dark:bg-gray-900">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((movement) => (
                      <TableRow key={movement._id}>
                        <TableCell className="text-sm">
                          {format(new Date(movement.createdAt), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementIcon(movement.movementType)}
                            <Badge variant={getMovementBadgeVariant(movement.movementType)}>
                              {movement.movementType}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {movement.quantityChange > 0 ? (
                              <ArrowUp className="h-3 w-3 text-green-600" />
                            ) : movement.quantityChange < 0 ? (
                              <ArrowDown className="h-3 w-3 text-red-600" />
                            ) : (
                              <Minus className="h-3 w-3 text-gray-600" />
                            )}
                            <span className={`font-medium ${
                              movement.quantityChange > 0 ? 'text-green-600' : 
                              movement.quantityChange < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {movement.previousQuantity}
                        </TableCell>
                        <TableCell className="font-medium">
                          {movement.newQuantity}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={movement.reason}>
                            {movement.reason}
                          </div>
                          {movement.notes && (
                            <div className="text-xs text-muted-foreground truncate" title={movement.notes}>
                              {movement.notes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {movement.performedByName}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Summary */}
          {filteredMovements.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Showing {filteredMovements.length} of {movements.length} movements
                </span>
                <div className="flex gap-4 text-muted-foreground">
                  <span>
                    Total In: +{filteredMovements
                      .filter(m => m.quantityChange > 0)
                      .reduce((sum, m) => sum + m.quantityChange, 0)}
                  </span>
                  <span>
                    Total Out: {filteredMovements
                      .filter(m => m.quantityChange < 0)
                      .reduce((sum, m) => sum + m.quantityChange, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}