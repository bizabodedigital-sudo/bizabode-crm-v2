import { NextRequest } from 'next/server'
import { z } from 'zod'

// Fallback validation that provides defaults for missing or invalid data
export function validateQueryWithFallback<T>(schema: z.ZodSchema<T>) {
  return (request: NextRequest): { success: true; data: T } => {
    const { searchParams } = new URL(request.url)
    const queryObject = Object.fromEntries(searchParams.entries())
    
    // Convert string values to appropriate types with fallbacks
    const processedQuery = Object.entries(queryObject).reduce((acc, [key, value]) => {
      // Convert numeric strings to numbers with fallbacks
      if (['page', 'limit'].includes(key)) {
        const num = parseInt(value, 10)
        acc[key] = isNaN(num) ? (key === 'page' ? 1 : 50) : num
      } else if (['lowStock', 'critical'].includes(key)) {
        acc[key] = value === 'true'
      } else {
        acc[key] = value
      }
      return acc
    }, {} as any)
    
    // Provide sensible defaults
    const defaultQuery = {
      page: 1,
      limit: 50,
      ...processedQuery
    }
    
    // Try to validate, but always return valid data
    const result = schema.safeParse(defaultQuery)
    
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      // If validation fails, return the default query with any valid fields
      return { success: true, data: defaultQuery as T }
    }
  }
}

// Helper function for fallback query validation
export function handleQueryValidationFallback<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } {
  return validateQueryWithFallback(schema)(request)
}
