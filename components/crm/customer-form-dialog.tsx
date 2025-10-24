"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api-client-config"
import { Loader2 } from "lucide-react"
import type { Customer } from "@/lib/types"

interface CustomerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  onSuccess?: () => void
}

export function CustomerFormDialog({ open, onOpenChange, customer, onSuccess }: CustomerFormDialogProps) {
  const { company, user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Jamaica",
    category: "",
    customerType: "",
    territory: "",
    assignedTo: "",
    paymentTerms: "Net 30",
    creditLimit: "",
    notes: "",
    businessType: "",
    industry: "",
    employeeCount: "",
    annualRevenue: "",
    website: "",
    preferredContactMethod: "",
    preferredDeliveryTime: "",
    specialInstructions: ""
  })

  // Reset form when dialog opens/closes or customer changes
  useEffect(() => {
    if (open) {
      if (customer) {
        // Edit mode - populate form with customer data
        setFormData({
          companyName: customer.companyName || "",
          contactPerson: customer.contactPerson || "",
          email: customer.email || "",
          phone: customer.phone || "",
          address: customer.address || "",
          city: customer.city || "",
          state: customer.state || "",
          postalCode: customer.postalCode || "",
          country: customer.country || "Jamaica",
          category: customer.category || "",
          customerType: customer.customerType || "",
          territory: customer.territory || "",
          assignedTo: customer.assignedTo || "",
          paymentTerms: customer.paymentTerms || "Net 30",
          creditLimit: customer.creditLimit?.toString() || "",
          notes: customer.notes || "",
          businessType: customer.businessType || "",
          industry: customer.industry || "",
          employeeCount: customer.employeeCount?.toString() || "",
          annualRevenue: customer.annualRevenue?.toString() || "",
          website: customer.website || "",
          preferredContactMethod: customer.preferredContactMethod || "",
          preferredDeliveryTime: customer.preferredDeliveryTime || "",
          specialInstructions: customer.specialInstructions || ""
        })
      } else {
        // Create mode - reset form
        setFormData({
          companyName: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          country: "Jamaica",
          category: "",
          customerType: "",
          territory: "",
          assignedTo: user?.id || "",
          paymentTerms: "Net 30",
          creditLimit: "",
          notes: "",
          businessType: "",
          industry: "",
          employeeCount: "",
          annualRevenue: "",
          website: "",
          preferredContactMethod: "",
          preferredDeliveryTime: "",
          specialInstructions: ""
        })
      }
    }
  }, [open, customer, user?.id])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!company?.id) {
      toast({
        title: "Error",
        description: "Company information not found",
        variant: "destructive",
      })
      return
    }

    // Validate required fields
    if (!formData.companyName || !formData.contactPerson || !formData.email || !formData.phone || !formData.category || !formData.customerType) {
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
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postalCode: formData.postalCode || undefined,
        country: formData.country,
        category: formData.category,
        customerType: formData.customerType,
        territory: formData.territory || undefined,
        assignedTo: formData.assignedTo || undefined,
        paymentTerms: formData.paymentTerms,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
        notes: formData.notes || undefined,
        businessType: formData.businessType || undefined,
        industry: formData.industry || undefined,
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
        annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : undefined,
        website: formData.website || undefined,
        preferredContactMethod: formData.preferredContactMethod || undefined,
        preferredDeliveryTime: formData.preferredDeliveryTime || undefined,
        specialInstructions: formData.specialInstructions || undefined
      }

      let response
      if (customer) {
        // Update existing customer
        response = await api.crm.customers.update(customer.id, submitData)
      } else {
        // Create new customer
        response = await api.crm.customers.create(submitData)
      }

      if (response.success) {
        toast({
          title: "Success",
          description: customer ? "Customer updated successfully" : "Customer created successfully",
        })
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to save customer",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Customer form submission error:', error)
      toast({
        title: "Error",
        description: "Failed to save customer",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <DialogDescription>
            {customer ? "Update customer information and details." : "Enter the details for the new customer."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Customer's company and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                    placeholder="Enter contact person name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
              <CardDescription>Customer's business address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Parish</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Enter state or parish"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jamaica">Jamaica</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Business Classification */}
          <Card>
            <CardHeader>
              <CardTitle>Business Classification</CardTitle>
              <CardDescription>Customer category and business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} required>
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
                  <Label htmlFor="customerType">Customer Type *</Label>
                  <Select value={formData.customerType} onValueChange={(value) => handleInputChange("customerType", value)} required>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    value={formData.businessType}
                    onChange={(e) => handleInputChange("businessType", e.target.value)}
                    placeholder="e.g., Corporation, LLC, Partnership"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                    placeholder="e.g., Hospitality, Retail, Construction"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Employee Count</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    value={formData.employeeCount}
                    onChange={(e) => handleInputChange("employeeCount", e.target.value)}
                    placeholder="Number of employees"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualRevenue">Annual Revenue (JMD)</Label>
                  <Input
                    id="annualRevenue"
                    type="number"
                    value={formData.annualRevenue}
                    onChange={(e) => handleInputChange("annualRevenue", e.target.value)}
                    placeholder="Annual revenue in JMD"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales & Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Sales & Payment</CardTitle>
              <CardDescription>Territory assignment and payment terms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="territory">Territory</Label>
                  <Input
                    id="territory"
                    value={formData.territory}
                    onChange={(e) => handleInputChange("territory", e.target.value)}
                    placeholder="e.g., Kingston, Montego Bay"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange("paymentTerms", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">Cash on Delivery</SelectItem>
                      <SelectItem value="Net 15">Net 15 Days</SelectItem>
                      <SelectItem value="Net 30">Net 30 Days</SelectItem>
                      <SelectItem value="Net 60">Net 60 Days</SelectItem>
                      <SelectItem value="Prepaid">Prepaid</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit (JMD)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => handleInputChange("creditLimit", e.target.value)}
                  placeholder="Credit limit in JMD"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences & Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences & Additional Information</CardTitle>
              <CardDescription>Communication preferences and special instructions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
                  <Select value={formData.preferredContactMethod} onValueChange={(value) => handleInputChange("preferredContactMethod", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredDeliveryTime">Preferred Delivery Time</Label>
                  <Input
                    id="preferredDeliveryTime"
                    value={formData.preferredDeliveryTime}
                    onChange={(e) => handleInputChange("preferredDeliveryTime", e.target.value)}
                    placeholder="e.g., 9 AM - 5 PM, Weekdays only"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
                  placeholder="Any special delivery or handling instructions"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes about this customer"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {customer ? "Updating..." : "Creating..."}
                </>
              ) : (
                customer ? "Update Customer" : "Create Customer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
