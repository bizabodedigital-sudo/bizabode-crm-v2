/**
 * Production Security Utilities
 * Comprehensive security measures for production deployment
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';

// Rate limiting configuration
const RATE_LIMITS = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 uploads per minute
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 auth attempts per windowMs
  }
};

// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 1000); // Limit length
}

// SQL injection prevention
export function sanitizeForDatabase(input: string): string {
  return input
    .replace(/['";\\]/g, '') // Remove SQL injection characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments
    .replace(/\*\//g, '');
}

// File upload security
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['text/csv', 'application/csv'];
  const ALLOWED_EXTENSIONS = ['.csv'];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.csv')) {
    return { valid: false, error: 'Only CSV files are allowed' };
  }

  // Check file extension
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  );
  
  if (!hasValidExtension) {
    return { valid: false, error: 'Invalid file extension' };
  }

  return { valid: true };
}

// Request validation schemas
export const inventoryItemSchema = z.object({
  sku: z.string()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be less than 50 characters')
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU can only contain letters, numbers, hyphens, and underscores'),
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category must be less than 100 characters'),
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative')
    .max(999999, 'Quantity exceeds maximum limit'),
  reorderLevel: z.number()
    .int('Reorder level must be an integer')
    .min(0, 'Reorder level cannot be negative')
    .max(999999, 'Reorder level exceeds maximum limit'),
  unitPrice: z.number()
    .min(0, 'Unit price cannot be negative')
    .max(999999.99, 'Unit price exceeds maximum limit'),
  costPrice: z.number()
    .min(0, 'Cost price cannot be negative')
    .max(999999.99, 'Cost price exceeds maximum limit')
    .optional(),
  critical: z.boolean().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
  createdBy: z.string().min(1, 'Created by is required')
});

export const bulkImportSchema = z.object({
  items: z.array(inventoryItemSchema).min(1, 'At least one item is required').max(1000, 'Maximum 1000 items per import'),
  companyId: z.string().min(1, 'Company ID is required'),
  createdBy: z.string().min(1, 'Created by is required')
});

// Authentication and authorization
export function validateAuthToken(request: NextRequest): { valid: boolean; userId?: string; error?: string } {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  
  // In production, validate JWT token here
  // For now, basic validation
  if (token.length < 10) {
    return { valid: false, error: 'Invalid token format' };
  }

  // Extract user ID from token (in production, decode JWT)
  const userId = 'user-' + token.substring(0, 8);
  
  return { valid: true, userId };
}

// Rate limiting (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  ip: string, 
  type: keyof typeof RATE_LIMITS = 'api'
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const limit = RATE_LIMITS[type];
  const key = `${ip}:${type}`;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.windowMs });
    return { allowed: true, remaining: limit.max - 1, resetTime: now + limit.windowMs };
  }
  
  if (current.count >= limit.max) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  current.count++;
  return { allowed: true, remaining: limit.max - current.count, resetTime: current.resetTime };
}

// CORS configuration
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
};

// Input validation helper
export function validateAndSanitizeInput<T>(
  data: unknown, 
  schema: z.ZodSchema<T>
): { success: boolean; data?: T; errors?: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Invalid input format'] };
  }
}

// Logging for security events
export function logSecurityEvent(
  event: string, 
  details: Record<string, any>, 
  severity: 'low' | 'medium' | 'high' = 'medium'
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
    source: 'inventory-system'
  };
  
  // In production, send to security monitoring system
  console.log(`[SECURITY-${severity.toUpperCase()}]`, JSON.stringify(logEntry));
  
  // For high severity events, could trigger alerts
  if (severity === 'high') {
    // Send alert to security team
    console.error('HIGH SEVERITY SECURITY EVENT:', logEntry);
  }
}
