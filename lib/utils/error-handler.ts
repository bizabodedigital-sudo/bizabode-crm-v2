import { NextResponse } from 'next/server'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
  code?: string
}

export class CustomError extends Error implements AppError {
  public statusCode: number
  public isOperational: boolean
  public code?: string

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    this.code = code

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR')
    this.name = 'DatabaseError'
  }
}

// Error handler for API routes
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Handle known custom errors
  if (error instanceof CustomError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        statusCode: error.statusCode
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as any
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: zodError.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      },
      { status: 400 }
    )
  }

  // Handle MongoDB errors
  if (error && typeof error === 'object' && 'code' in error) {
    const mongoError = error as any
    
    switch (mongoError.code) {
      case 11000:
        return NextResponse.json(
          {
            success: false,
            error: 'Duplicate entry found',
            code: 'DUPLICATE_ERROR'
          },
          { status: 409 }
        )
      case 11001:
        return NextResponse.json(
          {
            success: false,
            error: 'Duplicate key error',
            code: 'DUPLICATE_KEY_ERROR'
          },
          { status: 409 }
        )
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Database operation failed',
            code: 'DATABASE_ERROR'
          },
          { status: 500 }
        )
    }
  }

  // Handle JWT errors
  if (error && typeof error === 'object' && 'name' in error) {
    const jwtError = error as any
    
    switch (jwtError.name) {
      case 'JsonWebTokenError':
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid token',
            code: 'INVALID_TOKEN'
          },
          { status: 401 }
        )
      case 'TokenExpiredError':
        return NextResponse.json(
          {
            success: false,
            error: 'Token expired',
            code: 'TOKEN_EXPIRED'
          },
          { status: 401 }
        )
    }
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : 'Internal server error'
  
  return NextResponse.json(
    {
      success: false,
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : message,
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  )
}

// Async error wrapper for API routes
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw error
    }
  }
}

// Error boundary for React components
export class ErrorBoundary extends Error {
  constructor(message: string, public componentStack?: string) {
    super(message)
    this.name = 'ErrorBoundary'
  }
}

// Logging utility
export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error
  }

  console.error('Application Error:', JSON.stringify(errorInfo, null, 2))
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or DataDog
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error)
  }
}

// Success response helper
export function successResponse<T>(data: T, message?: string, statusCode: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      message
    },
    { status: statusCode }
  )
}

// Error response helper
export function errorResponse(message: string, statusCode: number = 500, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code
    },
    { status: statusCode }
  )
}

// Validation error response helper
export function validationErrorResponse(errors: Record<string, string[]>) {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      details: errors
    },
    { status: 400 }
  )
}

// Not found response helper
export function notFoundResponse(message: string = 'Resource not found') {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'NOT_FOUND'
    },
    { status: 404 }
  )
}

// Unauthorized response helper
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'UNAUTHORIZED'
    },
    { status: 401 }
  )
}

// Forbidden response helper
export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'FORBIDDEN'
    },
    { status: 403 }
  )
}
