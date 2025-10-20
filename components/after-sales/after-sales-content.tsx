"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MessageSquare, Star, ThumbsUp, AlertCircle, CheckCircle, Search, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const feedbackData = [
  {
    id: "fb-1",
    customer: "John Smith",
    email: "john@techcorp.com",
    rating: 5,
    comment: "Excellent service and fast delivery. Very satisfied with the products.",
    date: "2024-10-15",
    status: "resolved",
    invoiceNumber: "INV-2024-001",
  },
  {
    id: "fb-2",
    customer: "Sarah Johnson",
    email: "sarah@startupco.com",
    rating: 4,
    comment: "Good quality products, but delivery took longer than expected.",
    date: "2024-10-14",
    status: "pending",
    invoiceNumber: "INV-2024-002",
  },
  {
    id: "fb-3",
    customer: "Mike Wilson",
    email: "mike@enterprise.com",
    rating: 3,
    comment: "Product quality is okay, but customer support needs improvement.",
    date: "2024-10-13",
    status: "in-progress",
    invoiceNumber: "INV-2024-003",
  },
]

const supportTickets = [
  {
    id: "ticket-1",
    customer: "Alice Brown",
    email: "alice@company.com",
    subject: "Product defect - Wireless Mouse",
    priority: "high",
    status: "open",
    createdAt: "2024-10-16",
    lastUpdate: "2024-10-16",
  },
  {
    id: "ticket-2",
    customer: "Bob Davis",
    email: "bob@business.com",
    subject: "Request for product replacement",
    priority: "medium",
    status: "in-progress",
    createdAt: "2024-10-15",
    lastUpdate: "2024-10-16",
  },
  {
    id: "ticket-3",
    customer: "Carol White",
    email: "carol@corp.com",
    subject: "Question about warranty",
    priority: "low",
    status: "resolved",
    createdAt: "2024-10-14",
    lastUpdate: "2024-10-15",
  },
]

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  "in-progress": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  resolved: "bg-green-500/10 text-green-700 dark:text-green-400",
  open: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const priorityColors = {
  low: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  high: "bg-red-500/10 text-red-700 dark:text-red-400",
}

export function AfterSalesContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)

  const avgRating = (feedbackData.reduce((sum, fb) => sum + fb.rating, 0) / feedbackData.length).toFixed(1)
  const satisfactionRate = ((feedbackData.filter((fb) => fb.rating >= 4).length / feedbackData.length) * 100).toFixed(0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">After-Sales Support</h1>
          <p className="text-muted-foreground">Manage customer feedback and support tickets</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating}/5.0</div>
            <p className="text-xs text-muted-foreground">From {feedbackData.length} reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satisfactionRate}%</div>
            <p className="text-xs text-muted-foreground">4+ star ratings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportTickets.filter((t) => t.status === "open").length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Tickets closed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feedback" className="space-y-6">
        <TabsList>
          <TabsTrigger value="feedback">Customer Feedback</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Feedback</CardTitle>
              <CardDescription>Reviews and ratings from customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackData.map((feedback) => (
                  <div key={feedback.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{feedback.customer}</p>
                        <p className="text-sm text-muted-foreground">{feedback.email}</p>
                      </div>
                      <Badge variant="secondary" className={statusColors[feedback.status]}>
                        {feedback.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < feedback.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">{feedback.rating}/5</span>
                    </div>
                    <p className="text-sm">{feedback.comment}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Invoice: {feedback.invoiceNumber}</span>
                      <span>{new Date(feedback.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>Create a new customer support ticket</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input id="customer-name" placeholder="Enter customer name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customer-email">Customer Email</Label>
                    <Input id="customer-email" type="email" placeholder="customer@example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Brief description of the issue" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Detailed description of the issue" rows={4} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTicketDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsTicketDialogOpen(false)}>Create Ticket</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono font-medium">{ticket.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.customer}</p>
                          <p className="text-sm text-muted-foreground">{ticket.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={priorityColors[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColors[ticket.status]}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(ticket.lastUpdate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
