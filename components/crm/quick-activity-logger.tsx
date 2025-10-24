"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Phone, MapPin, Clock, Calendar, CheckCircle, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"

interface QuickActivityLoggerProps {
  relatedTo?: 'Lead' | 'Opportunity' | 'Customer' | 'Quote' | 'Order' | 'Invoice'
  relatedId?: string
  relatedName?: string
  onActivityLogged?: () => void
  className?: string
}

interface QuickActivity {
  type: 'Call' | 'Visit' | 'Email' | 'WhatsApp' | 'Note'
  subject: string
  description: string
  outcome: string
  duration: number
  followUpRequired: boolean
  followUpDate?: string
}

export function QuickActivityLogger({
  relatedTo = 'Lead',
  relatedId = '',
  relatedName = '',
  onActivityLogged,
  className = ''
}: QuickActivityLoggerProps) {
  const { user, company } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<QuickActivity['type']>('Call')
  const [isExpanded, setIsExpanded] = useState(false)
  const [formData, setFormData] = useState<QuickActivity>({
    type: 'Call',
    subject: '',
    description: '',
    outcome: '',
    duration: 15,
    followUpRequired: false,
    followUpDate: ''
  })

  const activityTypes = [
    { 
      value: 'Call' as const, 
      label: 'Quick Call', 
      icon: Phone, 
      color: 'bg-blue-100 text-blue-700',
      defaultSubject: 'Phone call',
      defaultDuration: 15
    },
    { 
      value: 'Visit' as const, 
      label: 'Site Visit', 
      icon: MapPin, 
      color: 'bg-green-100 text-green-700',
      defaultSubject: 'Site visit',
      defaultDuration: 60
    },
    { 
      value: 'Email' as const, 
      label: 'Email', 
      icon: Clock, 
      color: 'bg-purple-100 text-purple-700',
      defaultSubject: 'Email correspondence',
      defaultDuration: 5
    },
    { 
      value: 'WhatsApp' as const, 
      label: 'WhatsApp', 
      icon: Clock, 
      color: 'bg-green-100 text-green-700',
      defaultSubject: 'WhatsApp message',
      defaultDuration: 5
    },
    { 
      value: 'Note' as const, 
      label: 'Quick Note', 
      icon: Clock, 
      color: 'bg-gray-100 text-gray-700',
      defaultSubject: 'Note',
      defaultDuration: 0
    }
  ]

  const outcomeOptions = [
    { value: 'Interested', label: '✅ Interested', color: 'text-green-600' },
    { value: 'Follow-up Needed', label: '📞 Follow-up Needed', color: 'text-yellow-600' },
    { value: 'Not Interested', label: '❌ Not Interested', color: 'text-red-600' },
    { value: 'Meeting Scheduled', label: '📅 Meeting Scheduled', color: 'text-blue-600' },
    { value: 'Quote Requested', label: '💰 Quote Requested', color: 'text-purple-600' },
    { value: 'Information Provided', label: '📋 Information Provided', color: 'text-gray-600' },
    { value: 'No Response', label: '📵 No Response', color: 'text-gray-400' }
  ]

  const handleTypeSelect = (type: QuickActivity['type']) => {
    const typeConfig = activityTypes.find(t => t.value === type)
    setSelectedType(type)
    setFormData(prev => ({
      ...prev,
      type,
      subject: typeConfig?.defaultSubject || '',
      duration: typeConfig?.defaultDuration || 15
    }))
    setIsExpanded(true)
  }

  const handleQuickLog = async () => {
    if (!user || !company || !formData.subject) {
      toast({
        title: "Error",
        description: "Please fill in the required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const activityData = {
        type: formData.type,
        subject: formData.subject,
        description: formData.description,
        outcome: formData.outcome,
        duration: formData.duration,
        scheduledDate: new Date().toISOString(),
        completedDate: new Date().toISOString(),
        followUpRequired: formData.followUpRequired,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate).toISOString() : undefined,
        relatedTo,
        relatedId,
        relatedName,
        assignedTo: user.id,
        status: 'Completed',
        priority: 'Medium',
        companyId: company.id,
        createdBy: user.id
      }

      await api.crm.activities.create(activityData)
      
      toast({
        title: "Activity Logged",
        description: `${formData.type} activity logged successfully`,
      })

      // Reset form
      setFormData({
        type: 'Call',
        subject: '',
        description: '',
        outcome: '',
        duration: 15,
        followUpRequired: false,
        followUpDate: ''
      })
      setIsExpanded(false)
      setSelectedType('Call')

      onActivityLogged?.()
    } catch (error) {
      console.error('Error logging activity:', error)
      toast({
        title: "Error",
        description: "Failed to log activity",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      type: 'Call',
      subject: '',
      description: '',
      outcome: '',
      duration: 15,
      followUpRequired: false,
      followUpDate: ''
    })
    setIsExpanded(false)
    setSelectedType('Call')
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <Card className={`${className} border-dashed`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Quick Activity Logger
        </CardTitle>
        {relatedName && (
          <CardDescription className="text-xs">
            Logging for: <Badge variant="outline" className="text-xs">{relatedName}</Badge>
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isExpanded ? (
          // Quick Action Buttons
          <div className="grid grid-cols-2 gap-2">
            {activityTypes.map((type) => {
              const Icon = type.icon
              return (
                <Button
                  key={type.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTypeSelect(type.value)}
                  className={`h-auto p-3 flex flex-col items-center gap-1 hover:${type.color.replace('100', '200')} border-dashed`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{type.label}</span>
                </Button>
              )
            })}
          </div>
        ) : (
          // Expanded Form
          <div className="space-y-4">
            {/* Activity Type Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(() => {
                  const typeConfig = activityTypes.find(t => t.value === selectedType)
                  const Icon = typeConfig?.icon || Clock
                  return (
                    <>
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{typeConfig?.label}</span>
                    </>
                  )
                })()}
              </div>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <Input
                placeholder="What did you discuss?"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Textarea
                placeholder="Additional details (optional)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            {/* Outcome and Duration */}
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={formData.outcome}
                onValueChange={(value) => setFormData(prev => ({ ...prev, outcome: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  {outcomeOptions.map(outcome => (
                    <SelectItem key={outcome.value} value={outcome.value}>
                      <span className={outcome.color}>{outcome.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  className="text-sm"
                  placeholder="Minutes"
                />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            </div>

            {/* Follow-up */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="followUp"
                  checked={formData.followUpRequired}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, followUpRequired: !!checked }))
                  }
                  aria-label="Schedule follow-up"
                />
                <label htmlFor="followUp" className="text-sm">Schedule follow-up</label>
              </div>

              {formData.followUpRequired && (
                <Input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                  min={getTomorrowDate()}
                  className="text-sm"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={handleQuickLog} 
                size="sm" 
                className="flex-1"
                disabled={loading || !formData.subject}
              >
                {loading ? (
                  <>
                    <Clock className="mr-1 h-3 w-3 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Log Activity
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}