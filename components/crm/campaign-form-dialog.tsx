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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Clock, Mail, MessageSquare, Users, Target, BarChart3, Send } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"

interface Campaign {
  id?: string
  name: string
  description: string
  type: 'Email' | 'SMS' | 'Push Notification' | 'Social Media' | 'Multi-Channel'
  status: 'Draft' | 'Scheduled' | 'Active' | 'Paused' | 'Completed' | 'Cancelled'
  objective: 'Lead Generation' | 'Customer Retention' | 'Product Launch' | 'Promotion' | 'Event' | 'Survey' | 'Other'
  targetAudience: {
    segments: string[]
    customerTags: string[]
    demographics: {
      ageRange?: string
      location?: string[]
      purchaseHistory?: string
      lastActivity?: string
    }
    customFilters: string[]
    estimatedReach: number
  }
  content: {
    subject?: string
    message: string
    callToAction: string
    attachments?: string[]
    template?: string
  }
  schedule: {
    startDate: Date
    endDate?: Date
    sendTime?: string
    timezone: string
    frequency?: 'Once' | 'Daily' | 'Weekly' | 'Monthly'
  }
  budget?: number
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
    unsubscribed: number
  }
  settings: {
    trackOpens: boolean
    trackClicks: boolean
    allowUnsubscribe: boolean
    personalizeContent: boolean
    autoResponder: boolean
  }
}

interface CampaignFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign?: Campaign
  onSuccess: () => void
}

export function CampaignFormDialog({ 
  open, 
  onOpenChange, 
  campaign, 
  onSuccess 
}: CampaignFormDialogProps) {
  const { user, company } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [segmentInput, setSegmentInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Email' as Campaign['type'],
    status: 'Draft' as Campaign['status'],
    objective: 'Lead Generation' as Campaign['objective'],
    targetAudience: {
      segments: [] as string[],
      customerTags: [] as string[],
      demographics: {
        ageRange: '',
        location: [] as string[],
        purchaseHistory: '',
        lastActivity: ''
      },
      customFilters: [] as string[],
      estimatedReach: 0
    },
    content: {
      subject: '',
      message: '',
      callToAction: '',
      attachments: [] as string[],
      template: ''
    },
    schedule: {
      sendTime: '09:00',
      timezone: 'UTC',
      frequency: 'Once' as Campaign['schedule']['frequency']
    },
    budget: 0,
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      unsubscribed: 0
    },
    settings: {
      trackOpens: true,
      trackClicks: true,
      allowUnsubscribe: true,
      personalizeContent: false,
      autoResponder: false
    }
  })

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description,
        type: campaign.type,
        status: campaign.status,
        objective: campaign.objective,
        targetAudience: campaign.targetAudience,
        content: campaign.content,
        schedule: {
          sendTime: campaign.schedule.sendTime || '09:00',
          timezone: campaign.schedule.timezone,
          frequency: campaign.schedule.frequency || 'Once'
        },
        budget: campaign.budget || 0,
        metrics: campaign.metrics,
        settings: campaign.settings
      })
      setStartDate(new Date(campaign.schedule.startDate))
      if (campaign.schedule.endDate) {
        setEndDate(new Date(campaign.schedule.endDate))
      }
    } else {
      // Reset form for new campaign
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      setFormData({
        name: '',
        description: '',
        type: 'Email',
        status: 'Draft',
        objective: 'Lead Generation',
        targetAudience: {
          segments: [],
          customerTags: [],
          demographics: {
            ageRange: '',
            location: [],
            purchaseHistory: '',
            lastActivity: ''
          },
          customFilters: [],
          estimatedReach: 0
        },
        content: {
          subject: '',
          message: '',
          callToAction: '',
          attachments: [],
          template: ''
        },
        schedule: {
          sendTime: '09:00',
          timezone: 'UTC',
          frequency: 'Once'
        },
        budget: 0,
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          unsubscribed: 0
        },
        settings: {
          trackOpens: true,
          trackClicks: true,
          allowUnsubscribe: true,
          personalizeContent: false,
          autoResponder: false
        }
      })
      setStartDate(tomorrow)
      setEndDate(undefined)
    }
  }, [campaign, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !company || !startDate) return

    setLoading(true)
    try {
      const campaignData = {
        ...formData,
        schedule: {
          ...formData.schedule,
          startDate: startDate.toISOString(),
          endDate: endDate?.toISOString()
        },
        companyId: company.id,
        createdBy: user.id
      }

      if (campaign?.id) {
        await api.crm.marketingCampaigns.update(campaign.id, campaignData)
        toast({
          title: "Success",
          description: "Campaign updated successfully"
        })
      } else {
        await api.crm.marketingCampaigns.create(campaignData)
        toast({
          title: "Success", 
          description: "Campaign created successfully"
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving campaign:', error)
      toast({
        title: "Error",
        description: "Failed to save campaign",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addSegment = () => {
    if (segmentInput.trim() && !formData.targetAudience.segments.includes(segmentInput.trim())) {
      setFormData(prev => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          segments: [...prev.targetAudience.segments, segmentInput.trim()]
        }
      }))
      setSegmentInput('')
    }
  }

  const removeSegment = (segment: string) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        segments: prev.targetAudience.segments.filter(s => s !== segment)
      }
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.targetAudience.customerTags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          customerTags: [...prev.targetAudience.customerTags, tagInput.trim()]
        }
      }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        customerTags: prev.targetAudience.customerTags.filter(t => t !== tag)
      }
    }))
  }

  const addLocation = () => {
    if (locationInput.trim() && !formData.targetAudience.demographics.location?.includes(locationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        targetAudience: {
          ...prev.targetAudience,
          demographics: {
            ...prev.targetAudience.demographics,
            location: [...(prev.targetAudience.demographics.location || []), locationInput.trim()]
          }
        }
      }))
      setLocationInput('')
    }
  }

  const removeLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        demographics: {
          ...prev.targetAudience.demographics,
          location: prev.targetAudience.demographics.location?.filter(l => l !== location) || []
        }
      }
    }))
  }

  const campaignTypes = [
    { value: 'Email', label: 'Email Campaign', icon: Mail },
    { value: 'SMS', label: 'SMS Campaign', icon: MessageSquare },
    { value: 'Push Notification', label: 'Push Notifications', icon: Send },
    { value: 'Social Media', label: 'Social Media', icon: Target },
    { value: 'Multi-Channel', label: 'Multi-Channel', icon: BarChart3 }
  ]

  const objectives = [
    { value: 'Lead Generation', label: 'Lead Generation' },
    { value: 'Customer Retention', label: 'Customer Retention' },
    { value: 'Product Launch', label: 'Product Launch' },
    { value: 'Promotion', label: 'Promotion' },
    { value: 'Event', label: 'Event Marketing' },
    { value: 'Survey', label: 'Survey/Feedback' },
    { value: 'Other', label: 'Other' }
  ]

  const statusOptions = [
    { value: 'Draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'Scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'Active', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'Paused', label: 'Paused', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Completed', label: 'Completed', color: 'bg-purple-100 text-purple-800' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ]

  const ageRanges = [
    { value: '18-24', label: '18-24 years' },
    { value: '25-34', label: '25-34 years' },
    { value: '35-44', label: '35-44 years' },
    { value: '45-54', label: '45-54 years' },
    { value: '55-64', label: '55-64 years' },
    { value: '65+', label: '65+ years' }
  ]

  const frequencyOptions = [
    { value: 'Once', label: 'Send Once' },
    { value: 'Daily', label: 'Daily' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Monthly', label: 'Monthly' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaign ? 'Edit Campaign' : 'Create New Campaign'}
          </DialogTitle>
          <DialogDescription>
            Create and manage marketing campaigns with targeted customer segments
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="targeting">Targeting</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Summer Product Launch 2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Campaign['status'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          <Badge className={status.color}>{status.label}</Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the campaign goals and strategy"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Campaign['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map(type => {
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
                  <Label htmlFor="objective">Objective</Label>
                  <Select
                    value={formData.objective}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, objective: value as Campaign['objective'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      {objectives.map(objective => (
                        <SelectItem key={objective.value} value={objective.value}>
                          {objective.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                    placeholder="0 for no budget limit"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="targeting" className="space-y-4">
              {/* Customer Segments */}
              <div className="space-y-2">
                <Label>Customer Segments</Label>
                <div className="flex gap-2">
                  <Input
                    value={segmentInput}
                    onChange={(e) => setSegmentInput(e.target.value)}
                    placeholder="e.g., VIP Customers, New Signups"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSegment()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addSegment}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.targetAudience.segments.map(segment => (
                    <Badge key={segment} variant="secondary" className="flex items-center gap-1">
                      {segment}
                      <button
                        type="button"
                        onClick={() => removeSegment(segment)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Customer Tags */}
              <div className="space-y-2">
                <Label>Customer Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="e.g., high-value, frequent-buyer"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.targetAudience.customerTags.map(tag => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Demographics */}
              <div className="space-y-4">
                <Label>Demographics</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ageRange">Age Range</Label>
                    <Select
                      value={formData.targetAudience.demographics.ageRange}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        targetAudience: {
                          ...prev.targetAudience,
                          demographics: {
                            ...prev.targetAudience.demographics,
                            ageRange: value
                          }
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageRanges.map(range => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchaseHistory">Purchase History</Label>
                    <Select
                      value={formData.targetAudience.demographics.purchaseHistory}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        targetAudience: {
                          ...prev.targetAudience,
                          demographics: {
                            ...prev.targetAudience.demographics,
                            purchaseHistory: value
                          }
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Purchase behavior" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first-time">First-time buyers</SelectItem>
                        <SelectItem value="repeat">Repeat customers</SelectItem>
                        <SelectItem value="high-value">High-value customers</SelectItem>
                        <SelectItem value="inactive">Inactive customers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Locations</Label>
                  <div className="flex gap-2">
                    <Input
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="e.g., New York, California"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addLocation()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addLocation}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.targetAudience.demographics.location?.map(location => (
                      <Badge key={location} variant="secondary" className="flex items-center gap-1">
                        {location}
                        <button
                          type="button"
                          onClick={() => removeLocation(location)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimated Reach */}
              <div className="space-y-2">
                <Label htmlFor="estimatedReach">Estimated Reach</Label>
                <Input
                  id="estimatedReach"
                  type="number"
                  min="0"
                  value={formData.targetAudience.estimatedReach}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    targetAudience: {
                      ...prev.targetAudience,
                      estimatedReach: parseInt(e.target.value) || 0
                    }
                  }))}
                  placeholder="Number of targeted customers"
                />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              {/* Content */}
              {(formData.type === 'Email' || formData.type === 'Multi-Channel') && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.content.subject}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      content: { ...prev.content, subject: e.target.value }
                    }))}
                    placeholder="Compelling subject line"
                    required={formData.type === 'Email'}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="message">Message Content *</Label>
                <Textarea
                  id="message"
                  value={formData.content.message}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, message: e.target.value }
                  }))}
                  placeholder="Write your campaign message..."
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="callToAction">Call to Action</Label>
                <Input
                  id="callToAction"
                  value={formData.content.callToAction}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, callToAction: e.target.value }
                  }))}
                  placeholder="e.g., Shop Now, Learn More, Sign Up"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Template (Optional)</Label>
                <Select
                  value={formData.content.template}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, template: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="promotion">Promotional</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="welcome">Welcome Series</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <Label>Campaign Settings</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trackOpens"
                      checked={formData.settings.trackOpens}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, trackOpens: !!checked }
                      }))}
                    />
                    <Label htmlFor="trackOpens">Track Opens</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trackClicks"
                      checked={formData.settings.trackClicks}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, trackClicks: !!checked }
                      }))}
                    />
                    <Label htmlFor="trackClicks">Track Clicks</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="personalizeContent"
                      checked={formData.settings.personalizeContent}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, personalizeContent: !!checked }
                      }))}
                    />
                    <Label htmlFor="personalizeContent">Personalize Content</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowUnsubscribe"
                      checked={formData.settings.allowUnsubscribe}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        settings: { ...prev.settings, allowUnsubscribe: !!checked }
                      }))}
                    />
                    <Label htmlFor="allowUnsubscribe">Allow Unsubscribe</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              {/* Schedule */}
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
                  <Label>End Date (Optional)</Label>
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
                        {endDate ? format(endDate, "PPP") : <span>No end date</span>}
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sendTime">Send Time</Label>
                  <Input
                    id="sendTime"
                    type="time"
                    value={formData.schedule.sendTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, sendTime: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.schedule.timezone}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, timezone: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="CST">Central Time</SelectItem>
                      <SelectItem value="MST">Mountain Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.schedule.frequency}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, frequency: value as Campaign['schedule']['frequency'] }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
                campaign ? 'Update Campaign' : 'Create Campaign'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
