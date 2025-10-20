import { PaymentsTable } from "@/components/crm/payments-table"

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">Track payments and transactions</p>
      </div>

      <PaymentsTable />
    </div>
  )
}
