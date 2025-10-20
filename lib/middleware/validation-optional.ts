import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Optional validation that doesn't fail requests
export function validateQueryOptional<T>(schema: z.ZodSchema<T>) {
  return (request: NextRequest): { success: true; data: T } => {
    try {
      const { searchParams } = new URL(request.url)
      const queryObject = Object.fromEntries(searchParams.entries())
      
      // Convert string values to appropriate types
      const processedQuery = Object.entries(queryObject).reduce((acc, [key, value]) => {
        // Convert numeric strings to numbers
        if (['page', 'limit'].includes(key)) {
          acc[key] = parseInt(value, 10)
        } else if (['lowStock', 'critical'].includes(key)) {
          acc[key] = value === 'true'
        } else {
          acc[key] = value
        }
        return acc
      }, {} as any)
      
      // Use safeParse and return defaults if validation fails
      const result = schema.safeParse(processedQuery)
      
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        // Return default values for failed validation
        const defaultQuery = {
          page: 1,
          limit: 50,
          ...processedQuery
        }
        
        return { success: true, data: defaultQuery as T }
      }
    } catch (error) {
      console.error('Query validation error:', error)
      
      // Return default query
      const defaultQuery = {
        page: 1,
        limit: 50
      }
      
      return { success: true, data: defaultQuery as T }
    }
  }
}

// Helper function for optional query validation
export function handleQueryValidationOptional<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } {
  return validateQueryOptional(schema)(request)
}
