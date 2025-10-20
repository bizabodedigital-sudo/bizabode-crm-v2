import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  description?: string
}

export function KpiCard({ title, value, change, icon: Icon, description }: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <Card className="relative overflow-hidden transition-all hover:shadow-lg border-l-4 border-l-primary/20 hover:border-l-primary">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-2">
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                isPositive
                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
              )}
            >
              {isPositive ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
              <span>{Math.abs(change)}%</span>
            </div>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
      </CardContent>
    </Card>
  )
}
