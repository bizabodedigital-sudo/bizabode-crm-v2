"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Building2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { SupplierFormDialog } from "@/components/procurement/supplier-form-dialog"

interface Supplier {
  _id: string
  name: string
  email: string
  phone: string
  contactPerson: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  taxId: string
  isActive: boolean
  createdAt: string
}

export default function SuppliersPage() {
  const { company } = useAuth()
  const { toast } = useToast()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/procurement/suppliers?companyId=${company?.id}`)
      const data = await response.json()
      
      if (data.success) {
        setSuppliers(data.data.suppliers || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch suppliers",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setIsFormDialogOpen(true)
  }

  const handleDelete = async (supplierId: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return

    try {
      const response = await fetch(`/api/procurement/suppliers/${supplierId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Supplier deleted successfully",
        })
        fetchSuppliers()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete supplier",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to delete supplier:', error)
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      })
    }
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your supplier relationships and contact information
          </p>
        </div>
        <Button onClick={() => setIsFormDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Suppliers</CardTitle>
          <CardDescription>
            View and manage all your suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading suppliers...</p>
              </div>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No suppliers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No suppliers match your search criteria." : "Get started by adding your first supplier."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsFormDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier._id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone || '-'}</TableCell>
                    <TableCell>{supplier.contactPerson || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={supplier.isActive ? "default" : "secondary"}>
                        {supplier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(supplier._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SupplierFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onSuccess={() => {
          fetchSuppliers()
          setIsFormDialogOpen(false)
        }}
        supplier={editingSupplier}
      />
    </div>
  )
}