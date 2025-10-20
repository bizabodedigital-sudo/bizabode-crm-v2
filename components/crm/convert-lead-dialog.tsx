"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Lead } from "@/lib/types"
import { useCRMStore } from "@/lib/crm-store"
import { useRouter } from "next/navigation"

interface ConvertLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: Lead
  onSuccess: () => void
}

export function ConvertLeadDialog({ open, onOpenChange, lead, onSuccess }: ConvertLeadDialogProps) {
  const { convertLeadToOpportunity } = useCRMStore()
  const router = useRouter()
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

    if (!lead) return

    const opportunityId = await convertLeadToOpportunity((lead as any)._id || lead.id, {
      title: formData.title,
      value: formData.value,
      expectedCloseDate: new Date(formData.expectedCloseDate),
      notes: formData.notes,
    })

    onSuccess()
    router.push("/crm/opportunities")
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
            <Button type="submit">Convert to Opportunity</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
