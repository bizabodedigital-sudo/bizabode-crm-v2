// Mock data store for demo purposes (replace with real database later)
import type { User, Company, Item, Lead, Opportunity, Quote, Invoice, Payment, Delivery } from "./types"

// Demo company
export const demoCompany: Company = {
  id: "company-1",
  name: "Bizabode Demo Company",
  licenseKey: "DEMO-LICENSE-KEY",
  licensePlan: "professional",
  licenseExpiry: new Date("2025-12-31"),
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
}

// Demo users
export const demoUsers: User[] = [
  {
    id: "user-1",
    email: "admin@bizabode.com",
    name: "Admin User",
    role: "admin",
    companyId: "company-1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "user-2",
    email: "sales@bizabode.com",
    name: "Sales Manager",
    role: "sales",
    companyId: "company-1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

// Demo inventory items
export const demoItems: Item[] = [
  {
    id: "item-1",
    companyId: "company-1",
    sku: "PROD-001",
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with USB receiver",
    category: "Electronics",
    quantity: 150,
    reorderLevel: 50,
    unitPrice: 29.99,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "item-2",
    companyId: "company-1",
    sku: "PROD-002",
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches",
    category: "Electronics",
    quantity: 75,
    reorderLevel: 25,
    unitPrice: 89.99,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "item-3",
    companyId: "company-1",
    sku: "PROD-003",
    name: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI and ethernet",
    category: "Accessories",
    quantity: 200,
    reorderLevel: 75,
    unitPrice: 49.99,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

// Demo leads
export const demoLeads: Lead[] = [
  {
    id: "lead-1",
    companyId: "company-1",
    name: "John Smith",
    email: "john@techcorp.com",
    phone: "+1-555-0101",
    company: "TechCorp Inc",
    source: "Website",
    status: "qualified",
    notes: "Interested in bulk order for office equipment",
    assignedTo: "user-2",
    createdAt: new Date("2024-10-15"),
    updatedAt: new Date("2024-10-16"),
  },
  {
    id: "lead-2",
    companyId: "company-1",
    name: "Sarah Johnson",
    email: "sarah@startupco.com",
    phone: "+1-555-0102",
    company: "StartupCo",
    source: "Referral",
    status: "contacted",
    notes: "Looking for computer accessories for new office",
    assignedTo: "user-2",
    createdAt: new Date("2024-10-16"),
    updatedAt: new Date("2024-10-16"),
  },
]

// Demo opportunities
export const demoOpportunities: Opportunity[] = [
  {
    id: "opp-1",
    companyId: "company-1",
    leadId: "lead-1",
    title: "TechCorp Office Equipment Deal",
    customerName: "John Smith",
    customerEmail: "john@techcorp.com",
    value: 15000,
    stage: "proposal",
    probability: 75,
    expectedCloseDate: new Date("2024-11-30"),
    assignedTo: "user-2",
    notes: "Proposal sent, waiting for approval",
    createdAt: new Date("2024-10-16"),
    updatedAt: new Date("2024-10-17"),
  },
]

// Demo quotes
export const demoQuotes: Quote[] = [
  {
    id: "quote-1",
    companyId: "company-1",
    opportunityId: "opp-1",
    quoteNumber: "QT-2024-001",
    customerName: "John Smith",
    customerEmail: "john@techcorp.com",
    items: [
      { itemId: "item-1", name: "Wireless Mouse", quantity: 50, unitPrice: 29.99, total: 1499.5 },
      { itemId: "item-2", name: "Mechanical Keyboard", quantity: 50, unitPrice: 89.99, total: 4499.5 },
    ],
    subtotal: 5999.0,
    tax: 599.9,
    total: 6598.9,
    validUntil: new Date("2024-11-15"),
    status: "sent",
    notes: "Bulk discount applied",
    createdAt: new Date("2024-10-17"),
    updatedAt: new Date("2024-10-17"),
  },
]

// Demo invoices
export const demoInvoices: Invoice[] = [
  {
    id: "invoice-1",
    companyId: "company-1",
    quoteId: "quote-1",
    invoiceNumber: "INV-2024-001",
    customerName: "John Smith",
    customerEmail: "john@techcorp.com",
    items: [
      { itemId: "item-1", name: "Wireless Mouse", quantity: 50, unitPrice: 29.99, total: 1499.5 },
      { itemId: "item-2", name: "Mechanical Keyboard", quantity: 50, unitPrice: 89.99, total: 4499.5 },
    ],
    subtotal: 5999.0,
    tax: 599.9,
    total: 6598.9,
    dueDate: new Date("2024-11-30"),
    status: "sent",
    paidAmount: 0,
    notes: "",
    createdAt: new Date("2024-10-20"),
    updatedAt: new Date("2024-10-20"),
  },
]

export const demoPayments: Payment[] = []
export const demoDeliveries: Delivery[] = []
