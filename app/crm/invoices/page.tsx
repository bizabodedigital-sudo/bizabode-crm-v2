import { InvoicesTable } from "@/components/invoices/invoices-table"

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">Manage invoices and billing</p>
      </div>

      <InvoicesTable />
    </div>
  )
}
