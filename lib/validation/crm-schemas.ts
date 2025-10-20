import { z } from 'zod'

// CRM schemas
export const leadCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(20, 'Phone too long').optional().or(z.literal('')),
  company: z.string().min(2, 'Company must be at least 2 characters').max(100, 'Company too long').optional().or(z.literal('')),
  source: z.enum(['website', 'referral', 'social', 'advertisement', 'cold_call', 'other']).optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
  assignedTo: z.string().min(1, 'Assigned to is required').optional(),
  notes: z.string().max(1000, 'Notes too long').optional().or(z.literal('')),
  estimatedValue: z.number().positive('Estimated value must be positive').optional(),
  expectedCloseDate: z.string().datetime('Invalid date format').optional().or(z.literal(''))
})

export const leadUpdateSchema = leadCreateSchema.partial()

export const opportunityCreateSchema = z.object({
  leadId: z.string().min(1, 'Lead ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  value: z.number().positive('Value must be positive'),
  probability: z.number().min(0, 'Probability must be between 0 and 100').max(100, 'Probability must be between 0 and 100'),
  expectedCloseDate: z.string().datetime('Invalid date format'),
  assignedTo: z.string().min(1, 'Assigned to is required').optional(),
  notes: z.string().max(1000, 'Notes too long').optional().or(z.literal(''))
})

export const opportunityUpdateSchema = opportunityCreateSchema.partial()

export const quoteCreateSchema = z.object({
  opportunityId: z.string().min(1, 'Opportunity ID is required'),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters').max(100, 'Customer name too long'),
  customerEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  customerPhone: z.string().min(10, 'Phone must be at least 10 characters').max(20, 'Phone too long').optional().or(z.literal('')),
  items: z.array(z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    description: z.string().max(500, 'Description too long').optional().or(z.literal(''))
  })).min(1, 'At least one item is required'),
  notes: z.string().max(1000, 'Notes too long').optional().or(z.literal('')),
  validUntil: z.string().datetime('Invalid date format').optional().or(z.literal(''))
})

export const invoiceCreateSchema = z.object({
  quoteId: z.string().min(1, 'Quote ID is required').optional(),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters').max(100, 'Customer name too long'),
  customerEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  customerPhone: z.string().min(10, 'Phone must be at least 10 characters').max(20, 'Phone too long').optional().or(z.literal('')),
  items: z.array(z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unitPrice: z.number().positive('Unit price must be positive'),
    tax: z.number().min(0, 'Tax must be non-negative').optional(),
    description: z.string().max(500, 'Description too long').optional().or(z.literal(''))
  })).min(1, 'At least one item is required'),
  notes: z.string().max(1000, 'Notes too long').optional().or(z.literal('')),
  dueDate: z.string().datetime('Invalid date format').optional().or(z.literal(''))
})

// Type exports
export type LeadCreateInput = z.infer<typeof leadCreateSchema>
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>
export type OpportunityCreateInput = z.infer<typeof opportunityCreateSchema>
export type OpportunityUpdateInput = z.infer<typeof opportunityUpdateSchema>
export type QuoteCreateInput = z.infer<typeof quoteCreateSchema>
export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>
