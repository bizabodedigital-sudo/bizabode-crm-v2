"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, Trash2, Plus, Search, ArrowRight, Loader2 } from "lucide-react"
import type { Lead } from "@/lib/types"
import { useCRMStore } from "@/lib/crm-store"
import { LeadFormDialog } from "./lead-form-dialog"
import { ConvertLeadDialog } from "./convert-lead-dialog"
import StatusBadge from "@/components/shared/StatusBadge"
import SearchInput from "@/components/shared/SearchInput"
import Loading from "@/components/shared/Loading"
import EmptyState from "@/components/shared/EmptyState"
import { formatDate, formatCurrency } from "@/lib/utils/formatters"
import { filterBySearch } from "@/lib/utils/filters"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function LeadsTable() {
  const { leads, deleteLead, fetchLeads, isLoading } = useCRMStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null)
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Fetch leads from API on mount
  useEffect(() => {
    fetchLeads()
  }, [])

  const filteredLeads = filterBySearch(leads, searchQuery, ['name', 'email', 'company'])

  const handleDelete = () => {
    if (deletingLead) {
      deleteLead((deletingLead as any)._id || deletingLead.id)
      setDeletingLead(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          placeholder="Search leads by name, email, or company..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {isLoading ? (
        <Loading text="Loading leads..." />
      ) : filteredLeads.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="Get started by adding your first lead"
          action={{
            label: "Add Lead",
            onClick: () => setIsAddDialogOpen(true)
          }}
        />
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={(lead as any)._id || lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>
                    {lead.category && (
                      <StatusBadge value={lead.category} type="category" />
                    )}
                  </TableCell>
                  <TableCell>{lead.territory || '-'}</TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell>
                    <StatusBadge value={lead.status} type="status" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {lead.status === "qualified" && (
                        <Button variant="ghost" size="icon" onClick={() => setConvertingLead(lead)}>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => setEditingLead(lead)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingLead(lead)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <LeadFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => setIsAddDialogOpen(false)}
      />

      <LeadFormDialog
        open={!!editingLead}
        onOpenChange={(open) => !open && setEditingLead(null)}
        lead={editingLead || undefined}
        onSuccess={() => setEditingLead(null)}
      />

      <ConvertLeadDialog
        open={!!convertingLead}
        onOpenChange={(open) => !open && setConvertingLead(null)}
        lead={convertingLead || undefined}
        onSuccess={() => setConvertingLead(null)}
      />

      <AlertDialog open={!!deletingLead} onOpenChange={(open) => !open && setDeletingLead(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingLead?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
