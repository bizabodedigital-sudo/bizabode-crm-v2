// Core type definitions for the Bizabode CRM system

export type UserRole = "admin" | "manager" | "sales" | "warehouse" | "viewer"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  companyId: string
  createdAt: Date
  updatedAt: Date
}

export interface Company {
  id: string
  name: string
  licenseKey: string
  licensePlan: "trial" | "basic" | "professional" | "enterprise"
  licenseExpiry: Date
  createdAt: Date
  updatedAt: Date
}

export interface AuthState {
  user: User | null
  company: Company | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface Item {
  id: string
  companyId: string
  sku: string
  name: string
  description: string
  category: string
  quantity: number
  reorderLevel: number
  unitPrice: number
  imageUrl?: string
  critical: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Lead {
  id: string
  companyId: string
  name: string
  email: string
  phone: string
  company: string
  source: string
  status: "new" | "contacted" | "qualified" | "unqualified"
  notes: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

export interface Opportunity {
  id: string
  companyId: string
  leadId?: string
  title: string
  customerName: string
  customerEmail: string
  value: number
  stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
  probability: number
  expectedCloseDate: Date
  assignedTo?: string
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface Quote {
  id: string
  companyId: string
  opportunityId?: string
  quoteNumber: string
  customerName: string
  customerEmail: string
  items: QuoteItem[]
  subtotal: number
  tax: number
  total: number
  validUntil: Date
  status: "draft" | "sent" | "accepted" | "rejected" | "expired"
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface QuoteItem {
  itemId: string
  name: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  companyId: string
  quoteId?: string
  invoiceNumber: string
  customerName: string
  customerEmail: string
  items: QuoteItem[]
  subtotal: number
  tax: number
  total: number
  dueDate: Date
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  paidAmount: number
  paidDate?: Date
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  companyId: string
  invoiceId: string
  amount: number
  method: "cash" | "card" | "bank-transfer" | "check" | "other"
  reference: string
  notes: string
  createdAt: Date
}

export interface Delivery {
  id: string
  companyId: string
  invoiceId: string
  deliveryNumber: string
  customerName: string
  address: string
  scheduledDate: Date
  status: "scheduled" | "in-transit" | "delivered" | "failed"
  driverName?: string
  qrCode: string
  confirmedAt?: Date
  confirmedBy?: string
  notes: string
  createdAt: Date
  updatedAt: Date
}
