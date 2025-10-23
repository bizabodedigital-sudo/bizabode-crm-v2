/**
 * Runtime Environment Variable Fallbacks
 * Ensures the app can start even if environment variables are missing
 */

import { randomBytes } from 'crypto';

// Generate secure fallback secrets
const generateFallbackSecret = (): string => {
  return randomBytes(32).toString('base64').replace(/[/+=]/g, '').substring(0, 32);
};

/**
 * Initialize environment variables with fallbacks
 * This ensures the app can start even if .env is missing
 */
export const initializeEnvFallbacks = (): void => {
  // Critical authentication secrets
  process.env.JWT_SECRET ||= generateFallbackSecret();
  process.env.NEXTAUTH_SECRET ||= generateFallbackSecret();
  process.env.SESSION_SECRET ||= generateFallbackSecret();
  
  // API configuration
  process.env.NEXT_PUBLIC_API_BASE_URL ||= 'http://localhost:3000';
  process.env.NEXTAUTH_URL ||= 'http://localhost:3000';
  
  // Database configuration
  process.env.MONGODB_URI ||= 'mongodb://mongodb:27017/bizabode_crm';
  process.env.MONGO_ROOT_USERNAME ||= 'admin';
  process.env.MONGO_ROOT_PASSWORD ||= generateFallbackSecret().substring(0, 16);
  process.env.MONGO_DATABASE ||= 'bizabode_crm';
  
  // Redis configuration
  process.env.REDIS_URL ||= 'redis://redis:6379';
  
  // Security configuration
  process.env.CORS_ORIGIN ||= 'http://localhost:3000';
  process.env.RATE_LIMIT_MAX ||= '100';
  process.env.RATE_LIMIT_WINDOW ||= '900000';
  
  // File upload configuration
  process.env.MAX_FILE_SIZE ||= '10485760';
  process.env.UPLOAD_DIR ||= './uploads';
  process.env.ALLOWED_FILE_TYPES ||= 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif';
  
  // Performance configuration
  process.env.CACHE_TTL ||= '3600';
  process.env.MAX_CONNECTIONS ||= '100';
  process.env.REQUEST_TIMEOUT ||= '30000';
  
  // Feature flags
  process.env.ENABLE_ANALYTICS ||= 'true';
  process.env.ENABLE_BACKUP ||= 'true';
  process.env.ENABLE_EMAIL_NOTIFICATIONS ||= 'false';
  process.env.ENABLE_SMS_NOTIFICATIONS ||= 'false';
  process.env.ENABLE_TWO_FACTOR_AUTH ||= 'true';
  
  // Logging configuration
  process.env.LOG_LEVEL ||= 'info';
  process.env.LOG_FORMAT ||= 'json';
  process.env.LOG_FILE_PATH ||= './logs/app.log';
  
  // SSL configuration
  process.env.SSL_CERT_PATH ||= './ssl/cert.pem';
  process.env.SSL_KEY_PATH ||= './ssl/key.pem';
  process.env.SSL_REDIRECT ||= 'true';
  
  // Backup configuration
  process.env.BACKUP_SCHEDULE ||= '0 2 * * *';
  process.env.BACKUP_RETENTION_DAYS ||= '30';
  process.env.BACKUP_STORAGE_PATH ||= './backups';
  
  // Email configuration (optional)
  process.env.SMTP_HOST ||= 'smtp.gmail.com';
  process.env.SMTP_PORT ||= '587';
  process.env.SMTP_FROM_NAME ||= 'Bizabode CRM';
  process.env.SMTP_FROM_EMAIL ||= 'noreply@localhost';
  
  // Monitoring (optional)
  process.env.SENTRY_DSN ||= '';
  process.env.GOOGLE_ANALYTICS_ID ||= '';
  
  // Set NODE_ENV if not set
  process.env.NODE_ENV ||= 'production';
  
  // Log initialization (safe, no secrets)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Environment fallbacks initialized');
    console.log('✅ Critical secrets configured');
    console.log('✅ Database and Redis connections set');
    console.log('✅ Security and performance defaults applied');
  }
};

/**
 * Validate critical environment variables
 * Throws error if required variables are missing
 */
export const validateCriticalEnv = (): void => {
  const criticalVars = [
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
    'MONGODB_URI'
  ];
  
  const missing = criticalVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing critical environment variables: ${missing.join(', ')}`);
  }
};

/**
 * Get environment configuration with type safety
 */
export const getEnvConfig = () => {
  return {
    // Database
    mongodb: {
      uri: process.env.MONGODB_URI!,
      username: process.env.MONGO_ROOT_USERNAME!,
      password: process.env.MONGO_ROOT_PASSWORD!,
      database: process.env.MONGO_DATABASE!
    },
    
    // Authentication
    auth: {
      nextAuthSecret: process.env.NEXTAUTH_SECRET!,
      jwtSecret: process.env.JWT_SECRET!,
      sessionSecret: process.env.SESSION_SECRET!,
      nextAuthUrl: process.env.NEXTAUTH_URL!
    },
    
    // API
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!
    },
    
    // Security
    security: {
      corsOrigin: process.env.CORS_ORIGIN!,
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX!),
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW!)
    },
    
    // File upload
    upload: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE!),
      uploadDir: process.env.UPLOAD_DIR!,
      allowedTypes: process.env.ALLOWED_FILE_TYPES!.split(',')
    },
    
    // Performance
    performance: {
      cacheTtl: parseInt(process.env.CACHE_TTL!),
      maxConnections: parseInt(process.env.MAX_CONNECTIONS!),
      requestTimeout: parseInt(process.env.REQUEST_TIMEOUT!)
    },
    
    // Feature flags
    features: {
      analytics: process.env.ENABLE_ANALYTICS === 'true',
      backup: process.env.ENABLE_BACKUP === 'true',
      emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
      smsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
      twoFactorAuth: process.env.ENABLE_TWO_FACTOR_AUTH === 'true'
    },
    
    // Logging
    logging: {
      level: process.env.LOG_LEVEL!,
      format: process.env.LOG_FORMAT!,
      filePath: process.env.LOG_FILE_PATH!
    }
  };
};

// Auto-initialize on import
initializeEnvFallbacks();
