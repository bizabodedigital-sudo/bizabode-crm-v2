import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logSecurityEvent } from '@/lib/middleware/security'

// Custom error classes
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean
  
  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  public errors: Record<string, string[]>
  
  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 400)
    this.errors = errors
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429)
  }
}

// Error handler for API routes
export function handleApiError(error: unknown, request?: NextRequest): NextResponse {
  console.error('API Error:', error)
  
  // Log security events for suspicious errors
  if (request) {
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    
    logSecurityEvent('api_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userAgent,
      ip,
      url: request.url
    }, 'medium')
  }
  
  // Handle known error types
  if (error instanceof AppError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      ...(error instanceof ValidationError && { errors: error.errors })
    }, { status: error.statusCode })
  }
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {}
    
    error.errors.forEach((err) => {
      const path = err.path.join('.')
      if (!errors[path]) {
        errors[path] = []
      }
      errors[path].push(err.message)
    })
    
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      errors
    }, { status: 400 })
  }
  
  // Handle database errors
  if (error instanceof Error && error.name === 'MongoError') {
    return NextResponse.json({
      success: false,
      error: 'Database error occurred'
    }, { status: 500 })
  }
  
  // Handle JWT errors
  if (error instanceof Error && error.name === 'JsonWebTokenError') {
    return NextResponse.json({
      success: false,
      error: 'Invalid token'
    }, { status: 401 })
  }
  
  // Handle network errors
  if (error instanceof Error && error.name === 'NetworkError') {
    return NextResponse.json({
      success: false,
      error: 'Network error occurred'
    }, { status: 503 })
  }
  
  // Handle timeout errors
  if (error instanceof Error && error.name === 'TimeoutError') {
    return NextResponse.json({
      success: false,
      error: 'Request timeout'
    }, { status: 408 })
  }
  
  // Generic error fallback
  return NextResponse.json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error instanceof Error ? error.message : 'Unknown error occurred'
  }, { status: 500 })
}

// Async error wrapper for API routes
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error, args[0] as NextRequest)
    }
  }
}

// Error boundary for React components
export class ErrorBoundary extends Error {
  public componentStack: string
  
  constructor(message: string, componentStack: string) {
    super(message)
    this.componentStack = componentStack
    this.name = 'ErrorBoundary'
  }
}

// Global error handler
export function setupGlobalErrorHandling(): void {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
    
    logSecurityEvent('uncaught_exception', {
      error: error.message,
      stack: error.stack
    }, 'critical')
    
    // Graceful shutdown
    process.exit(1)
  })
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason)
    
    logSecurityEvent('unhandled_rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined
    }, 'critical')
  })
  
  // Handle SIGTERM
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully')
    process.exit(0)
  })
  
  // Handle SIGINT
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully')
    process.exit(0)
  })
}

// Error reporting service
export class ErrorReporter {
  private static instance: ErrorReporter
  private errors: Array<{
    timestamp: Date
    error: Error
    context: any
    severity: 'low' | 'medium' | 'high' | 'critical'
  }> = []
  
  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter()
    }
    return ErrorReporter.instance
  }
  
  report(error: Error, context: any = {}, severity: 'low' | 'medium' | 'high' | 'critical' = 'low'): void {
    this.errors.push({
      timestamp: new Date(),
      error,
      context,
      severity
    })
    
    // In production, send to external service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(error, context, severity)
    }
  }
  
  private sendToExternalService(error: Error, context: any, severity: string): void {
    // Implement external error reporting (Sentry, LogRocket, etc.)
    console.log('Sending error to external service:', {
      error: error.message,
      stack: error.stack,
      context,
      severity
    })
  }
  
  getErrors(severity?: string): Array<{
    timestamp: Date
    error: Error
    context: any
    severity: string
  }> {
    if (severity) {
      return this.errors.filter(e => e.severity === severity)
    }
    return this.errors
  }
  
  clearErrors(): void {
    this.errors = []
  }
}

// Error metrics
export class ErrorMetrics {
  private static instance: ErrorMetrics
  private metrics: Map<string, number> = new Map()
  
  static getInstance(): ErrorMetrics {
    if (!ErrorMetrics.instance) {
      ErrorMetrics.instance = new ErrorMetrics()
    }
    return ErrorMetrics.instance
  }
  
  increment(errorType: string): void {
    const current = this.metrics.get(errorType) || 0
    this.metrics.set(errorType, current + 1)
  }
  
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }
  
  reset(): void {
    this.metrics.clear()
  }
}