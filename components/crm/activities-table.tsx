"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Eye, Phone, Mail, MessageSquare, Calendar, MapPin } from "lucide-react"
import type { Activity } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { api, endpoints } from "@/lib/api-client-config"
import { formatDate } from "@/lib/utils/formatters"
import { getTypeColor, getStatusColor, getOutcomeColor } from "@/lib/utils/status-colors"
import SearchInput from "@/components/shared/SearchInput"
import Loading from "@/components/shared/Loading"
import { ActivityFormDialog } from "./activity-form-dialog"
import { QuickActivityLogger } from "./quick-activity-logger"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const getTypeIcon = (type: Activity["type"]) => {
  switch (type) {
    case "Call":
      return <Phone className="h-4 w-4" />
    case "Email":
      return <Mail className="h-4 w-4" />
    case "WhatsApp":
      return <MessageSquare className="h-4 w-4" />
    case "Visit":
    case "Meeting":
      return <Calendar className="h-4 w-4" />
    default:
      return <Eye className="h-4 w-4" />
  }
}

export function ActivitiesTable() {
  const { company } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isQuickLoggerOpen, setIsQuickLoggerOpen] = useState(false)
  const { toast } = useToast()

  // Fetch activities from API
  useEffect(() => {
    if (company?.id) {
      fetchActivities()
    }
  }, [company?.id])

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(endpoints.crm.activities, {
        companyId: company?.id || '',
        limit: 100
      })
      
      if (response.success) {
        setActivities(response.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch activities",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (deletingActivity) {
      try {
        const response = await api.delete(`${endpoints.crm.activities}/${deletingActivity.id}`)
        
        if (response.success) {
          setActivities(activities.filter(activity => activity.id !== deletingActivity.id))
          toast({
            title: "Success",
            description: "Activity deleted successfully",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to delete activity",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Failed to delete activity:', error)
        toast({
          title: "Error",
          description: "Failed to delete activity",
          variant: "destructive",
        })
      }
      setDeletingActivity(null)
    }
  }

  const filteredActivities = activities.filter(
    (activity) =>
      activity.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.leadId && activity.leadId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (activity.customerId && activity.customerId.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          placeholder="Search activities by subject, description, or related entity..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <div className="flex gap-2">
          <Button onClick={() => setIsQuickLoggerOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Quick Log
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Activity
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Related To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No activities found
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(activity.type)}
                        <Badge variant="outline" className={getTypeColor(activity.type)}>
                          {activity.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{activity.subject}</TableCell>
                    <TableCell className="max-w-xs truncate">{activity.description}</TableCell>
                    <TableCell>
                      {activity.leadId && <Badge variant="secondary">Lead</Badge>}
                      {activity.opportunityId && <Badge variant="secondary">Opportunity</Badge>}
                      {activity.customerId && <Badge variant="secondary">Customer</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {activity.outcome && (
                        <Badge variant="outline" className={getOutcomeColor(activity.outcome)}>
                          {activity.outcome}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {activity.scheduledDate ? formatDate(activity.scheduledDate) : 
                       activity.completedDate ? formatDate(activity.completedDate) :
                       formatDate(activity.createdAt)}
                    </TableCell>
                    <TableCell>
                      {activity.duration ? `${activity.duration} min` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingActivity(activity)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingActivity(activity)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingActivity(activity)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deletingActivity} onOpenChange={(open) => !open && setDeletingActivity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete activity "{deletingActivity?.subject}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activity Form Dialog */}
      <ActivityFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchActivities}
      />

      {/* Quick Activity Logger */}
      <QuickActivityLogger
        open={isQuickLoggerOpen}
        onOpenChange={setIsQuickLoggerOpen}
        onSuccess={fetchActivities}
      />

      {/* Edit Activity Dialog */}
      <ActivityFormDialog
        open={!!editingActivity}
        onOpenChange={(open) => !open && setEditingActivity(null)}
        activity={editingActivity}
        onSuccess={fetchActivities}
      />
    </div>
  )
}
