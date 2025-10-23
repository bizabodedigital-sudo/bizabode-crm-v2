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
  // Enhanced fields for Icon Trading workflow
  category?: "Hotel" | "Supermarket" | "Restaurant" | "Contractor" | "Other"
  productInterest?: string[]
  monthlyVolume?: number
  territory?: string
  leadScore?: number
  customerType?: "Volume Buyer" | "Commercial" | "Retail" | "Wholesale" | "Other"
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

// Enhanced CRM interfaces for Icon Trading workflow

export interface Activity {
  id: string
  companyId: string
  leadId?: string
  opportunityId?: string
  customerId?: string
  type: "Call" | "Visit" | "Meeting" | "Email" | "WhatsApp" | "Task" | "Note"
  subject: string
  description: string
  duration?: number
  outcome?: "Positive" | "Neutral" | "Negative" | "No Response" | "Follow-up Required"
  scheduledDate?: Date
  completedDate?: Date
  assignedTo: string
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled"
  priority?: "Low" | "Medium" | "High" | "Urgent"
  location?: string
  attachments?: string[]
  relatedQuoteId?: string
  relatedOrderId?: string
  relatedInvoiceId?: string
  nextFollowUpDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SalesOrder {
  id: string
  companyId: string
  orderNumber: string
  quoteId?: string
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  items: SalesOrderItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  total: number
  orderDate: Date
  deliveryDate?: Date
  deliveryAddress?: string
  paymentTerms: "COD" | "Net 15" | "Net 30" | "Net 60" | "Prepaid" | "Credit"
  status: "Pending" | "Processing" | "Dispatched" | "Delivered" | "Cancelled"
  notes?: string
  createdBy: string
  assignedTo?: string
  driverName?: string
  driverPhone?: string
  trackingNumber?: string
  deliveryNotes?: string
  invoiceId?: string
  processedAt?: Date
  dispatchedAt?: Date
  deliveredAt?: Date
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SalesOrderItem {
  itemId: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
  discount?: number
  total: number
}

export interface Task {
  id: string
  companyId: string
  title: string
  description: string
  type: "Follow-up" | "Call" | "Visit" | "Email" | "WhatsApp" | "Meeting" | "Review" | "Other"
  relatedTo: "Lead" | "Opportunity" | "Customer" | "Quote" | "Order" | "Invoice" | "General"
  relatedId?: string
  assignedTo: string
  createdBy: string
  dueDate: Date
  priority: "Low" | "Medium" | "High" | "Urgent"
  status: "Pending" | "In Progress" | "Completed" | "Cancelled" | "Overdue"
  completedDate?: Date
  completedBy?: string
  notes?: string
  isRecurring: boolean
  recurringPattern?: "Daily" | "Weekly" | "Monthly" | "Quarterly"
  recurringInterval?: number
  nextDueDate?: Date
  reminderDate?: Date
  reminderSent: boolean
  dependsOn?: string[]
  blocks?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  companyId: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  category: "Hotel" | "Supermarket" | "Restaurant" | "Contractor" | "Other"
  customerType: "Volume Buyer" | "Commercial" | "Retail" | "Wholesale" | "Other"
  territory?: string
  assignedTo?: string
  paymentTerms: "COD" | "Net 15" | "Net 30" | "Net 60" | "Prepaid" | "Credit"
  creditLimit?: number
  currentBalance: number
  creditUsed: number
  creditAvailable: number
  status: "Active" | "Inactive" | "Suspended" | "Prospect"
  rating?: number
  tags?: string[]
  notes?: string
  businessType?: string
  industry?: string
  employeeCount?: number
  annualRevenue?: number
  website?: string
  totalOrders: number
  totalValue: number
  averageOrderValue: number
  lastOrderDate?: Date
  lastContactDate?: Date
  preferredContactMethod?: "Phone" | "Email" | "WhatsApp" | "SMS"
  preferredDeliveryTime?: string
  specialInstructions?: string
  firstOrderDate?: Date
  lastActivityDate?: Date
  createdAt: Date
  updatedAt: Date
}
