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
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"

interface Activity {
  id?: string
  type: 'Call' | 'Visit' | 'Meeting' | 'Email' | 'WhatsApp' | 'Task' | 'Note'
  subject: string
  description: string
  duration?: number
  scheduledDate: Date
  completedDate?: Date
  outcome?: string
  followUpRequired: boolean
  followUpDate?: Date
  relatedTo: 'Lead' | 'Opportunity' | 'Customer' | 'Quote' | 'Order' | 'Invoice'
  relatedId: string
  relatedName?: string
  assignedTo: string
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
}

interface ActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity?: Activity
  onSuccess: () => void
  prefilledData?: {
    relatedTo?: Activity['relatedTo']
    relatedId?: string
    relatedName?: string
    type?: Activity['type']
  }
}

export function ActivityFormDialog({ 
  open, 
  onOpenChange, 
  activity, 
  onSuccess,
  prefilledData 
}: ActivityFormDialogProps) {
  const { user, company } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [followUpDate, setFollowUpDate] = useState<Date>()
  const [formData, setFormData] = useState({
    type: 'Call' as Activity['type'],
    subject: '',
    description: '',
    duration: 30,
    outcome: '',
    followUpRequired: false,
    relatedTo: 'Lead' as Activity['relatedTo'],
    relatedId: '',
    relatedName: '',
    status: 'Scheduled' as Activity['status'],
    priority: 'Medium' as Activity['priority']
  })

  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type,
        subject: activity.subject,
        description: activity.description,
        duration: activity.duration || 30,
        outcome: activity.outcome || '',
        followUpRequired: activity.followUpRequired,
        relatedTo: activity.relatedTo,
        relatedId: activity.relatedId,
        relatedName: activity.relatedName || '',
        status: activity.status,
        priority: activity.priority
      })
      setScheduledDate(new Date(activity.scheduledDate))
      if (activity.followUpDate) {
        setFollowUpDate(new Date(activity.followUpDate))
      }
    } else {
      // Reset form for new activity
      setFormData({
        type: prefilledData?.type || 'Call',
        subject: '',
        description: '',
        duration: 30,
        outcome: '',
        followUpRequired: false,
        relatedTo: prefilledData?.relatedTo || 'Lead',
        relatedId: prefilledData?.relatedId || '',
        relatedName: prefilledData?.relatedName || '',
        status: 'Scheduled',
        priority: 'Medium'
      })
      setScheduledDate(new Date())
      setFollowUpDate(undefined)
    }
  }, [activity, prefilledData, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !company || !scheduledDate) return

    setLoading(true)
    try {
      const activityData = {
        ...formData,
        scheduledDate: scheduledDate.toISOString(),
        followUpDate: followUpDate?.toISOString(),
        assignedTo: user.id,
        companyId: company.id,
        createdBy: user.id
      }

      if (activity?.id) {
        await api.crm.activities.update(activity.id, activityData)
        toast({
          title: "Success",
          description: "Activity updated successfully"
        })
      } else {
        await api.crm.activities.create(activityData)
        toast({
          title: "Success", 
          description: "Activity created successfully"
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving activity:', error)
      toast({
        title: "Error",
        description: "Failed to save activity",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const activityTypes = [
    { value: 'Call', label: 'Phone Call', icon: '📞' },
    { value: 'Visit', label: 'Site Visit', icon: '🏢' },
    { value: 'Meeting', label: 'Meeting', icon: '🤝' },
    { value: 'Email', label: 'Email', icon: '📧' },
    { value: 'WhatsApp', label: 'WhatsApp', icon: '💬' },
    { value: 'Task', label: 'Task', icon: '✅' },
    { value: 'Note', label: 'Note', icon: '📝' }
  ]

  const relatedToOptions = [
    { value: 'Lead', label: 'Lead' },
    { value: 'Opportunity', label: 'Opportunity' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Quote', label: 'Quote' },
    { value: 'Order', label: 'Sales Order' },
    { value: 'Invoice', label: 'Invoice' }
  ]

  const statusOptions = [
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ]

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activity ? 'Edit Activity' : 'Log New Activity'}
          </DialogTitle>
          <DialogDescription>
            Record customer interactions and schedule follow-ups
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Activity Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Activity['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Activity['priority'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of the activity"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed notes about the activity"
              rows={4}
            />
          </div>

          {/* Related To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relatedTo">Related To</Label>
              <Select
                value={formData.relatedTo}
                onValueChange={(value) => setFormData(prev => ({ ...prev, relatedTo: value as Activity['relatedTo'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select relation" />
                </SelectTrigger>
                <SelectContent>
                  {relatedToOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relatedName">Related Record</Label>
              <Input
                id="relatedName"
                value={formData.relatedName}
                onChange={(e) => setFormData(prev => ({ ...prev, relatedName: e.target.value }))}
                placeholder="Name or identifier"
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scheduled Date & Time *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduledDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP p") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                placeholder="30"
                min="0"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Activity['status'] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Outcome (for completed activities) */}
          {formData.status === 'Completed' && (
            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Textarea
                id="outcome"
                value={formData.outcome}
                onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                placeholder="What was accomplished or decided?"
                rows={3}
              />
            </div>
          )}

          {/* Follow-up */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpRequired"
                checked={formData.followUpRequired}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, followUpRequired: !!checked }))
                }
              />
              <Label htmlFor="followUpRequired">Schedule follow-up</Label>
            </div>

            {formData.followUpRequired && (
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !followUpDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {followUpDate ? format(followUpDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={followUpDate}
                      onSelect={setFollowUpDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
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
                activity ? 'Update Activity' : 'Create Activity'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}