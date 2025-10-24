"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api-client-config'

interface SatisfactionSurveyProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  orderNumber: string
  customerName: string
  onSurveyComplete?: (surveyData: any) => void
}

export function SatisfactionSurveyDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  customerName,
  onSurveyComplete
}: SatisfactionSurveyProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    overallRating: 0,
    deliveryRating: 0,
    productQualityRating: 0,
    customerServiceRating: 0,
    wouldRecommend: '',
    feedback: '',
    improvements: '',
    contactPreference: 'email'
  })

  const [hoveredStar, setHoveredStar] = useState(0)

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setFormData({
        overallRating: 0,
        deliveryRating: 0,
        productQualityRating: 0,
        customerServiceRating: 0,
        wouldRecommend: '',
        feedback: '',
        improvements: '',
        contactPreference: 'email'
      })
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.overallRating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide an overall rating.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const surveyData = {
        orderId,
        orderNumber,
        customerName,
        overallRating: formData.overallRating,
        deliveryRating: formData.deliveryRating,
        productQualityRating: formData.productQualityRating,
        customerServiceRating: formData.customerServiceRating,
        wouldRecommend: formData.wouldRecommend,
        feedback: formData.feedback,
        improvements: formData.improvements,
        contactPreference: formData.contactPreference,
        submittedBy: user?.id,
        submittedAt: new Date().toISOString()
      }

      const response = await api.post('/api/crm/customer-satisfaction', surveyData)

      if (response.success) {
        toast({
          title: "Survey submitted",
          description: "Thank you for your feedback!",
        })

        onSurveyComplete?.(surveyData)
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Failed to submit survey:', error)
      toast({
        title: "Submission failed",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    label 
  }: { 
    rating: number
    onRatingChange: (rating: number) => void
    label: string 
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="p-1"
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoveredStar || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating}/5` : 'Not rated'}
        </span>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customer Satisfaction Survey</DialogTitle>
          <DialogDescription>
            Help us improve by sharing your experience with order {orderNumber} for {customerName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-4">
            <StarRating
              rating={formData.overallRating}
              onRatingChange={(rating) => setFormData({ ...formData, overallRating: rating })}
              label="Overall Experience *"
            />
          </div>

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StarRating
              rating={formData.deliveryRating}
              onRatingChange={(rating) => setFormData({ ...formData, deliveryRating: rating })}
              label="Delivery"
            />
            <StarRating
              rating={formData.productQualityRating}
              onRatingChange={(rating) => setFormData({ ...formData, productQualityRating: rating })}
              label="Product Quality"
            />
            <StarRating
              rating={formData.customerServiceRating}
              onRatingChange={(rating) => setFormData({ ...formData, customerServiceRating: rating })}
              label="Customer Service"
            />
          </div>

          {/* Would Recommend */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Would you recommend us to others?</Label>
            <RadioGroup
              value={formData.wouldRecommend}
              onValueChange={(value) => setFormData({ ...formData, wouldRecommend: value })}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="recommend-yes" />
                <Label htmlFor="recommend-yes" className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="recommend-no" />
                <Label htmlFor="recommend-no" className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  No
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maybe" id="recommend-maybe" />
                <Label htmlFor="recommend-maybe">Maybe</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback">What did you like most about your experience?</Label>
            <Textarea
              id="feedback"
              value={formData.feedback}
              onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
              rows={3}
              placeholder="Tell us what went well..."
            />
          </div>

          {/* Improvements */}
          <div className="space-y-2">
            <Label htmlFor="improvements">How can we improve?</Label>
            <Textarea
              id="improvements"
              value={formData.improvements}
              onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
              rows={3}
              placeholder="Share any suggestions for improvement..."
            />
          </div>

          {/* Contact Preference */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">How would you like us to follow up?</Label>
            <RadioGroup
              value={formData.contactPreference}
              onValueChange={(value) => setFormData({ ...formData, contactPreference: value })}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="contact-email" />
                <Label htmlFor="contact-email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="contact-phone" />
                <Label htmlFor="contact-phone">Phone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="contact-none" />
                <Label htmlFor="contact-none">No follow-up needed</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || formData.overallRating === 0}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Survey
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
