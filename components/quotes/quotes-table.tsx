"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Plus, Search, FileText, Mail, ArrowRight, Loader2, Download } from "lucide-react"
import type { Quote } from "@/lib/types"
import { useQuotesInvoicesStore } from "@/lib/quotes-invoices-store"
import { QuoteFormDialog } from "./quote-form-dialog"
import { useRouter } from "next/navigation"
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
  accepted: "bg-green-500/10 text-green-700 dark:text-green-400",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
  expired: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
}

export function QuotesTable() {
  const { quotes, deleteQuote, convertQuoteToInvoice, fetchQuotes, isLoading } = useQuotesInvoicesStore()
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [deletingQuote, setDeletingQuote] = useState<Quote | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Fetch quotes from API on mount
  useEffect(() => {
    fetchQuotes()
  }, [])

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = async () => {
    if (deletingQuote) {
      try {
        await deleteQuote((deletingQuote as any)._id || deletingQuote.id)
        setDeletingQuote(null)
        toast({
          title: "Quote deleted",
          description: `Quote ${deletingQuote.quoteNumber} has been deleted.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete quote",
          variant: "destructive",
        })
      }
    }
  }

  const handleConvertToInvoice = async (quoteId: string) => {
    try {
      const invoiceId = await convertQuoteToInvoice(quoteId)
      toast({
        title: "Quote converted",
        description: "Quote has been converted to an invoice.",
      })
      router.push("/crm/invoices")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert quote",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPDF = async (quote: Quote) => {
    try {
      const response = await fetch(`/api/quotes/${(quote as any)._id || quote.id}/download-pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bizabode_token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('PDF download failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quote-${quote.quoteNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: `Quote PDF downloaded successfully`,
      })
    } catch (error) {
      console.error('Failed to download PDF:', error)
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      })
    }
  }

  const handleSendEmail = async (quote: Quote) => {
    try {
      const { apiClient } = await import("@/lib/api-client")
      
      await apiClient.emailQuote((quote as any)._id || quote.id)
      
      toast({
        title: "Success",
        description: `Quote emailed to ${quote.customerEmail}`,
      })
    } catch (error) {
      console.error('Failed to email quote:', error)
    toast({
        title: "Error",
        description: "Failed to email quote. Email service may not be configured.",
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
            placeholder="Search quotes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Quote
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
                <TableHead>Quote Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No quotes found
                  </TableCell>
                </TableRow>
              ) : (
              filteredQuotes.map((quote) => (
                <TableRow key={(quote as any)._id || quote.id}>
                  <TableCell className="font-mono font-medium">{quote.quoteNumber}</TableCell>
                  <TableCell>{quote.customerName}</TableCell>
                  <TableCell>{quote.customerEmail}</TableCell>
                  <TableCell className="text-right font-mono">${quote.total.toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(quote.validUntil), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[quote.status]}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {quote.status === "accepted" && (
                        <Button variant="ghost" size="icon" onClick={() => handleConvertToInvoice((quote as any)._id || quote.id)}>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadPDF(quote)} title="Download PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleSendEmail(quote)} title="Email Quote">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingQuote(quote)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingQuote(quote)}>
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

      <QuoteFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => setIsAddDialogOpen(false)}
      />

      <QuoteFormDialog
        open={!!editingQuote}
        onOpenChange={(open) => !open && setEditingQuote(null)}
        quote={editingQuote || undefined}
        onSuccess={() => setEditingQuote(null)}
      />

      <AlertDialog open={!!deletingQuote} onOpenChange={(open) => !open && setDeletingQuote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete quote "{deletingQuote?.quoteNumber}"? This action cannot be undone.
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
