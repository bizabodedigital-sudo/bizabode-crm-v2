"use client"

import React, { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api-client-config'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  isRead: boolean
  readAt?: string
  createdAt: string
  data?: Record<string, any>
  relatedTaskId?: string
  relatedActivityId?: string
  relatedLeadId?: string
  relatedOpportunityId?: string
  relatedCustomerId?: string
  relatedOrderId?: string
  relatedInvoiceId?: string
  relatedQuoteId?: string
}

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className = "" }: NotificationCenterProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  useEffect(() => {
    if (user?.id && isOpen) {
      fetchNotifications()
    }
  }, [user?.id, isOpen, filter])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        limit: '50'
      })
      
      if (filter !== 'all') {
        params.append('unreadOnly', filter === 'unread' ? 'true' : 'false')
      }

      const response = await api.get(`/api/notifications?${params}`)
      
      if (response.success) {
        setNotifications(response.data)
        setUnreadCount(response.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await api.put(`/api/notifications/${notificationId}`, { isRead: true })
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
      if (unreadIds.length === 0) return

      await api.put('/api/notifications', {
        notificationIds: unreadIds,
        action: 'markAsRead'
      })

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      await api.put('/api/notifications', {
        notificationIds,
        action: 'delete'
      })

      setNotifications(prev => 
        prev.filter(notif => !notificationIds.includes(notif.id))
      )
      setUnreadCount(prev => 
        prev - notificationIds.filter(id => 
          notifications.find(n => n.id === id && !n.isRead)
        ).length
      )
    } catch (error) {
      console.error('Failed to delete notifications:', error)
    }
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_reminder':
      case 'task_created':
      case 'task_overdue':
        return '📋'
      case 'customer_reengagement':
      case 'customer_contact':
      case 'customer_high_risk':
        return '👥'
      case 'overdue_invoices':
        return '💰'
      case 'new_lead':
        return '🎯'
      case 'quote_converted':
        return '📄'
      case 'order_delivered':
        return '📦'
      default:
        return '🔔'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    // TODO: Navigate to related entity based on type
    // This would require routing logic based on the related entity IDs
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bell Icon */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {notifications.some(n => !n.isRead) && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="w-full"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All as Read
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                            }`}>
                              {notification.title}
                            </h4>
                            <Badge 
                              variant={getPriorityColor(notification.priority) as any}
                              className="text-xs"
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
