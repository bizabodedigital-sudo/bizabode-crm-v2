import { ActivitiesTable } from "@/components/crm/activities-table"
import { CRMStats } from "@/components/crm/crm-stats"

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
        <p className="text-muted-foreground">Track all customer interactions and activities</p>
      </div>

      <CRMStats />

      <ActivitiesTable />
    </div>
  )
}
