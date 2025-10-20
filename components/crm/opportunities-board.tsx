"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Edit, DollarSign, Calendar, Loader2 } from "lucide-react"
import type { Opportunity } from "@/lib/types"
import { useCRMStore } from "@/lib/crm-store"
import { OpportunityFormDialog } from "./opportunity-form-dialog"
import { format } from "date-fns"

const stages = [
  { id: "prospecting", label: "Prospecting", color: "bg-blue-500" },
  { id: "qualification", label: "Qualification", color: "bg-yellow-500" },
  { id: "proposal", label: "Proposal", color: "bg-purple-500" },
  { id: "negotiation", label: "Negotiation", color: "bg-orange-500" },
  { id: "closed-won", label: "Closed Won", color: "bg-green-500" },
  { id: "closed-lost", label: "Closed Lost", color: "bg-gray-500" },
]

export function OpportunitiesBoard() {
  const { opportunities, updateOpportunity, fetchOpportunities, isLoading } = useCRMStore()
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Fetch opportunities from API on mount
  useEffect(() => {
    fetchOpportunities()
  }, [])

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities.filter((opp) => opp.stage === stage)
  }

  const getTotalValue = (stage: string) => {
    return getOpportunitiesByStage(stage).reduce((sum, opp) => sum + opp.value, 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map((stage) => {
          const stageOpportunities = getOpportunitiesByStage(stage.id)
          const totalValue = getTotalValue(stage.id)

          return (
            <div key={stage.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <h3 className="font-semibold">{stage.label}</h3>
                  <Badge variant="secondary">{stageOpportunities.length}</Badge>
                </div>
                <span className="text-sm font-medium text-muted-foreground">${totalValue.toLocaleString()}</span>
              </div>

              <div className="space-y-2">
                {stageOpportunities.map((opp) => (
                  <Card key={(opp as any)._id || opp.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium line-clamp-2">{opp.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setEditingOpportunity(opp)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">${opp.value.toLocaleString()}</span>
                        <Badge variant="outline" className="ml-auto">
                          {opp.probability}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(opp.expectedCloseDate), 'MMM dd, yyyy')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{opp.customerName}</p>
                    </CardContent>
                  </Card>
                ))}

                {stageOpportunities.length === 0 && (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                    No opportunities
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <OpportunityFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => setIsAddDialogOpen(false)}
      />

      <OpportunityFormDialog
        open={!!editingOpportunity}
        onOpenChange={(open) => !open && setEditingOpportunity(null)}
        opportunity={editingOpportunity || undefined}
        onSuccess={() => setEditingOpportunity(null)}
      />
    </div>
  )
}
