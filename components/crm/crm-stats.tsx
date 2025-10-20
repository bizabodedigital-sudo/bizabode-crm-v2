"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, TrendingUp, DollarSign } from "lucide-react"
import { useCRMStore } from "@/lib/crm-store"

export function CRMStats() {
  const { leads, opportunities } = useCRMStore()

  const totalLeads = leads.length
  const qualifiedLeads = leads.filter((lead) => lead.status === "qualified").length
  const activeOpportunities = opportunities.filter((opp) => !opp.stage.includes("closed")).length
  const pipelineValue = opportunities
    .filter((opp) => !opp.stage.includes("closed"))
    .reduce((sum, opp) => sum + opp.value, 0)

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads,
      icon: Users,
      description: `${qualifiedLeads} qualified`,
    },
    {
      title: "Active Opportunities",
      value: activeOpportunities,
      icon: Target,
      description: "In pipeline",
    },
    {
      title: "Pipeline Value",
      value: `$${pipelineValue.toLocaleString()}`,
      icon: DollarSign,
      description: "Total potential",
    },
    {
      title: "Conversion Rate",
      value: totalLeads > 0 ? `${Math.round((activeOpportunities / totalLeads) * 100)}%` : "0%",
      icon: TrendingUp,
      description: "Lead to opportunity",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
