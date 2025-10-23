import { DocumentsTable } from '@/components/crm/documents-table'

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Manage document attachments, proofs of delivery, and file storage
        </p>
      </div>
      
      <DocumentsTable />
    </div>
  )
}
