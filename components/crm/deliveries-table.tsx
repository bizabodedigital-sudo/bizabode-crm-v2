"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, QrCode, Check, X } from "lucide-react"
import { format } from "date-fns"

const statusColors = {
  scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "in-transit": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  delivered: "bg-green-500/10 text-green-700 dark:text-green-400",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400",
  cancelled: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
}

export function DeliveriesTable() {
  const [searchQuery, setSearchQuery] = useState("")

  // TODO: Replace with real deliveries data from API
  const deliveries = []

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.deliveryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search deliveries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Delivery
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Delivery #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <QrCode className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No deliveries found</p>
                    <p className="text-sm">Create your first delivery to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDeliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-mono font-medium">{delivery.deliveryNumber}</TableCell>
                  <TableCell>{delivery.customerName}</TableCell>
                  <TableCell>{delivery.address}</TableCell>
                  <TableCell>{format(new Date(delivery.scheduledDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{delivery.driverName || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[delivery.status]}>
                      {delivery.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {delivery.status === "scheduled" && (
                        <Button variant="ghost" size="icon" title="Start delivery">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {(delivery.status === "scheduled" || delivery.status === "in-transit") && (
                        <Button variant="ghost" size="icon" title="View QR Code">
                          <QrCode className="h-4 w-4" />
                        </Button>
                      )}
                      {delivery.status === "scheduled" && (
                        <Button variant="ghost" size="icon" title="Cancel delivery">
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

