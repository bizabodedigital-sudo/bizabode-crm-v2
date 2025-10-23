const { randomBytes } = require('crypto');

// Generate secure fallback secrets
const generateFallbackSecret = () => {
  return randomBytes(32).toString('base64').replace(/[/+=]/g, '').substring(0, 32);
};

/**
 * Initialize environment variables with fallbacks
 * This ensures the app can start even if .env is missing
 */
const initializeEnvFallbacks = () => {
  // Critical authentication secrets
  if (!process.env.JWT_SECRET) process.env.JWT_SECRET = generateFallbackSecret();
  if (!process.env.NEXTAUTH_SECRET) process.env.NEXTAUTH_SECRET = generateFallbackSecret();
  if (!process.env.SESSION_SECRET) process.env.SESSION_SECRET = generateFallbackSecret();
  
  // API configuration
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3000';
  if (!process.env.NEXTAUTH_URL) process.env.NEXTAUTH_URL = 'http://localhost:3000';
  
  // Database configuration
  if (!process.env.MONGODB_URI) process.env.MONGODB_URI = 'mongodb://mongodb:27017/bizabode_crm';
  if (!process.env.MONGO_ROOT_USERNAME) process.env.MONGO_ROOT_USERNAME = 'admin';
  if (!process.env.MONGO_ROOT_PASSWORD) process.env.MONGO_ROOT_PASSWORD = generateFallbackSecret().substring(0, 16);
  if (!process.env.MONGO_DATABASE) process.env.MONGO_DATABASE = 'bizabode_crm';
  
  // Redis configuration
  if (!process.env.REDIS_URL) process.env.REDIS_URL = 'redis://redis:6379';
  
  // Security configuration
  if (!process.env.CORS_ORIGIN) process.env.CORS_ORIGIN = 'http://localhost:3000';
  if (!process.env.RATE_LIMIT_MAX) process.env.RATE_LIMIT_MAX = '100';
  if (!process.env.RATE_LIMIT_WINDOW) process.env.RATE_LIMIT_WINDOW = '900000';
  
  // File upload configuration
  if (!process.env.MAX_FILE_SIZE) process.env.MAX_FILE_SIZE = '10485760';
  if (!process.env.UPLOAD_DIR) process.env.UPLOAD_DIR = './uploads';
  if (!process.env.ALLOWED_FILE_TYPES) process.env.ALLOWED_FILE_TYPES = 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif';
  
  // Performance configuration
  if (!process.env.CACHE_TTL) process.env.CACHE_TTL = '3600';
  if (!process.env.MAX_CONNECTIONS) process.env.MAX_CONNECTIONS = '100';
  if (!process.env.REQUEST_TIMEOUT) process.env.REQUEST_TIMEOUT = '30000';
  
  // Feature flags
  if (!process.env.ENABLE_ANALYTICS) process.env.ENABLE_ANALYTICS = 'true';
  if (!process.env.ENABLE_BACKUP) process.env.ENABLE_BACKUP = 'true';
  if (!process.env.ENABLE_EMAIL_NOTIFICATIONS) process.env.ENABLE_EMAIL_NOTIFICATIONS = 'false';
  if (!process.env.ENABLE_SMS_NOTIFICATIONS) process.env.ENABLE_SMS_NOTIFICATIONS = 'false';
  if (!process.env.ENABLE_TWO_FACTOR_AUTH) process.env.ENABLE_TWO_FACTOR_AUTH = 'true';
  
  // Logging configuration
  if (!process.env.LOG_LEVEL) process.env.LOG_LEVEL = 'info';
  if (!process.env.LOG_FORMAT) process.env.LOG_FORMAT = 'json';
  if (!process.env.LOG_FILE_PATH) process.env.LOG_FILE_PATH = './logs/app.log';
  
  // SSL configuration
  if (!process.env.SSL_CERT_PATH) process.env.SSL_CERT_PATH = './ssl/cert.pem';
  if (!process.env.SSL_KEY_PATH) process.env.SSL_KEY_PATH = './ssl/key.pem';
  if (!process.env.SSL_REDIRECT) process.env.SSL_REDIRECT = 'true';
  
  // Backup configuration
  if (!process.env.BACKUP_SCHEDULE) process.env.BACKUP_SCHEDULE = '0 2 * * *';
  if (!process.env.BACKUP_RETENTION_DAYS) process.env.BACKUP_RETENTION_DAYS = '30';
  if (!process.env.BACKUP_STORAGE_PATH) process.env.BACKUP_STORAGE_PATH = './backups';
  
  // Email configuration (optional)
  if (!process.env.SMTP_HOST) process.env.SMTP_HOST = 'smtp.gmail.com';
  if (!process.env.SMTP_PORT) process.env.SMTP_PORT = '587';
  if (!process.env.SMTP_FROM_NAME) process.env.SMTP_FROM_NAME = 'Bizabode CRM';
  if (!process.env.SMTP_FROM_EMAIL) process.env.SMTP_FROM_EMAIL = 'noreply@localhost';
  
  // Monitoring (optional)
  if (!process.env.SENTRY_DSN) process.env.SENTRY_DSN = '';
  if (!process.env.GOOGLE_ANALYTICS_ID) process.env.GOOGLE_ANALYTICS_ID = '';
  
  // Set NODE_ENV if not set
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
  
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
const validateCriticalEnv = () => {
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
const getEnvConfig = () => {
  return {
    // Database
    mongodb: {
      uri: process.env.MONGODB_URI,
      username: process.env.MONGO_ROOT_USERNAME,
      password: process.env.MONGO_ROOT_PASSWORD,
      database: process.env.MONGO_DATABASE
    },
    
    // Authentication
    auth: {
      nextAuthSecret: process.env.NEXTAUTH_SECRET,
      jwtSecret: process.env.JWT_SECRET,
      sessionSecret: process.env.SESSION_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL
    },
    
    // API
    api: {
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
    },
    
    // Security
    security: {
      corsOrigin: process.env.CORS_ORIGIN,
      rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX),
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW)
    },
    
    // File upload
    upload: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE),
      uploadDir: process.env.UPLOAD_DIR,
      allowedTypes: process.env.ALLOWED_FILE_TYPES.split(',')
    },
    
    // Performance
    performance: {
      cacheTtl: parseInt(process.env.CACHE_TTL),
      maxConnections: parseInt(process.env.MAX_CONNECTIONS),
      requestTimeout: parseInt(process.env.REQUEST_TIMEOUT)
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
      level: process.env.LOG_LEVEL,
      format: process.env.LOG_FORMAT,
      filePath: process.env.LOG_FILE_PATH
    }
  };
};

// Auto-initialize on import
initializeEnvFallbacks();

module.exports = {
  initializeEnvFallbacks,
  validateCriticalEnv,
  getEnvConfig
};
