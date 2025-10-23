"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Filter, Package, DollarSign, AlertTriangle, Eye, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { api, endpoints } from '@/lib/api-client-config'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { getStatusColor } from '@/lib/utils/status-colors'
import SearchInput from '@/components/shared/SearchInput'
import Loading from '@/components/shared/Loading'

interface Product {
  id: string
  companyId: string
  name: string
  description: string
  sku: string
  category: string
  subcategory?: string
  brand?: string
  unit: string
  price: number
  cost: number
  margin: number
  images: string[]
  stock: {
    quantity: number
    reserved: number
    available: number
    reorderLevel: number
    reorderQuantity: number
  }
  status: string
  tags: string[]
  isDigital: boolean
  requiresShipping: boolean
  taxCategory: string
  supplier?: {
    name: string
    contact: string
    email: string
    phone: string
  }
  createdAt: string
  updatedAt: string
}

export function ProductsTable() {
  const { company } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [lowStockFilter, setLowStockFilter] = useState('')

  useEffect(() => {
    if (company?.id) {
      fetchProducts()
    }
  }, [company?.id])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: Record<string, string | number | boolean> = {
        companyId: company?.id || '',
        limit: 100
      }

      if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter
      if (lowStockFilter && lowStockFilter !== 'all') params.lowStock = lowStockFilter
      if (searchTerm) params.search = searchTerm

      const response = await api.get(endpoints.crm.products, params)
      
      if (response.success) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = (available: number, reorderLevel: number) => {
    if (available <= 0) return { status: 'Out of Stock', color: 'text-red-600' }
    if (available <= reorderLevel) return { status: 'Low Stock', color: 'text-orange-600' }
    return { status: 'In Stock', color: 'text-green-600' }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Loading />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>
              Manage your product catalog with inventory and pricing
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <SearchInput
            placeholder="Search products..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Clothing">Clothing</SelectItem>
              <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
              <SelectItem value="Home & Garden">Home & Garden</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Books">Books</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>
          <Select value={lowStockFilter} onValueChange={setLowStockFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="true">Low Stock</SelectItem>
              <SelectItem value="false">In Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock.available, product.stock.reorderLevel)
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                            {product.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {product.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {product.tags.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{product.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{product.sku}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{product.category}</div>
                          {product.subcategory && (
                            <div className="text-xs text-gray-500">{product.subcategory}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">{formatCurrency(product.price)}</div>
                            <div className="text-xs text-gray-500">Cost: {formatCurrency(product.cost)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm">
                            {product.stock.available} / {product.stock.quantity}
                          </div>
                          <div className={`text-xs ${stockStatus.color}`}>
                            {stockStatus.status}
                          </div>
                          {product.stock.available <= product.stock.reorderLevel && (
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(product.status)}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.supplier ? (
                          <div>
                            <div className="text-sm">{product.supplier.name}</div>
                            <div className="text-xs text-gray-500">{product.supplier.contact}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No supplier</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
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
      </CardContent>
    </Card>
  )
}
