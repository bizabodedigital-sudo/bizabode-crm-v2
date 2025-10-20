import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Security headers middleware
export function setSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  )
  
  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY')
  
  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // Strict-Transport-Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return response
}

// Rate limiting
export class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>()
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.requests.get(identifier)
    
    if (!record || now > record.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }
    
    if (record.count >= this.maxRequests) {
      return false
    }
    
    record.count++
    return true
  }
  
  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record) return this.maxRequests
    
    return Math.max(0, this.maxRequests - record.count)
  }
  
  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier)
    return record?.resetTime || 0
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

// SQL injection prevention (for MongoDB queries)
export function sanitizeQuery(query: any): any {
  if (typeof query === 'string') {
    return sanitizeInput(query)
  }
  
  if (Array.isArray(query)) {
    return query.map(sanitizeQuery)
  }
  
  if (query && typeof query === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(query)) {
      sanitized[key] = sanitizeQuery(value)
    }
    return sanitized
  }
  
  return query
}

// CORS configuration
export function setCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://bizabode.com',
    'https://www.bizabode.com'
  ]
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

// Request size limiting
export function validateRequestSize(request: NextRequest, maxSize: number = 1024 * 1024): boolean {
  const contentLength = request.headers.get('content-length')
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return false
  }
  
  return true
}

// IP whitelist/blacklist
export function isIPAllowed(ip: string, whitelist?: string[], blacklist?: string[]): boolean {
  if (blacklist && blacklist.includes(ip)) {
    return false
  }
  
  if (whitelist && !whitelist.includes(ip)) {
    return false
  }
  
  return true
}

// Security audit logging
export function logSecurityEvent(
  event: string,
  details: any,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
    userAgent: details.userAgent || 'unknown',
    ip: details.ip || 'unknown'
  }
  
  // In production, this should go to a proper logging service
  console.log(`[SECURITY-${severity.toUpperCase()}]`, logEntry)
  
  // For critical events, you might want to send alerts
  if (severity === 'critical') {
    // Send alert to security team
    console.error('CRITICAL SECURITY EVENT:', logEntry)
  }
}

// Request validation
export function validateRequest(request: NextRequest): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check request size
  if (!validateRequestSize(request)) {
    errors.push('Request too large')
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip']
  for (const header of suspiciousHeaders) {
    if (request.headers.get(header)) {
      // Log suspicious activity
      logSecurityEvent('suspicious_header', {
        header,
        value: request.headers.get(header),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }, 'medium')
    }
  }
  
  // Check user agent
  const userAgent = request.headers.get('user-agent')
  if (!userAgent || userAgent.length < 10) {
    errors.push('Invalid user agent')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
