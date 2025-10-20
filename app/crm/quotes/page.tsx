import { QuotesTable } from "@/components/quotes/quotes-table"

export default function QuotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
        <p className="text-muted-foreground">Create and manage sales quotes</p>
      </div>

      <QuotesTable />
    </div>
  )
}
