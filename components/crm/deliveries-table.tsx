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

  // Mock data for now - will be replaced with API
  const deliveries = [
    {
      id: "1",
      deliveryNumber: "DEL-2024-001",
      customerName: "John Smith",
      address: "123 Main St, Kingston",
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "scheduled" as const,
      driverName: "Mike Johnson",
      qrCode: "DEL-123ABC",
    },
    {
      id: "2",
      deliveryNumber: "DEL-2024-002",
      customerName: "Maria Garcia",
      address: "456 Oak Ave, Montego Bay",
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: "in-transit" as const,
      driverName: "Carlos Rodriguez",
      qrCode: "DEL-456DEF",
    },
    {
      id: "3",
      deliveryNumber: "DEL-2024-003",
      customerName: "David Chen",
      address: "789 Pine Rd, Ocho Rios",
      scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: "delivered" as const,
      driverName: "James Brown",
      qrCode: "DEL-789GHI",
    },
  ]

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
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No deliveries found
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
                      {delivery.status !== "delivered" && delivery.status !== "cancelled" && (
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

