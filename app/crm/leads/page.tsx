import { LeadsTable } from "@/components/crm/leads-table"
import { CRMStats } from "@/components/crm/crm-stats"

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">Manage and track your sales leads</p>
      </div>

      <CRMStats />

      <LeadsTable />
    </div>
  )
}
