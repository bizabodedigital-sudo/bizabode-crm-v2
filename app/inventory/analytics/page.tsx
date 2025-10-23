import { AnalyticsSection } from "@/components/inventory/analytics-section"

export default function InventoryAnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventory Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your inventory performance
        </p>
      </div>
      <AnalyticsSection />
    </div>
  )
}
