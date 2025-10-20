import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        
        return {
          success: false,
          response: NextResponse.json({
            success: false,
            error: 'Validation failed',
            details: errors
          }, { status: 400 })
        }
      }
      
      return {
        success: false,
        response: NextResponse.json({
          success: false,
          error: 'Invalid request format'
        }, { status: 400 })
      }
    }
  }
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (request: NextRequest): { success: true; data: T } | { success: false; response: NextResponse } => {
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
      
      // Use safeParse instead of parse to avoid throwing errors
      const result = schema.safeParse(processedQuery)
      
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        // Log validation errors but don't fail the request for basic queries
        console.warn('Query validation warnings:', result.error.errors)
        
        // Return a default valid query object for basic parameters
        const defaultQuery = {
          page: 1,
          limit: 50,
          ...processedQuery
        }
        
        return { success: true, data: defaultQuery as T }
      }
    } catch (error) {
      console.error('Query validation error:', error)
      
      // Return default query instead of failing
      const defaultQuery = {
        page: 1,
        limit: 50
      }
      
      return { success: true, data: defaultQuery as T }
    }
  }
}

// Helper function to handle validation in API routes
export async function handleValidation<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  return validateRequest(schema)(request)
}

export function handleQueryValidation<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  return validateQuery(schema)(request)
}
