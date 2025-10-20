import { ItemTable } from "@/components/inventory/item-table"
import { InventoryStats } from "@/components/inventory/inventory-stats"

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">Manage your inventory items and stock levels</p>
      </div>

      <InventoryStats />

      <ItemTable />
    </div>
  )
}
