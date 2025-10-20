"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { NotificationBell } from "@/components/ui/notification-bell"
import { Calendar, Clock, Building2, Key } from "lucide-react"
import { format } from "date-fns"

export function DashboardHeader() {
  const { user, company } = useAuth()
  const currentTime = new Date()
  const greeting = currentTime.getHours() < 12 ? "Good morning" : 
                   currentTime.getHours() < 18 ? "Good afternoon" : "Good evening"

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-primary">
                {greeting}, {user?.name || "User"}!
              </h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Building2 className="h-3 w-3 mr-1" />
                {company?.name || "Company"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(currentTime, "EEEE, MMMM do, yyyy")}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(currentTime, "h:mm a")}
              </div>
              <div className="flex items-center gap-1">
                <Key className="h-4 w-4" />
                License: {company?.licensePlan || "Standard"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last updated</p>
              <p className="text-sm font-medium">{format(currentTime, "h:mm a")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
