"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Lead } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"
import { Loader2 } from "lucide-react"

interface LeadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead?: Lead
  onSuccess: () => void
}

export function LeadFormDialog({ open, onOpenChange, lead, onSuccess }: LeadFormDialogProps) {
  const { company, user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    status: "new" as Lead["status"],
    notes: "",
    // Enhanced fields
    category: "" as Lead["category"],
    productInterest: [] as string[],
    monthlyVolume: 0,
    territory: "",
    leadScore: 0,
    customerType: "" as Lead["customerType"],
  })

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        source: lead.source,
        status: lead.status,
        notes: lead.notes,
        category: lead.category || "",
        productInterest: lead.productInterest || [],
        monthlyVolume: lead.monthlyVolume || 0,
        territory: lead.territory || "",
        leadScore: lead.leadScore || 0,
        customerType: lead.customerType || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        source: "",
        status: "new",
        notes: "",
        category: "",
        productInterest: [],
        monthlyVolume: 0,
        territory: "",
        leadScore: 0,
        customerType: "",
      })
    }
  }, [lead, open])

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
    if (!formData.name || !formData.email || !formData.phone || !formData.company || !formData.source) {
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
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        source: formData.source,
        status: formData.status,
        notes: formData.notes || undefined,
        category: formData.category || undefined,
        productInterest: formData.productInterest.length > 0 ? formData.productInterest : undefined,
        monthlyVolume: formData.monthlyVolume || undefined,
        territory: formData.territory || undefined,
        leadScore: formData.leadScore || undefined,
        customerType: formData.customerType || undefined,
        assignedTo: user?.id || undefined,
      }

      let response
      if (lead) {
        response = await api.crm.leads.update(lead.id, submitData)
      } else {
        response = await api.crm.leads.create(submitData)
      }

      if (response.success) {
        toast({
          title: "Success",
          description: lead ? "Lead updated successfully" : "Lead created successfully",
        })
        onOpenChange(false)
        onSuccess()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to save lead",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to save lead:", error)
      toast({
        title: "Error",
        description: "Failed to save lead. Please try again.",
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
          <DialogTitle>{lead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
          <DialogDescription>
            {lead ? "Update the lead details below." : "Enter the details for the new lead."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., Website, Referral, Cold Call"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Lead["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="unqualified">Unqualified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Lead["category"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hotel">Hotel</SelectItem>
                  <SelectItem value="Supermarket">Supermarket</SelectItem>
                  <SelectItem value="Restaurant">Restaurant</SelectItem>
                  <SelectItem value="Contractor">Contractor</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerType">Customer Type</Label>
              <Select
                value={formData.customerType}
                onValueChange={(value) => setFormData({ ...formData, customerType: value as Lead["customerType"] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Volume Buyer">Volume Buyer</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Wholesale">Wholesale</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="territory">Territory</Label>
              <Input
                id="territory"
                value={formData.territory}
                onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                placeholder="e.g., Kingston, Montego Bay"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyVolume">Monthly Volume (JMD)</Label>
              <Input
                id="monthlyVolume"
                type="number"
                value={formData.monthlyVolume}
                onChange={(e) => setFormData({ ...formData, monthlyVolume: Number(e.target.value) })}
                placeholder="Estimated monthly order value"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productInterest">Product Interest</Label>
            <Input
              id="productInterest"
              value={formData.productInterest.join(", ")}
              onChange={(e) => setFormData({ 
                ...formData, 
                productInterest: e.target.value.split(",").map(item => item.trim()).filter(item => item)
              })}
              placeholder="e.g., Containers, Cups, Paper Products (comma separated)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional information about this lead..."
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
                  {lead ? "Updating..." : "Creating..."}
                </>
              ) : (
                lead ? "Update Lead" : "Add Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
