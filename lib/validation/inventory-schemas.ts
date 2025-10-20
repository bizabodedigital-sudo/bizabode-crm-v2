import { z } from 'zod'

// Inventory schemas
export const itemCreateSchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU too long'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional().or(z.literal('')),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50, 'Category too long'),
  quantity: z.number().int('Quantity must be an integer').min(0, 'Quantity must be non-negative'),
  unitPrice: z.number().positive('Unit price must be positive'),
  costPrice: z.number().positive('Cost price must be positive').optional(),
  supplier: z.string().max(100, 'Supplier name too long').optional().or(z.literal('')),
  location: z.string().max(100, 'Location too long').optional().or(z.literal('')),
  barcode: z.string().max(50, 'Barcode too long').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  critical: z.boolean().optional(),
  reorderLevel: z.number().int('Reorder level must be an integer').min(0, 'Reorder level must be non-negative').optional(),
  maxStock: z.number().int('Max stock must be an integer').min(0, 'Max stock must be non-negative').optional()
})

export const itemUpdateSchema = itemCreateSchema.partial()

export const stockMovementSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  type: z.enum(['in', 'out', 'adjustment']),
  quantity: z.number().int('Quantity must be an integer').positive('Quantity must be positive'),
  reason: z.string().min(2, 'Reason must be at least 2 characters').max(100, 'Reason too long'),
  notes: z.string().max(500, 'Notes too long').optional().or(z.literal('')),
  reference: z.string().max(100, 'Reference too long').optional().or(z.literal(''))
})

export const deliveryCreateSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  scheduledDate: z.string().datetime('Invalid date format'),
  deliveryAddress: z.string().min(10, 'Delivery address must be at least 10 characters').max(500, 'Delivery address too long'),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters').max(100, 'Customer name too long'),
  customerPhone: z.string().min(10, 'Phone must be at least 10 characters').max(20, 'Phone too long'),
  notes: z.string().max(500, 'Notes too long').optional().or(z.literal('')),
  assignedTo: z.string().min(1, 'Assigned to is required').optional()
})

export const deliveryUpdateSchema = deliveryCreateSchema.partial()

// Type exports
export type ItemCreateInput = z.infer<typeof itemCreateSchema>
export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>
export type StockMovementInput = z.infer<typeof stockMovementSchema>
export type DeliveryCreateInput = z.infer<typeof deliveryCreateSchema>
export type DeliveryUpdateInput = z.infer<typeof deliveryUpdateSchema>
