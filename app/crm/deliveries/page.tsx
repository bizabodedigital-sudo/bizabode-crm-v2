import { DeliveriesTable } from "@/components/crm/deliveries-table"

export default function DeliveriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
        <p className="text-muted-foreground">Manage deliveries and QR confirmations</p>
      </div>

      <DeliveriesTable />
    </div>
  )
}
