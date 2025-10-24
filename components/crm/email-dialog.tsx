"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Quote, Invoice } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"
import { Loader2, Mail } from "lucide-react"

interface EmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote?: Quote
  invoice?: Invoice
  onSuccess: () => void
}

export function EmailDialog({ open, onOpenChange, quote, invoice, onSuccess }: EmailDialogProps) {
  const { company, user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    to: "",
    cc: "",
    subject: "",
    message: "",
  })

  const document = quote || invoice
  const documentType = quote ? "quote" : "invoice"
  const documentNumber = quote?.quoteNumber || invoice?.invoiceNumber

  useEffect(() => {
    if (document && open) {
      const defaultSubject = quote 
        ? `Quote ${quote.quoteNumber} from ${company?.name || 'Bizabode'}`
        : `Invoice ${invoice?.invoiceNumber} from ${company?.name || 'Bizabode'}`

      const defaultMessage = quote
        ? `Dear ${quote.customerName},

Please find attached your quote ${quote.quoteNumber} for your review.

Quote Details:
- Total Amount: $${quote.total.toFixed(2)}
- Valid Until: ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}

If you have any questions or would like to proceed with this quote, please don't hesitate to contact us.

Best regards,
${user?.name || 'Sales Team'}
${company?.name || 'Bizabode'}`
        : `Dear ${invoice?.customerName},

Please find attached your invoice ${invoice?.invoiceNumber}.

Invoice Details:
- Total Amount: $${invoice?.total.toFixed(2)}
- Due Date: ${invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
- Amount Due: $${((invoice?.total || 0) - (invoice?.paidAmount || 0)).toFixed(2)}

Please process payment by the due date to avoid any late fees.

Best regards,
${user?.name || 'Accounts Team'}
${company?.name || 'Bizabode'}`

      setFormData({
        to: document.customerEmail,
        cc: "",
        subject: defaultSubject,
        message: defaultMessage,
      })
    }
  }, [document, open, quote, invoice, company?.name, user?.name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!document || !company?.id) {
      toast({
        title: "Error",
        description: "Document or company information is missing",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!formData.to || !formData.subject || !formData.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const emailData = {
        to: formData.to,
        cc: formData.cc || undefined,
        subject: formData.subject,
        message: formData.message,
        senderName: user?.name || "Sales Team",
        companyName: company.name || "Bizabode",
      }

      let response
      if (quote) {
        response = await api.crm.quotes.email(quote.id, emailData)
      } else if (invoice) {
        response = await api.crm.invoices.email(invoice.id, emailData)
      }

      if (response?.success) {
        toast({
          title: "Success",
          description: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} sent successfully`,
        })
        onOpenChange(false)
        onSuccess()
      } else {
        throw new Error(response?.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Failed to send email:", error)
      toast({
        title: "Error",
        description: `Failed to send ${documentType}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send {documentType.charAt(0).toUpperCase() + documentType.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Email {documentType} "{documentNumber}" to the customer
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{documentType.charAt(0).toUpperCase() + documentType.slice(1)} Summary</CardTitle>
              <CardDescription>Details of the document being sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Document:</span> {documentNumber}
                </div>
                <div>
                  <span className="font-medium">Customer:</span> {document.customerName}
                </div>
                <div>
                  <span className="font-medium">Total:</span> ${document.total.toFixed(2)}
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge variant="secondary" className="ml-2">
                    {document.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Details */}
          <Card>
            <CardHeader>
              <CardTitle>Email Details</CardTitle>
              <CardDescription>Configure the email message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="to">To *</Label>
                  <Input
                    id="to"
                    type="email"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cc">CC</Label>
                  <Input
                    id="cc"
                    type="email"
                    value={formData.cc}
                    onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                    placeholder="Additional recipients (optional)"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={8}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send {documentType.charAt(0).toUpperCase() + documentType.slice(1)}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
