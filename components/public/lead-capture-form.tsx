"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface LeadCaptureFormProps {
  companyId?: string
  title?: string
  description?: string
  showCategory?: boolean
  showProductInterest?: boolean
  showMessage?: boolean
  className?: string
  onSuccess?: (leadId: string) => void
  onError?: (error: string) => void
}

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  category?: string
  productInterest?: string
  message?: string
}

export function LeadCaptureForm({
  companyId,
  title = "Get in Touch",
  description = "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
  showCategory = true,
  showProductInterest = true,
  showMessage = true,
  className = "",
  onSuccess,
  onError
}: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    category: '',
    productInterest: '',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = {
        ...formData,
        source: 'Website Form',
        companyId
      }

      const response = await fetch('/api/public/leads/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        onSuccess?.(result.leadId)
      } else {
        setError(result.error || 'Failed to submit form')
        onError?.(result.error || 'Failed to submit form')
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isSuccess) {
    return (
      <Card className={`max-w-md mx-auto ${className}`}>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">Thank You!</h3>
          <p className="text-gray-600">
            Your message has been sent successfully. We'll get back to you soon.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder="Your full name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              placeholder="your.email@company.com"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
              placeholder="Your phone number"
            />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              required
              placeholder="Your company name"
            />
          </div>

          {/* Category */}
          {showCategory && (
            <div className="space-y-2">
              <Label htmlFor="category">Business Type</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your business type" />
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
          )}

          {/* Product Interest */}
          {showProductInterest && (
            <div className="space-y-2">
              <Label htmlFor="productInterest">Product Interest</Label>
              <Input
                id="productInterest"
                type="text"
                value={formData.productInterest}
                onChange={(e) => handleInputChange('productInterest', e.target.value)}
                placeholder="e.g., Containers, Cups, Paper Products"
              />
            </div>
          )}

          {/* Message */}
          {showMessage && (
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={3}
                placeholder="Tell us about your needs..."
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Standalone widget for embedding in external websites
export function EmbeddableLeadCaptureWidget() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <LeadCaptureForm
        title="Contact Us"
        description="Ready to get started? Fill out the form below and we'll be in touch!"
        showCategory={true}
        showProductInterest={true}
        showMessage={true}
      />
    </div>
  )
}

// Compact version for sidebars or smaller spaces
export function CompactLeadCaptureForm(props: Omit<LeadCaptureFormProps, 'className'>) {
  return (
    <LeadCaptureForm
      {...props}
      className="max-w-sm"
      title="Quick Contact"
      description="Get in touch with us"
      showCategory={false}
      showProductInterest={false}
      showMessage={false}
    />
  )
}

// Full-page version for dedicated contact pages
export function FullPageLeadCaptureForm(props: Omit<LeadCaptureFormProps, 'className'>) {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {props.title || "Get in Touch"}
          </h1>
          <p className="text-lg text-gray-600">
            {props.description || "We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
          </p>
        </div>
        
        <LeadCaptureForm
          {...props}
          className="max-w-lg mx-auto"
          showCategory={true}
          showProductInterest={true}
          showMessage={true}
        />
      </div>
    </div>
  )
}
