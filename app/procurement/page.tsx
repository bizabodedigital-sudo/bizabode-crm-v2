"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, FileText, Package, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { PurchaseOrderFormDialog } from "@/components/procurement/purchase-order-form-dialog"
import PurchaseOrdersTable from "@/components/procurement/purchase-orders-table"
import { useToast } from "@/hooks/use-toast"

interface PurchaseOrder {
  _id: string
  number: string
  supplierId: {
    name: string
    email: string
  }
  status: 'draft' | 'approved' | 'sent' | 'received' | 'completed' | 'cancelled'
  createdAt: string
  expectedDate?: string
  total: number
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
  createdBy: string
}

export default function ProcurementPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  const [pendingPOData, setPendingPOData] = useState<any>(null)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    fetchPurchaseOrders()
    checkForPendingPO()
  }, [])

  const checkForPendingPO = () => {
    const action = searchParams.get('action')
    const source = searchParams.get('source')
    
    if (action === 'create-po' && source === 'inventory') {
      const pendingData = localStorage.getItem('pending-purchase-order')
      if (pendingData) {
        try {
          const poData = JSON.parse(pendingData)
          console.log('Parsed pending PO data:', poData)
          setPendingPOData(poData)
          setIsFormDialogOpen(true)
          toast({
            title: "Purchase Order Ready",
            description: `Creating PO for ${poData.items.length} items from inventory`,
          })
        } catch (error) {
          console.error('Failed to parse pending PO data:', error)
        }
      }
    }
  }

  const fetchPurchaseOrders = async () => {
    try {
      const companyId = localStorage.getItem('companyId') || '68f5bc2cf855b93078938f4e'
      const response = await fetch(`/api/procurement/purchase-orders?companyId=${companyId}`)
      const data = await response.json()
      if (data.success) {
        setPurchaseOrders(data.data.purchaseOrders || [])
      }
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditOrder = (order: PurchaseOrder) => {
    setEditingOrder(order)
    setIsFormDialogOpen(true)
  }

  const handleFormSuccess = () => {
    fetchPurchaseOrders()
    setIsFormDialogOpen(false)
    setEditingOrder(null)
    setPendingPOData(null)
    // Clear the pending PO data from localStorage
    localStorage.removeItem('pending-purchase-order')
  }

  const handleFormCancel = () => {
    setIsFormDialogOpen(false)
    setEditingOrder(null)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", icon: FileText },
      approved: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
      sent: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      received: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = (order.number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.supplierId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading purchase orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Procurement
        </h1>
        <p className="text-lg text-muted-foreground">Manage purchase orders and supplier relationships</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/procurement/purchase-orders">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Purchase Orders
              </CardTitle>
              <CardDescription>
                Create and manage purchase orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {purchaseOrders.length}
              </div>
              <p className="text-sm text-muted-foreground">Total orders</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/procurement/suppliers">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Suppliers
              </CardTitle>
              <CardDescription>
                Manage supplier information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                -
              </div>
              <p className="text-sm text-muted-foreground">Active suppliers</p>
            </CardContent>
          </Link>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Quick Stats
            </CardTitle>
            <CardDescription>
              Procurement overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pending:</span>
                <span className="font-medium">
                  {purchaseOrders.filter(po => ['draft', 'approved', 'sent'].includes(po.status)).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Received:</span>
                <span className="font-medium">
                  {purchaseOrders.filter(po => po.status === 'received').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total POs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchaseOrders.filter(po => ['draft', 'approved', 'sent'].includes(po.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchaseOrders.filter(po => po.status === 'received').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${purchaseOrders.reduce((sum, po) => sum + po.total, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search purchase orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsFormDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>Manage your purchase orders and track deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <PurchaseOrdersTable companyId={localStorage.getItem('companyId') || '68f5bc2cf855b93078938f4e'} />
        </CardContent>
      </Card>

      {/* Purchase Order Form Dialog */}
      <PurchaseOrderFormDialog
        open={isFormDialogOpen}
        onOpenChange={handleFormCancel}
        onSuccess={handleFormSuccess}
        initialData={pendingPOData}
      />
    </div>
  )
}
