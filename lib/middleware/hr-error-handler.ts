// Express types not needed for Next.js API routes
import mongoose from 'mongoose'

// Define basic types for compatibility
interface Request {
  url: string
  method: string
}

interface Response {
  status: (code: number) => { json: (data: any) => void }
  json: (data: any) => void
}

export interface HRAppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export class HRValidationError extends Error {
  statusCode: number = 400
  isOperational: boolean = true

  constructor(message: string) {
    super(message)
    this.name = 'HRValidationError'
  }
}

export class HRNotFoundError extends Error {
  statusCode: number = 404
  isOperational: boolean = true

  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`)
    this.name = 'HRNotFoundError'
  }
}

export class HRDuplicateError extends Error {
  statusCode: number = 409
  isOperational: boolean = true

  constructor(message: string) {
    super(message)
    this.name = 'HRDuplicateError'
  }
}

export class HRUnauthorizedError extends Error {
  statusCode: number = 403
  isOperational: boolean = true

  constructor(message: string = 'Insufficient permissions for HR operation') {
    super(message)
    this.name = 'HRUnauthorizedError'
  }
}

export class HRBusinessLogicError extends Error {
  statusCode: number = 422
  isOperational: boolean = true

  constructor(message: string) {
    super(message)
    this.name = 'HRBusinessLogicError'
  }
}

// Standard error response format
export interface ErrorResponse {
  success: false
  error: string
  message: string
  statusCode: number
  timestamp: string
  path: string
  details?: any
  stack?: string
}

// Main error handler middleware
export const hrErrorHandler = (
  error: HRAppError,
  req: Request,
  res: Response,
  next: any
) => {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Internal Server Error'
  let details: any = undefined

  // Handle specific error types
  if (error instanceof HRValidationError) {
    statusCode = 400
    message = 'Validation Error'
    details = { validation: error.message }
  } else if (error instanceof HRNotFoundError) {
    statusCode = 404
    message = 'Resource Not Found'
  } else if (error instanceof HRDuplicateError) {
    statusCode = 409
    message = 'Duplicate Resource'
  } else if (error instanceof HRUnauthorizedError) {
    statusCode = 403
    message = 'Access Denied'
  } else if (error instanceof HRBusinessLogicError) {
    statusCode = 422
    message = 'Business Logic Error'
  }

  // Handle MongoDB errors
  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400
    message = 'Validation Error'
    details = {
      validation: Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }))
    }
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400
    message = 'Invalid ID format'
    details = { field: error.path, value: error.value }
  } else if ((error as any).code === 11000) {
    statusCode = 409
    message = 'Duplicate Entry'
    const field = Object.keys((error as any).keyPattern || {})[0]
    details = { field, value: (error as any).keyValue?.[field] }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  // Handle specific HR business logic errors
  if (error.message.includes('Employee ID already exists')) {
    statusCode = 409
    message = 'Employee ID already exists'
    details = { field: 'employeeId' }
  } else if (error.message.includes('Email already exists')) {
    statusCode = 409
    message = 'Email already exists'
    details = { field: 'email' }
  } else if (error.message.includes('Cannot delete employee with active records')) {
    statusCode = 422
    message = 'Cannot delete employee with active records'
    details = { reason: 'Employee has associated attendance, payroll, or leave records' }
  } else if (error.message.includes('Leave request overlaps with existing request')) {
    statusCode = 422
    message = 'Leave request overlaps with existing request'
    details = { reason: 'Date range conflicts with approved leave' }
  } else if (error.message.includes('Payroll already exists for this period')) {
    statusCode = 409
    message = 'Payroll already exists for this period'
    details = { reason: 'Employee already has payroll record for this period' }
  }

  // Log error for debugging (in production, use proper logging service)
  console.error('HR Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: error.name || 'HRAppError',
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.url,
    details
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack
  }

  (res as any).status(statusCode as number).json(errorResponse)
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// 404 handler for HR routes
export const hrNotFoundHandler = (req: Request, res: Response) => {
  const errorResponse = {
    success: false,
    error: 'NotFoundError',
    message: `HR route ${req.method} ${req.url} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.url
  } as any

  (res as any).status(404).json(errorResponse)
}

// HR-specific validation helpers
export const validateEmployeeId = (employeeId: string): boolean => {
  return mongoose.Types.ObjectId.isValid(employeeId)
}

export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate <= endDate
}

export const validatePayPeriod = (startDate: Date, endDate: Date): boolean => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 31 // Maximum 31 days for pay period
}

export const validateLeaveDates = (startDate: Date, endDate: Date): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return startDate >= today && endDate >= startDate
}

// HR business logic validators
export const validateEmployeeStatus = (status: string): boolean => {
  return ['active', 'inactive', 'terminated', 'on-leave'].includes(status)
}

export const validateEmploymentType = (type: string): boolean => {
  return ['full-time', 'part-time', 'contract', 'intern'].includes(type)
}

export const validateLeaveType = (type: string): boolean => {
  return ['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'other'].includes(type)
}

export const validatePerformanceScore = (score: number): boolean => {
  return score >= 1 && score <= 5
}

// Error response helpers
export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  details?: any
) => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: 'HRAppError',
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: (res as any).req?.url || 'unknown',
    details
  }

  res.status(statusCode).json(errorResponse)
}

export const sendValidationError = (
  res: Response,
  message: string,
  details?: any
) => {
  sendErrorResponse(res, 400, message, details)
}

export const sendNotFoundError = (
  res: Response,
  resource: string,
  id: string
) => {
  sendErrorResponse(res, 404, `${resource} with ID ${id} not found`)
}

export const sendDuplicateError = (
  res: Response,
  message: string,
  details?: any
) => {
  sendErrorResponse(res, 409, message, details)
}

export const sendUnauthorizedError = (
  res: Response,
  message: string = 'Insufficient permissions for HR operation'
) => {
  sendErrorResponse(res, 403, message)
}

export const sendBusinessLogicError = (
  res: Response,
  message: string,
  details?: any
) => {
  sendErrorResponse(res, 422, message, details)
}
