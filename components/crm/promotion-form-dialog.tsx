"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, Percent, DollarSign, Tag, Target } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"

interface Promotion {
  id?: string
  name: string
  description: string
  type: 'Percentage' | 'Fixed Amount' | 'Buy One Get One' | 'Free Shipping' | 'Bundle Deal'
  discountValue: number
  minimumOrderValue?: number
  maximumDiscount?: number
  startDate: Date
  endDate: Date
  isActive: boolean
  applicableProducts: string[]
  applicableCustomers: string[]
  customerSegments: string[]
  usageLimit?: number
  usageCount: number
  promoCode?: string
  isCodeRequired: boolean
  priority: number
  terms: string
  targetAudience: 'All Customers' | 'New Customers' | 'Existing Customers' | 'VIP Customers' | 'Specific Segment'
  channels: string[]
  autoApply: boolean
}

interface PromotionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotion?: Promotion
  onSuccess: () => void
}

export function PromotionFormDialog({ 
  open, 
  onOpenChange, 
  promotion, 
  onSuccess 
}: PromotionFormDialogProps) {
  const { user, company } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [productInput, setProductInput] = useState('')
  const [customerInput, setCustomerInput] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Percentage' as Promotion['type'],
    discountValue: 10,
    minimumOrderValue: 0,
    maximumDiscount: 0,
    isActive: true,
    applicableProducts: [] as string[],
    applicableCustomers: [] as string[],
    customerSegments: [] as string[],
    usageLimit: 0,
    usageCount: 0,
    promoCode: '',
    isCodeRequired: false,
    priority: 1,
    terms: '',
    targetAudience: 'All Customers' as Promotion['targetAudience'],
    channels: [] as string[],
    autoApply: false
  })

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        discountValue: promotion.discountValue,
        minimumOrderValue: promotion.minimumOrderValue || 0,
        maximumDiscount: promotion.maximumDiscount || 0,
        isActive: promotion.isActive,
        applicableProducts: promotion.applicableProducts,
        applicableCustomers: promotion.applicableCustomers,
        customerSegments: promotion.customerSegments,
        usageLimit: promotion.usageLimit || 0,
        usageCount: promotion.usageCount,
        promoCode: promotion.promoCode || '',
        isCodeRequired: promotion.isCodeRequired,
        priority: promotion.priority,
        terms: promotion.terms,
        targetAudience: promotion.targetAudience,
        channels: promotion.channels,
        autoApply: promotion.autoApply
      })
      setStartDate(new Date(promotion.startDate))
      setEndDate(new Date(promotion.endDate))
    } else {
      // Reset form for new promotion
      const today = new Date()
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      
      setFormData({
        name: '',
        description: '',
        type: 'Percentage',
        discountValue: 10,
        minimumOrderValue: 0,
        maximumDiscount: 0,
        isActive: true,
        applicableProducts: [],
        applicableCustomers: [],
        customerSegments: [],
        usageLimit: 0,
        usageCount: 0,
        promoCode: '',
        isCodeRequired: false,
        priority: 1,
        terms: '',
        targetAudience: 'All Customers',
        channels: [],
        autoApply: false
      })
      setStartDate(today)
      setEndDate(nextMonth)
    }
  }, [promotion, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !company || !startDate || !endDate) return

    if (startDate >= endDate) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const promotionData = {
        ...formData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        companyId: company.id,
        createdBy: user.id
      }

      if (promotion?.id) {
        await api.crm.promotions.update(promotion.id, promotionData)
        toast({
          title: "Success",
          description: "Promotion updated successfully"
        })
      } else {
        await api.crm.promotions.create(promotionData)
        toast({
          title: "Success", 
          description: "Promotion created successfully"
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving promotion:', error)
      toast({
        title: "Error",
        description: "Failed to save promotion",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generatePromoCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setFormData(prev => ({ ...prev, promoCode: code }))
  }

  const addProduct = () => {
    if (productInput.trim() && !formData.applicableProducts.includes(productInput.trim())) {
      setFormData(prev => ({
        ...prev,
        applicableProducts: [...prev.applicableProducts, productInput.trim()]
      }))
      setProductInput('')
    }
  }

  const removeProduct = (product: string) => {
    setFormData(prev => ({
      ...prev,
      applicableProducts: prev.applicableProducts.filter(p => p !== product)
    }))
  }

  const addCustomer = () => {
    if (customerInput.trim() && !formData.applicableCustomers.includes(customerInput.trim())) {
      setFormData(prev => ({
        ...prev,
        applicableCustomers: [...prev.applicableCustomers, customerInput.trim()]
      }))
      setCustomerInput('')
    }
  }

  const removeCustomer = (customer: string) => {
    setFormData(prev => ({
      ...prev,
      applicableCustomers: prev.applicableCustomers.filter(c => c !== customer)
    }))
  }

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }))
  }

  const promotionTypes = [
    { value: 'Percentage', label: 'Percentage Discount', icon: Percent, suffix: '%' },
    { value: 'Fixed Amount', label: 'Fixed Amount Off', icon: DollarSign, suffix: '$' },
    { value: 'Buy One Get One', label: 'Buy One Get One', icon: Tag, suffix: '' },
    { value: 'Free Shipping', label: 'Free Shipping', icon: Target, suffix: '' },
    { value: 'Bundle Deal', label: 'Bundle Deal', icon: Tag, suffix: '%' }
  ]

  const targetAudienceOptions = [
    { value: 'All Customers', label: 'All Customers' },
    { value: 'New Customers', label: 'New Customers Only' },
    { value: 'Existing Customers', label: 'Existing Customers' },
    { value: 'VIP Customers', label: 'VIP Customers' },
    { value: 'Specific Segment', label: 'Specific Customer Segment' }
  ]

  const channelOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Mobile App', label: 'Mobile App' },
    { value: 'Email', label: 'Email Campaign' },
    { value: 'SMS', label: 'SMS Campaign' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'In-Store', label: 'In-Store' },
    { value: 'Phone Orders', label: 'Phone Orders' }
  ]

  const selectedType = promotionTypes.find(t => t.value === formData.type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {promotion ? 'Edit Promotion' : 'Create New Promotion'}
          </DialogTitle>
          <DialogDescription>
            Create promotional offers and discounts for your customers
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Promotion Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Summer Sale 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                placeholder="1 (highest) - 10 (lowest)"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the promotion and its benefits"
              rows={3}
            />
          </div>

          {/* Promotion Type and Value */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Promotion Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Promotion['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {promotionTypes.map(type => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountValue">
                Discount Value {selectedType?.suffix && `(${selectedType.suffix})`}
              </Label>
              <div className="relative">
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  step={formData.type === 'Percentage' ? '1' : '0.01'}
                  max={formData.type === 'Percentage' ? '100' : undefined}
                  value={formData.discountValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                  required
                />
                {selectedType?.suffix && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {selectedType.suffix}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumOrderValue">Minimum Order Value ($)</Label>
              <Input
                id="minimumOrderValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.minimumOrderValue}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumOrderValue: parseFloat(e.target.value) || 0 }))}
                placeholder="0 for no minimum"
              />
            </div>
          </div>

          {/* Maximum Discount and Usage Limit */}
          {(formData.type === 'Percentage' || formData.type === 'Buy One Get One') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maximumDiscount">Maximum Discount Amount ($)</Label>
                <Input
                  id="maximumDiscount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maximumDiscount}
                  onChange={(e) => setFormData(prev => ({ ...prev, maximumDiscount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0 for no limit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="0"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: parseInt(e.target.value) || 0 }))}
                  placeholder="0 for unlimited"
                />
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Promo Code */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCodeRequired"
                checked={formData.isCodeRequired}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isCodeRequired: !!checked }))
                }
              />
              <Label htmlFor="isCodeRequired">Require promo code</Label>
            </div>

            {formData.isCodeRequired && (
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <Input
                    value={formData.promoCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, promoCode: e.target.value.toUpperCase() }))}
                    placeholder="Enter promo code"
                  />
                </div>
                <Button type="button" variant="outline" onClick={generatePromoCode}>
                  Generate
                </Button>
              </div>
            )}
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Select
              value={formData.targetAudience}
              onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value as Promotion['targetAudience'] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target audience" />
              </SelectTrigger>
              <SelectContent>
                {targetAudienceOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Applicable Products */}
          <div className="space-y-2">
            <Label>Applicable Products (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                placeholder="Enter product name or SKU"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addProduct()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addProduct}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.applicableProducts.map(product => (
                <Badge key={product} variant="secondary" className="flex items-center gap-1">
                  {product}
                  <button
                    type="button"
                    onClick={() => removeProduct(product)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Applicable Customers */}
          {formData.targetAudience === 'Specific Segment' && (
            <div className="space-y-2">
              <Label>Specific Customers</Label>
              <div className="flex gap-2">
                <Input
                  value={customerInput}
                  onChange={(e) => setCustomerInput(e.target.value)}
                  placeholder="Enter customer name or email"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomer()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCustomer}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.applicableCustomers.map(customer => (
                  <Badge key={customer} variant="secondary" className="flex items-center gap-1">
                    {customer}
                    <button
                      type="button"
                      onClick={() => removeCustomer(customer)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Channels */}
          <div className="space-y-2">
            <Label>Sales Channels</Label>
            <div className="grid grid-cols-3 gap-2">
              {channelOptions.map(channel => (
                <div key={channel.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`channel-${channel.value}`}
                    checked={formData.channels.includes(channel.value)}
                    onCheckedChange={() => toggleChannel(channel.value)}
                  />
                  <Label htmlFor={`channel-${channel.value}`} className="text-sm">
                    {channel.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoApply"
                checked={formData.autoApply}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, autoApply: !!checked }))
                }
              />
              <Label htmlFor="autoApply">Auto-apply (no code required)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isActive: !!checked }))
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <Label htmlFor="terms">Terms and Conditions</Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              placeholder="Enter terms and conditions for this promotion"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                promotion ? 'Update Promotion' : 'Create Promotion'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
