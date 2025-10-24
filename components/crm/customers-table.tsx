"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Eye, Star } from "lucide-react"
import type { Customer } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api-client-config"
import { formatCurrency } from "@/lib/utils/formatters"
import { getStatusColor, getCategoryColor } from "@/lib/utils/status-colors"
import SearchInput from "@/components/shared/SearchInput"
import Loading from "@/components/shared/Loading"
import { CustomerFormDialog } from "./customer-form-dialog"
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

export function CustomersTable() {
  const { company } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  // Fetch customers from API
  useEffect(() => {
    if (company?.id) {
      fetchCustomers()
    }
  }, [company?.id])

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const response = await api.crm.customers.list({
        companyId: company?.id || '',
        limit: 100
      })
      
      if (response.success) {
        setCustomers(response.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch customers",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (deletingCustomer) {
      try {
        const response = await api.crm.customers.delete(deletingCustomer.id)
        
        if (response.success) {
          setCustomers(customers.filter(customer => customer.id !== deletingCustomer.id))
          toast({
            title: "Success",
            description: "Customer deleted successfully",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to delete customer",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Failed to delete customer:', error)
        toast({
          title: "Error",
          description: "Failed to delete customer",
          variant: "destructive",
        })
      }
      setDeletingCustomer(null)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          placeholder="Search customers by name, company, email, or phone..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.companyName}</TableCell>
                    <TableCell>{customer.contactPerson}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(customer.category)}>
                        {customer.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {customer.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{customer.rating}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(customer.totalValue, 'JMD')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingCustomer(customer)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setEditingCustomer(customer)
                          setIsAddDialogOpen(true)
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingCustomer(customer)}>
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

      <CustomerFormDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (!open) {
            setEditingCustomer(null)
          }
        }}
        customer={editingCustomer}
        onSuccess={fetchCustomers}
      />

      <AlertDialog open={!!deletingCustomer} onOpenChange={(open) => !open && setDeletingCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete customer "{deletingCustomer?.companyName}"? This action cannot be undone.
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
