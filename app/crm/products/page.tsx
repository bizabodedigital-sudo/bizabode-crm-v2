import { ProductsTable } from '@/components/crm/products-table'

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
        <p className="text-muted-foreground">
          Manage your product catalog with images, pricing, and inventory tracking
        </p>
      </div>
      
      <ProductsTable />
    </div>
  )
}
