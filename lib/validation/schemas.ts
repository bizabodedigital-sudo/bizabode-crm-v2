import { z } from 'zod'

// Base validation schemas
export const emailSchema = z.string().email('Invalid email format')
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters')
export const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format')

// User validation schemas
export const userCreateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['admin', 'manager', 'sales', 'warehouse', 'viewer']),
  companyId: objectIdSchema,
  isActive: z.boolean().optional().default(true)
})

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true })

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

// Employee validation schemas
export const employeeCreateSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  position: z.string().min(1, 'Position is required').max(100, 'Position too long'),
  department: z.string().min(1, 'Department is required').max(100, 'Department too long'),
  hireDate: z.string().datetime('Invalid date format'),
  salary: z.number().min(0, 'Salary must be positive'),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'intern']),
  status: z.enum(['active', 'inactive', 'terminated', 'on-leave']).optional().default('active'),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: phoneSchema,
    email: emailSchema.optional()
  }).optional()
})

export const employeeUpdateSchema = employeeCreateSchema.partial()

// Lead validation schemas
export const leadCreateSchema = z.object({
  name: z.string().min(1, 'Lead name is required').max(100, 'Name too long'),
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().min(1, 'Company is required').max(100, 'Company name too long'),
  source: z.string().min(1, 'Source is required').max(50, 'Source too long'),
  status: z.enum(['new', 'contacted', 'qualified', 'unqualified']).optional().default('new'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  assignedTo: objectIdSchema.optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional()
})

export const leadUpdateSchema = leadCreateSchema.partial()

// Opportunity validation schemas
export const opportunityCreateSchema = z.object({
  leadId: objectIdSchema.optional(),
  name: z.string().min(1, 'Opportunity name is required').max(100, 'Name too long'),
  value: z.number().min(0, 'Value must be positive'),
  stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost']),
  probability: z.number().min(0, 'Probability must be between 0 and 100').max(100, 'Probability must be between 0 and 100'),
  expectedCloseDate: z.string().datetime('Invalid date format').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  assignedTo: objectIdSchema.optional()
})

export const opportunityUpdateSchema = opportunityCreateSchema.partial()

// Item validation schemas
export const itemCreateSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU too long'),
  name: z.string().min(1, 'Item name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  reorderLevel: z.number().min(0, 'Reorder level must be non-negative'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  costPrice: z.number().min(0, 'Cost price must be non-negative').optional(),
  isActive: z.boolean().optional().default(true),
  critical: z.boolean().optional().default(false)
})

export const itemUpdateSchema = itemCreateSchema.partial()

// Quote validation schemas
export const quoteItemSchema = z.object({
  itemId: objectIdSchema,
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  total: z.number().min(0, 'Total must be non-negative')
})

export const quoteCreateSchema = z.object({
  customerId: objectIdSchema.optional(),
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Name too long'),
  customerEmail: emailSchema.optional(),
  customerPhone: phoneSchema.optional(),
  items: z.array(quoteItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0, 'Subtotal must be non-negative'),
  taxRate: z.number().min(0, 'Tax rate must be non-negative').max(100, 'Tax rate cannot exceed 100%'),
  tax: z.number().min(0, 'Tax must be non-negative'),
  discount: z.number().min(0, 'Discount must be non-negative').optional(),
  total: z.number().min(0, 'Total must be non-negative'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  validUntil: z.string().datetime('Invalid date format').optional()
})

export const quoteUpdateSchema = quoteCreateSchema.partial()

// Invoice validation schemas
export const invoiceItemSchema = z.object({
  itemId: objectIdSchema,
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  total: z.number().min(0, 'Total must be non-negative')
})

export const invoiceCreateSchema = z.object({
  customerId: objectIdSchema.optional(),
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Name too long'),
  customerEmail: emailSchema.optional(),
  customerPhone: phoneSchema.optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0, 'Subtotal must be non-negative'),
  taxRate: z.number().min(0, 'Tax rate must be non-negative').max(100, 'Tax rate cannot exceed 100%'),
  tax: z.number().min(0, 'Tax must be non-negative'),
  discount: z.number().min(0, 'Discount must be non-negative').optional(),
  total: z.number().min(0, 'Total must be non-negative'),
  notes: z.string().max(1000, 'Notes too long').optional(),
  dueDate: z.string().datetime('Invalid date format').optional()
})

export const invoiceUpdateSchema = invoiceCreateSchema.partial()

// Company validation schemas
export const companyCreateSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100, 'Name too long'),
  address: z.string().max(200, 'Address too long').optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  website: z.string().url('Invalid website URL').optional(),
  licenseKey: z.string().min(1, 'License key is required'),
  businessType: z.string().optional(),
  region: z.string().optional()
})

export const companyUpdateSchema = companyCreateSchema.partial().omit({ licenseKey: true })

// Stock adjustment validation
export const stockAdjustmentSchema = z.object({
  adjustment: z.number().int('Adjustment must be an integer'),
  reason: z.string().min(1, 'Reason is required').max(200, 'Reason too long'),
  type: z.enum(['in', 'out', 'adjustment', 'return']).optional().default('adjustment')
})

// Pagination and filtering schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').optional().default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional().default(50)
})

export const searchSchema = z.object({
  search: z.string().max(100, 'Search term too long').optional(),
  status: z.string().max(50, 'Status too long').optional(),
  category: z.string().max(50, 'Category too long').optional()
})

// Combined query schemas
export const itemQuerySchema = paginationSchema.merge(searchSchema).extend({
  lowStock: z.boolean().optional(),
  critical: z.boolean().optional()
})

export const leadQuerySchema = paginationSchema.merge(searchSchema).extend({
  assignedTo: objectIdSchema.optional(),
  status: z.string().max(50, 'Status too long').optional()
})

export const opportunityQuerySchema = paginationSchema.extend({
  stage: z.string().max(50, 'Stage too long').optional(),
  assignedTo: objectIdSchema.optional()
})

// Validation helper functions
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return { success: false, errors: ['Invalid input format'] }
  }
}

// Type exports for use in API routes
export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>
export type LeadCreateInput = z.infer<typeof leadCreateSchema>
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>
export type OpportunityCreateInput = z.infer<typeof opportunityCreateSchema>
export type OpportunityUpdateInput = z.infer<typeof opportunityUpdateSchema>
export type ItemCreateInput = z.infer<typeof itemCreateSchema>
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>
export type QuoteCreateInput = z.infer<typeof quoteCreateSchema>
export type QuoteUpdateInput = z.infer<typeof quoteUpdateSchema>
export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>
export type InvoiceUpdateInput = z.infer<typeof invoiceUpdateSchema>
export type CompanyCreateInput = z.infer<typeof companyCreateSchema>
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>
export type ItemQueryInput = z.infer<typeof itemQuerySchema>
export type LeadQueryInput = z.infer<typeof leadQuerySchema>
export type OpportunityQueryInput = z.infer<typeof opportunityQuerySchema>
