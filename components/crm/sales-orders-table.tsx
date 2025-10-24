"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, ArrowRight, Eye } from "lucide-react"
import type { SalesOrder } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { api, endpoints } from "@/lib/api-client-config"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"
import { getStatusColor } from "@/lib/utils/status-colors"
import SearchInput from "@/components/shared/SearchInput"
import Loading from "@/components/shared/Loading"
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

export function SalesOrdersTable() {
  const { company } = useAuth()
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<SalesOrder | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  // Fetch sales orders from API
  useEffect(() => {
    if (company?.id) {
      fetchSalesOrders()
    }
  }, [company?.id])

  const fetchSalesOrders = async () => {
    try {
      setIsLoading(true)
      const response = await api.crm.salesOrders.list({
        companyId: company?.id || '',
        limit: 100
      })
      
      if (response.success) {
        setSalesOrders(response.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch sales orders",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to fetch sales orders:', error)
      toast({
        title: "Error",
        description: "Failed to fetch sales orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (deletingOrder) {
      try {
        const response = await api.delete(`${endpoints.crm.salesOrders}/${deletingOrder.id}`)
        
        if (response.success) {
          setSalesOrders(salesOrders.filter(order => order.id !== deletingOrder.id))
          toast({
            title: "Success",
            description: "Sales order deleted successfully",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to delete sales order",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Failed to delete sales order:', error)
        toast({
          title: "Error",
          description: "Failed to delete sales order",
          variant: "destructive",
        })
      }
      setDeletingOrder(null)
    }
  }

  const filteredOrders = salesOrders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          placeholder="Search orders by customer, order number, or email..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Order
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No sales orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.customerEmail}</TableCell>
                    <TableCell>{formatCurrency(order.total, 'JMD')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell>
                      {order.deliveryDate ? formatDate(order.deliveryDate) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingOrder(order)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingOrder(order)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deletingOrder} onOpenChange={(open) => !open && setDeletingOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sales Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order "{deletingOrder?.orderNumber}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
