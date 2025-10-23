import { SalesOrdersTable } from "@/components/crm/sales-orders-table"
import { CRMStats } from "@/components/crm/crm-stats"

export default function SalesOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
        <p className="text-muted-foreground">Manage and track your sales orders</p>
      </div>

      <CRMStats />

      <SalesOrdersTable />
    </div>
  )
}
