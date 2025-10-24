import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// TODO: Replace with real activities data from API
const activities = []

const typeColors: Record<string, string> = {
  quote: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  opportunity: "bg-green-500/10 text-green-700 dark:text-green-400",
  payment: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  inventory: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  delivery: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
}

export function ActivityFeed() {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Recent Activity</CardTitle>
        <CardDescription>Latest updates from your team</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
              >
                <Avatar className="h-9 w-9 border-2 border-primary/10">
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {activity.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1.5">
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium text-foreground">{activity.target}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={typeColors[activity.type]}>
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
