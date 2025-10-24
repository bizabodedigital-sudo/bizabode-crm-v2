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
import { CalendarIcon, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-client-config"

interface Task {
  id?: string
  title: string
  description: string
  type: 'Follow-up' | 'Meeting' | 'Call' | 'Email' | 'Document' | 'Research' | 'Other'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled'
  dueDate: Date
  estimatedHours?: number
  assignedTo: string
  assignedToName?: string
  relatedTo: 'Lead' | 'Opportunity' | 'Customer' | 'Quote' | 'Order' | 'Invoice' | 'General'
  relatedId?: string
  relatedName?: string
  isRecurring: boolean
  recurringType?: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'
  recurringInterval?: number
  recurringEndDate?: Date
  reminderEnabled: boolean
  reminderMinutes?: number
  tags: string[]
  completedDate?: Date
  notes?: string
}

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  onSuccess: () => void
  prefilledData?: {
    relatedTo?: Task['relatedTo']
    relatedId?: string
    relatedName?: string
    type?: Task['type']
    assignedTo?: string
    assignedToName?: string
  }
}

export function TaskFormDialog({ 
  open, 
  onOpenChange, 
  task, 
  onSuccess,
  prefilledData 
}: TaskFormDialogProps) {
  const { user, company } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dueDate, setDueDate] = useState<Date>()
  const [recurringEndDate, setRecurringEndDate] = useState<Date>()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Follow-up' as Task['type'],
    priority: 'Medium' as Task['priority'],
    status: 'Pending' as Task['status'],
    estimatedHours: 1,
    assignedTo: '',
    assignedToName: '',
    relatedTo: 'General' as Task['relatedTo'],
    relatedId: '',
    relatedName: '',
    isRecurring: false,
    recurringType: 'Weekly' as Task['recurringType'],
    recurringInterval: 1,
    reminderEnabled: true,
    reminderMinutes: 60,
    tags: [] as string[],
    notes: ''
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
        status: task.status,
        estimatedHours: task.estimatedHours || 1,
        assignedTo: task.assignedTo,
        assignedToName: task.assignedToName || '',
        relatedTo: task.relatedTo,
        relatedId: task.relatedId || '',
        relatedName: task.relatedName || '',
        isRecurring: task.isRecurring,
        recurringType: task.recurringType || 'Weekly',
        recurringInterval: task.recurringInterval || 1,
        reminderEnabled: task.reminderEnabled,
        reminderMinutes: task.reminderMinutes || 60,
        tags: task.tags || [],
        notes: task.notes || ''
      })
      setDueDate(new Date(task.dueDate))
      if (task.recurringEndDate) {
        setRecurringEndDate(new Date(task.recurringEndDate))
      }
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        type: prefilledData?.type || 'Follow-up',
        priority: 'Medium',
        status: 'Pending',
        estimatedHours: 1,
        assignedTo: prefilledData?.assignedTo || user?.id || '',
        assignedToName: prefilledData?.assignedToName || user?.name || '',
        relatedTo: prefilledData?.relatedTo || 'General',
        relatedId: prefilledData?.relatedId || '',
        relatedName: prefilledData?.relatedName || '',
        isRecurring: false,
        recurringType: 'Weekly',
        recurringInterval: 1,
        reminderEnabled: true,
        reminderMinutes: 60,
        tags: [],
        notes: ''
      })
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setDueDate(tomorrow)
      setRecurringEndDate(undefined)
    }
  }, [task, prefilledData, open, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !company || !dueDate) return

    setLoading(true)
    try {
      const taskData = {
        ...formData,
        dueDate: dueDate.toISOString(),
        recurringEndDate: recurringEndDate?.toISOString(),
        companyId: company.id,
        createdBy: user.id
      }

      if (task?.id) {
        await api.crm.tasks.update(task.id, taskData)
        toast({
          title: "Success",
          description: "Task updated successfully"
        })
      } else {
        await api.crm.tasks.create(taskData)
        toast({
          title: "Success", 
          description: "Task created successfully"
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving task:', error)
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const taskTypes = [
    { value: 'Follow-up', label: 'Follow-up', icon: '📞' },
    { value: 'Meeting', label: 'Meeting', icon: '🤝' },
    { value: 'Call', label: 'Call', icon: '☎️' },
    { value: 'Email', label: 'Email', icon: '📧' },
    { value: 'Document', label: 'Document', icon: '📄' },
    { value: 'Research', label: 'Research', icon: '🔍' },
    { value: 'Other', label: 'Other', icon: '📋' }
  ]

  const priorityOptions = [
    { value: 'Low', label: 'Low', color: 'text-blue-600' },
    { value: 'Medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'High', label: 'High', color: 'text-orange-600' },
    { value: 'Urgent', label: 'Urgent', color: 'text-red-600' }
  ]

  const statusOptions = [
    { value: 'Pending', label: 'Pending', icon: '⏳' },
    { value: 'In Progress', label: 'In Progress', icon: '🔄' },
    { value: 'Completed', label: 'Completed', icon: '✅' },
    { value: 'Overdue', label: 'Overdue', icon: '⚠️' },
    { value: 'Cancelled', label: 'Cancelled', icon: '❌' }
  ]

  const relatedToOptions = [
    { value: 'General', label: 'General' },
    { value: 'Lead', label: 'Lead' },
    { value: 'Opportunity', label: 'Opportunity' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Quote', label: 'Quote' },
    { value: 'Order', label: 'Sales Order' },
    { value: 'Invoice', label: 'Invoice' }
  ]

  const recurringTypes = [
    { value: 'Daily', label: 'Daily' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Yearly', label: 'Yearly' }
  ]

  const reminderOptions = [
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 120, label: '2 hours before' },
    { value: 1440, label: '1 day before' },
    { value: 10080, label: '1 week before' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            Create and manage tasks with reminders and recurring options
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What needs to be done?"
              required
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Task Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Task['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map(type => (
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
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Task['priority'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <span className={priority.color}>{priority.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the task"
              rows={3}
            />
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                placeholder="1"
              />
            </div>
          </div>

          {/* Assignment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedToName}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedToName: e.target.value }))}
                placeholder="Assignee name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Task['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      <span className="flex items-center gap-2">
                        <span>{status.icon}</span>
                        {status.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Related To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relatedTo">Related To</Label>
              <Select
                value={formData.relatedTo}
                onValueChange={(value) => setFormData(prev => ({ ...prev, relatedTo: value as Task['relatedTo'] }))}
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

          {/* Recurring Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isRecurring: !!checked }))
                }
              />
              <Label htmlFor="isRecurring">Make this a recurring task</Label>
            </div>

            {formData.isRecurring && (
              <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Repeat Every</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={formData.recurringInterval}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        recurringInterval: parseInt(e.target.value) || 1 
                      }))}
                      className="w-20"
                    />
                    <Select
                      value={formData.recurringType}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        recurringType: value as Task['recurringType'] 
                      }))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {recurringTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>End Recurring On (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !recurringEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {recurringEndDate ? format(recurringEndDate, "PPP") : <span>No end date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={recurringEndDate}
                        onSelect={setRecurringEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* Reminders */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reminderEnabled"
                checked={formData.reminderEnabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, reminderEnabled: !!checked }))
                }
              />
              <Label htmlFor="reminderEnabled">Enable reminder</Label>
            </div>

            {formData.reminderEnabled && (
              <div className="space-y-2">
                <Label>Remind me</Label>
                <Select
                  value={formData.reminderMinutes?.toString()}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    reminderMinutes: parseInt(value) 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reminder time" />
                  </SelectTrigger>
                  <SelectContent>
                    {reminderOptions.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information about this task"
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
                task ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}