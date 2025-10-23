import { ApprovalsTable } from '@/components/crm/approvals-table'

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approval Workflows</h1>
        <p className="text-muted-foreground">
          Manage approval workflows for quotes, discounts, credits, and other requests
        </p>
      </div>
      
      <ApprovalsTable />
    </div>
  )
}
