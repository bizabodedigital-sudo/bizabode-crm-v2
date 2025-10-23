import { PromotionsTable } from '@/components/crm/promotions-table'

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
        <p className="text-muted-foreground">
          Manage promotions, discounts, and pricing strategies
        </p>
      </div>
      
      <PromotionsTable />
    </div>
  )
}
