"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Opportunity } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"
import { Loader2 } from "lucide-react"

interface OpportunityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity?: Opportunity
  onSuccess: () => void
}

export function OpportunityFormDialog({ open, onOpenChange, opportunity, onSuccess }: OpportunityFormDialogProps) {
  const { company, user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    customerName: "",
    customerEmail: "",
    value: 0,
    stage: "prospecting" as Opportunity["stage"],
    probability: 25,
    expectedCloseDate: "",
    notes: "",
  })

  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title,
        customerName: opportunity.customerName,
        customerEmail: opportunity.customerEmail,
        value: opportunity.value,
        stage: opportunity.stage,
        probability: opportunity.probability,
        expectedCloseDate: new Date(opportunity.expectedCloseDate).toISOString().split("T")[0],
        notes: opportunity.notes,
      })
    } else {
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 30)

      setFormData({
        title: "",
        customerName: "",
        customerEmail: "",
        value: 0,
        stage: "prospecting",
        probability: 25,
        expectedCloseDate: defaultDate.toISOString().split("T")[0],
        notes: "",
      })
    }
  }, [opportunity, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!company?.id) {
      toast({
        title: "Error",
        description: "Company information is missing. Please log in again.",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!formData.title || !formData.customerName || !formData.customerEmail || !formData.expectedCloseDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        companyId: company.id,
        title: formData.title,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        value: formData.value,
        stage: formData.stage,
        probability: formData.probability,
        expectedCloseDate: new Date(formData.expectedCloseDate),
        notes: formData.notes || undefined,
        assignedTo: user?.id || undefined,
      }

      let response
      if (opportunity) {
        response = await api.crm.opportunities.update(opportunity.id, submitData)
      } else {
        response = await api.crm.opportunities.create(submitData)
      }

      if (response.success) {
        toast({
          title: "Success",
          description: opportunity ? "Opportunity updated successfully" : "Opportunity created successfully",
        })
        onOpenChange(false)
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to save opportunity",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to save opportunity:", error)
      toast({
        title: "Error",
        description: "Failed to save opportunity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{opportunity ? "Edit Opportunity" : "Add New Opportunity"}</DialogTitle>
          <DialogDescription>
            {opportunity ? "Update the opportunity details below." : "Enter the details for the new opportunity."}
          </DialogDescription>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value ($)</Label>
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
              <Label htmlFor="stage">Stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => setFormData({ ...formData, stage: value as Opportunity["stage"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospecting">Prospecting</SelectItem>
                  <SelectItem value="qualification">Qualification</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed-won">Closed Won</SelectItem>
                  <SelectItem value="closed-lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number.parseInt(e.target.value) || 0 })}
                required
              />
            </div>
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
                  {opportunity ? "Updating..." : "Creating..."}
                </>
              ) : (
                opportunity ? "Update Opportunity" : "Add Opportunity"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
