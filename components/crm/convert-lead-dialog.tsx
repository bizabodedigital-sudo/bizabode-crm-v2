"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Lead } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"
import { Loader2 } from "lucide-react"

interface ConvertLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: Lead
  onSuccess: () => void
}

export function ConvertLeadDialog({ open, onOpenChange, lead, onSuccess }: ConvertLeadDialogProps) {
  const router = useRouter()
  const { company, user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    value: 0,
    expectedCloseDate: "",
    notes: "",
  })

  useEffect(() => {
    if (lead && open) {
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 30)

      setFormData({
        title: `${lead.company} Deal`,
        value: 0,
        expectedCloseDate: defaultDate.toISOString().split("T")[0],
        notes: lead.notes,
      })
    }
  }, [lead, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!lead || !company?.id) {
      toast({
        title: "Error",
        description: "Lead or company information is missing",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!formData.title || !formData.value || !formData.expectedCloseDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Create the opportunity
      const opportunityData = {
        companyId: company.id,
        title: formData.title,
        customerName: lead.name,
        customerEmail: lead.email,
        value: formData.value,
        stage: "prospecting",
        probability: 25,
        expectedCloseDate: new Date(formData.expectedCloseDate),
        notes: formData.notes || `Converted from lead: ${lead.name} (${lead.company})`,
        assignedTo: user?.id || undefined,
        leadId: lead.id, // Link back to original lead
      }

      const opportunityResponse = await api.crm.opportunities.create(opportunityData)

      if (!opportunityResponse.success) {
        throw new Error(opportunityResponse.error || "Failed to create opportunity")
      }

      // Step 2: Update the lead status to "converted"
      const leadUpdateResponse = await api.crm.leads.update(lead.id, {
        status: "qualified",
        notes: `${lead.notes || ""}\n\nConverted to opportunity: ${formData.title}`,
        convertedToOpportunityId: opportunityResponse.data.id,
        convertedAt: new Date(),
      })

      if (leadUpdateResponse.success) {
        toast({
          title: "Success",
          description: "Lead successfully converted to opportunity",
        })
        onOpenChange(false)
        onSuccess()
        router.push("/crm/opportunities")
      } else {
        // Opportunity was created but lead update failed - still show success
        toast({
          title: "Partial Success",
          description: "Opportunity created but lead status update failed",
          variant: "destructive",
        })
        onOpenChange(false)
        onSuccess()
        router.push("/crm/opportunities")
      }
    } catch (error) {
      console.error("Failed to convert lead:", error)
      toast({
        title: "Error",
        description: "Failed to convert lead to opportunity",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert Lead to Opportunity</DialogTitle>
          <DialogDescription>Create an opportunity from {lead.name}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Opportunity Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Estimated Value ($)</Label>
            <Input
              id="value"
              type="number"
              min="0"
              step="0.01"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Number.parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
            <Input
              id="expectedCloseDate"
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                "Convert to Opportunity"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
