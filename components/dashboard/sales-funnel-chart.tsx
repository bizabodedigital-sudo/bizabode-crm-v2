"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useCRMStore } from "@/lib/crm-store"
import { useQuotesInvoicesStore } from "@/lib/quotes-invoices-store"

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--chart-2))",
]

export function SalesFunnelChart() {
  const { leads, opportunities } = useCRMStore()
  const { quotes, invoices } = useQuotesInvoicesStore()

  // Calculate real funnel data
  const qualifiedLeads = leads.filter(l => l.status === "qualified").length
  const proposalOpps = opportunities.filter(o => o.stage === "proposal" || o.stage === "qualification").length
  const negotiationOpps = opportunities.filter(o => o.stage === "negotiation").length
  const closedWon = opportunities.filter(o => o.stage === "closed-won").length

  const data = [
    { stage: "Leads", count: leads.length },
    { stage: "Qualified", count: qualifiedLeads },
    { stage: "Proposal", count: proposalOpps },
    { stage: "Negotiation", count: negotiationOpps },
    { stage: "Closed Won", count: closedWon },
  ]

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Sales Funnel</CardTitle>
        <CardDescription>Current pipeline by stage</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
            <XAxis type="number" className="text-xs" />
            <YAxis dataKey="stage" type="category" width={100} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
