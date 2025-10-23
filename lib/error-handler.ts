/**
 * Production Error Handling System
 * Comprehensive error handling for production deployment
 */

import { NextResponse } from 'next/server';
import { logSecurityEvent } from './security';

// Error types
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, any>
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    code: number;
    details?: Record<string, any>;
    timestamp: string;
    requestId?: string;
  };
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private requestId: string = '';

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public setRequestId(requestId: string): void {
    this.requestId = requestId;
  }

  public handleError(error: Error | AppError, request?: Request): NextResponse {
    const timestamp = new Date().toISOString();
    
    // Log the error
    this.logError(error, request);

    // Handle different error types
    if (error instanceof AppError) {
      return this.handleAppError(error, timestamp);
    }

    // Handle unexpected errors
    return this.handleUnexpectedError(error, timestamp);
  }

  private handleAppError(error: AppError, timestamp: string): NextResponse {
    const response: ErrorResponse = {
      success: false,
      error: {
        type: error.type,
        message: error.message,
        code: error.statusCode,
        details: error.details,
        timestamp,
        requestId: this.requestId
      }
    };

    // Log security events for certain error types
    if ([ErrorType.AUTHENTICATION_ERROR, ErrorType.AUTHORIZATION_ERROR, ErrorType.RATE_LIMIT_ERROR].includes(error.type)) {
      logSecurityEvent('security_error', {
        errorType: error.type,
        message: error.message,
        details: error.details
      }, 'medium');
    }

    return NextResponse.json(response, { 
      status: error.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': this.requestId
      }
    });
  }

  private handleUnexpectedError(error: Error, timestamp: string): NextResponse {
    // Log as high severity
    logSecurityEvent('unexpected_error', {
      message: error.message,
      stack: error.stack,
      name: error.name
    }, 'high');

    const response: ErrorResponse = {
      success: false,
      error: {
        type: ErrorType.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
        code: 500,
        timestamp,
        requestId: this.requestId
      }
    };

    return NextResponse.json(response, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': this.requestId
      }
    });
  }

  private logError(error: Error | AppError, request?: Request): void {
    const logData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      url: request?.url,
      method: request?.method,
      userAgent: request?.headers.get('user-agent'),
      ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip')
    };

    if (error instanceof AppError) {
      logData['type'] = error.type;
      logData['statusCode'] = error.statusCode;
      logData['isOperational'] = error.isOperational;
      logData['details'] = error.details;
    }

    // In production, send to logging service (e.g., Winston, Pino)
    console.error('[ERROR]', JSON.stringify(logData, null, 2));
  }
}

// Predefined error creators
export const createValidationError = (message: string, details?: Record<string, any>) => 
  new AppError(message, ErrorType.VALIDATION_ERROR, 400, true, details);

export const createAuthenticationError = (message: string = 'Authentication required') => 
  new AppError(message, ErrorType.AUTHENTICATION_ERROR, 401);

export const createAuthorizationError = (message: string = 'Insufficient permissions') => 
  new AppError(message, ErrorType.AUTHORIZATION_ERROR, 403);

export const createNotFoundError = (resource: string = 'Resource') => 
  new AppError(`${resource} not found`, ErrorType.NOT_FOUND_ERROR, 404);

export const createConflictError = (message: string, details?: Record<string, any>) => 
  new AppError(message, ErrorType.CONFLICT_ERROR, 409, true, details);

export const createRateLimitError = (message: string = 'Rate limit exceeded') => 
  new AppError(message, ErrorType.RATE_LIMIT_ERROR, 429);

export const createDatabaseError = (message: string, details?: Record<string, any>) => 
  new AppError(message, ErrorType.DATABASE_ERROR, 500, true, details);

export const createFileUploadError = (message: string, details?: Record<string, any>) => 
  new AppError(message, ErrorType.FILE_UPLOAD_ERROR, 400, true, details);

// Success response helper
export function createSuccessResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  });
}

// Async error wrapper
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'An unexpected error occurred',
        ErrorType.INTERNAL_SERVER_ERROR,
        500,
        false,
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };
}

// Request ID generator
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
