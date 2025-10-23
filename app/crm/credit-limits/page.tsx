import { CreditLimitsTable } from '@/components/crm/credit-limits-table'

export default function CreditLimitsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Credit Limits</h1>
        <p className="text-muted-foreground">
          Manage customer credit limits, payment terms, and risk assessment
        </p>
      </div>
      
      <CreditLimitsTable />
    </div>
  )
}
