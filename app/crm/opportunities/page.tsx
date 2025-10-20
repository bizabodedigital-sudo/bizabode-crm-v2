import { OpportunitiesBoard } from "@/components/crm/opportunities-board"
import { CRMStats } from "@/components/crm/crm-stats"

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
        <p className="text-muted-foreground">Track your sales opportunities and pipeline</p>
      </div>

      <CRMStats />

      <OpportunitiesBoard />
    </div>
  )
}
