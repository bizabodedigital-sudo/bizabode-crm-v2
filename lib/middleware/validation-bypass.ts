import { NextRequest } from 'next/server'

// Temporary bypass validation for backward compatibility
export function bypassValidation(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const queryObject = Object.fromEntries(searchParams.entries())
  
  // Convert string values to appropriate types with safe defaults
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
  
  // Always return valid data with sensible defaults
  return {
    success: true,
    data: {
      page: 1,
      limit: 50,
      ...processedQuery
    }
  }
}

// Helper function for bypass validation
export function handleQueryValidationBypass(request: NextRequest) {
  return bypassValidation(request)
}
