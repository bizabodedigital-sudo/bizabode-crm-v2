import { CustomersTable } from "@/components/crm/customers-table"
import { CRMStats } from "@/components/crm/crm-stats"

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Manage your customer accounts and relationships</p>
      </div>

      <CRMStats />

      <CustomersTable />
    </div>
  )
}
