/**
 * Environment Configuration
 * 
 * This file centralizes environment-specific configuration
 * to eliminate hardcoded values throughout the application.
 */

// Environment detection
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  RETRIES: parseInt(process.env.NEXT_PUBLIC_API_RETRIES || '3'),
} as const

// Database Configuration
export const DATABASE_CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || '',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'bizabode-crm',
} as const

// Authentication Configuration
export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SESSION_SECRET: process.env.SESSION_SECRET || '',
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  COOKIE_SAME_SITE: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
} as const

// Email Configuration
export const EMAIL_CONFIG = {
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@bizabode.com',
  FROM_NAME: process.env.FROM_NAME || 'Bizabode CRM',
} as const

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
} as const

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_DARK_MODE: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === 'true',
  ENABLE_MULTI_TENANT: process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === 'true',
  ENABLE_API_DOCS: process.env.NEXT_PUBLIC_ENABLE_API_DOCS === 'true',
  ENABLE_DEBUG_MODE: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
} as const

// External Service URLs
export const EXTERNAL_SERVICES = {
  PAYMENT_GATEWAY: process.env.PAYMENT_GATEWAY_URL || '',
  SMS_SERVICE: process.env.SMS_SERVICE_URL || '',
  NOTIFICATION_SERVICE: process.env.NOTIFICATION_SERVICE_URL || '',
  ANALYTICS_SERVICE: process.env.ANALYTICS_SERVICE_URL || '',
} as const

// Security Configuration
export const SECURITY_CONFIG = {
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
  SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT || '3600000'), // 1 hour
} as const

// Business Configuration
export const BUSINESS_CONFIG = {
  COMPANY_NAME: process.env.COMPANY_NAME || 'Bizabode CRM',
  COMPANY_EMAIL: process.env.COMPANY_EMAIL || 'support@bizabode.com',
  COMPANY_PHONE: process.env.COMPANY_PHONE || '',
  COMPANY_ADDRESS: process.env.COMPANY_ADDRESS || '',
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || 'support@bizabode.com',
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || 'USD',
  DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE || 'UTC',
  DEFAULT_LANGUAGE: process.env.DEFAULT_LANGUAGE || 'en',
} as const

// License Configuration
export const LICENSE_CONFIG = {
  LICENSE_KEY: process.env.LICENSE_KEY || '',
  LICENSE_TYPE: process.env.LICENSE_TYPE || 'demo',
  MAX_USERS: parseInt(process.env.MAX_USERS || '10'),
  MAX_COMPANIES: parseInt(process.env.MAX_COMPANIES || '1'),
  EXPIRATION_DATE: process.env.EXPIRATION_DATE || '',
} as const

// Monitoring Configuration
export const MONITORING_CONFIG = {
  ENABLE_LOGGING: process.env.ENABLE_LOGGING === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
  METRICS_ENDPOINT: process.env.METRICS_ENDPOINT || '/metrics',
} as const

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_HOT_RELOAD: process.env.ENABLE_HOT_RELOAD === 'true',
  ENABLE_SOURCE_MAPS: process.env.ENABLE_SOURCE_MAPS === 'true',
  ENABLE_DEBUG_TOOLS: process.env.ENABLE_DEBUG_TOOLS === 'true',
  MOCK_API_RESPONSES: process.env.MOCK_API_RESPONSES === 'true',
} as const

// Validation helpers
export const validateConfig = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Export all configuration
export const CONFIG = {
  ENV,
  API: API_CONFIG,
  DATABASE: DATABASE_CONFIG,
  AUTH: AUTH_CONFIG,
  EMAIL: EMAIL_CONFIG,
  UPLOAD: UPLOAD_CONFIG,
  FEATURES: FEATURE_FLAGS,
  EXTERNAL: EXTERNAL_SERVICES,
  SECURITY: SECURITY_CONFIG,
  BUSINESS: BUSINESS_CONFIG,
  LICENSE: LICENSE_CONFIG,
  MONITORING: MONITORING_CONFIG,
  DEV: DEV_CONFIG,
} as const

export default CONFIG
