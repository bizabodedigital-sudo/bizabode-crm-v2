"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { format } from "date-fns"

const paymentMethodColors = {
  cash: "bg-green-500/10 text-green-700 dark:text-green-400",
  card: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "bank-transfer": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  check: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  other: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
}

export function PaymentsTable() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data - will be replaced with API
  const payments = [
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      customerName: "John Smith",
      amount: 6598.90,
      method: "bank-transfer" as const,
      reference: "TXN-12345",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      customerName: "Maria Garcia",
      amount: 3500.00,
      method: "card" as const,
      reference: "CARD-67890",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      invoiceNumber: "INV-2024-003",
      customerName: "David Chen",
      amount: 12000.00,
      method: "cash" as const,
      reference: "CASH-001",
      createdAt: new Date(),
    },
  ]

  const filteredPayments = payments.filter(
    (payment) =>
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Payments</p>
          <p className="text-2xl font-bold">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono font-medium">{payment.invoiceNumber}</TableCell>
                  <TableCell>{payment.customerName}</TableCell>
                  <TableCell className="text-right font-mono font-semibold text-green-600 dark:text-green-400">
                    ${payment.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={paymentMethodColors[payment.method]}>
                      {payment.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                  <TableCell>{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

