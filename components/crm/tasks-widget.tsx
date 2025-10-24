"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Calendar, Clock, AlertTriangle, CheckCircle, Plus } from 'lucide-react'
import { Task } from '@/lib/types'
import { TaskFormDialog } from './task-form-dialog'

interface TasksWidgetProps {
  companyId: string
  userId?: string
}

export function TasksWidget({ companyId, userId }: TasksWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    overdue: 0,
    pending: 0
  })

  useEffect(() => {
    fetchTasks()
  }, [companyId, userId])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        companyId,
        limit: '10'
      })
      
      if (userId) {
        params.append('assignedTo', userId)
      }

      const response = await fetch(`/api/crm/tasks?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setTasks(data.data)
        calculateStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (taskList: Task[]) => {
    const total = taskList.length
    const completed = taskList.filter(task => task.status === 'Completed').length
    const overdue = taskList.filter(task => task.status === 'Overdue').length
    const pending = taskList.filter(task => task.status === 'Pending').length

    setStats({ total, completed, overdue, pending })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'destructive'
      case 'High': return 'destructive'
      case 'Medium': return 'default'
      case 'Low': return 'secondary'
      default: return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Overdue': return 'bg-red-100 text-red-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = (dueDate: string | Date) => {
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tasks
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setIsTaskDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Task
          </Button>
        </div>
        <CardDescription>
          Manage your tasks and follow-ups
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Completion Rate</span>
            <span>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
          </div>
          <Progress 
            value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} 
            className="h-2"
          />
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No tasks found</p>
              <p className="text-sm">Create your first task to get started</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                      {task.priority}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(task.dueDate)}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{task.type}</span>
                    </div>
                    {isOverdue(task.dueDate) && task.status !== 'Completed' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        Overdue
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === 'Completed' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setEditingTask(task)}>
                    View
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View All Link */}
        {tasks.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="link" size="sm">
              View All Tasks
            </Button>
          </div>
        )}
      </CardContent>

      {/* Task Form Dialog */}
      <TaskFormDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        onSuccess={fetchTasks}
      />

      {/* Edit Task Dialog */}
      <TaskFormDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask}
        onSuccess={fetchTasks}
      />
    </Card>
  )
}
