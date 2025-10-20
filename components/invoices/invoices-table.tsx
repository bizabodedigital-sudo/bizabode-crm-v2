"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Plus, Search, FileText, Mail, DollarSign, Loader2, Download } from "lucide-react"
import type { Invoice } from "@/lib/types"
import { useQuotesInvoicesStore } from "@/lib/quotes-invoices-store"
import { InvoiceFormDialog } from "./invoice-form-dialog"
import { PaymentDialog } from "./payment-dialog"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
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

const statusColors = {
  draft: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  sent: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  paid: "bg-green-500/10 text-green-700 dark:text-green-400",
  partial: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  overdue: "bg-red-500/10 text-red-700 dark:text-red-400",
  cancelled: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
}

export function InvoicesTable() {
  const { invoices, deleteInvoice, fetchInvoices, isLoading } = useQuotesInvoicesStore()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null)
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Fetch invoices from API on mount
  useEffect(() => {
    fetchInvoices()
  }, [])

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = async () => {
    if (deletingInvoice) {
      try {
        await deleteInvoice((deletingInvoice as any)._id || deletingInvoice.id)
        setDeletingInvoice(null)
        toast({
          title: "Invoice deleted",
          description: `Invoice ${deletingInvoice.invoiceNumber} has been deleted.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete invoice",
          variant: "destructive",
        })
      }
    }
  }

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const { apiClient } = await import("@/lib/api-client")
      
      const blob = await apiClient.getInvoicePDF((invoice as any)._id || invoice.id)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice.invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: `Invoice PDF downloaded successfully`,
      })
    } catch (error) {
      console.error('Failed to download PDF:', error)
      toast({
        title: "Error",
        description: `Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  const handleSendEmail = async (invoice: Invoice) => {
    try {
      const { apiClient } = await import("@/lib/api-client")
      
      await apiClient.emailInvoice((invoice as any)._id || invoice.id)
      
      toast({
        title: "Success",
        description: `Invoice emailed to ${invoice.customerEmail}`,
      })
    } catch (error) {
      console.error('Failed to email invoice:', error)
      toast({
        title: "Error",
        description: `Failed to email invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
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
                <TableHead>Invoice Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={(invoice as any)._id || invoice.id}>
                  <TableCell className="font-mono font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell className="text-right font-mono">${invoice.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono">${invoice.paidAmount.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[invoice.status]}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                        <Button variant="ghost" size="icon" onClick={() => setPaymentInvoice(invoice)}>
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(invoice)} title="Download PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleSendEmail(invoice)} title="Email Invoice">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingInvoice(invoice)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingInvoice(invoice)}>
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

      <InvoiceFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => setIsAddDialogOpen(false)}
      />

      <InvoiceFormDialog
        open={!!editingInvoice}
        onOpenChange={(open) => !open && setEditingInvoice(null)}
        invoice={editingInvoice || undefined}
        onSuccess={() => setEditingInvoice(null)}
      />

      <PaymentDialog
        open={!!paymentInvoice}
        onOpenChange={(open) => !open && setPaymentInvoice(null)}
        invoice={paymentInvoice || undefined}
        onSuccess={() => setPaymentInvoice(null)}
      />

      <AlertDialog open={!!deletingInvoice} onOpenChange={(open) => !open && setDeletingInvoice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice "{deletingInvoice?.invoiceNumber}"? This action cannot be undone.
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
