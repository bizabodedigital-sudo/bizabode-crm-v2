/**
 * Environment Configuration
 * 
 * Centralized environment variable management with validation and defaults
 */

interface EnvironmentConfig {
  // Database Configuration
  database: {
    mongodb: {
      uri: string;
      username: string;
      password: string;
      database: string;
    };
    redis: {
      url: string;
    };
  };

  // Application Configuration
  app: {
    nodeEnv: string;
    port: number;
    baseUrl: string;
    apiBaseUrl: string;
  };

  // Authentication Configuration
  auth: {
    nextAuthSecret: string;
    jwtSecret: string;
    sessionSecret: string;
    nextAuthUrl: string;
  };

  // Security Configuration
  security: {
    corsOrigin: string;
    rateLimitMax: number;
    rateLimitWindow: number;
  };

  // File Upload Configuration
  upload: {
    maxFileSize: number;
    uploadDir: string;
    allowedTypes: string[];
  };

  // Performance Configuration
  performance: {
    cacheTtl: number;
    maxConnections: number;
    requestTimeout: number;
  };

  // Feature Flags
  features: {
    analytics: boolean;
    backup: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    twoFactorAuth: boolean;
  };

  // Logging Configuration
  logging: {
    level: string;
    format: string;
    filePath: string;
  };

  // Email Configuration
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromName: string;
    fromEmail: string;
  };

  // Monitoring Configuration
  monitoring: {
    sentryDsn: string;
    googleAnalyticsId: string;
  };

  // Backup Configuration
  backup: {
    schedule: string;
    retentionDays: number;
    storagePath: string;
  };

  // SSL Configuration
  ssl: {
    certPath: string;
    keyPath: string;
    redirect: boolean;
  };
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

/**
 * Get environment variable as number with fallback
 */
function getEnvNumber(key: string, fallback: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : fallback;
}

/**
 * Get environment variable as boolean with fallback
 */
function getEnvBoolean(key: string, fallback: boolean): boolean {
  const value = process.env[key];
  return value ? value.toLowerCase() === 'true' : fallback;
}

/**
 * Get environment variable as array with fallback
 */
function getEnvArray(key: string, fallback: string[]): string[] {
  const value = process.env[key];
  return value ? value.split(',').map(item => item.trim()) : fallback;
}

/**
 * Environment configuration object
 */
export const env: EnvironmentConfig = {
  // Database Configuration
  database: {
    mongodb: {
      uri: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/bizabode_crm'),
      username: getEnvVar('MONGO_ROOT_USERNAME', 'admin'),
      password: getEnvVar('MONGO_ROOT_PASSWORD', 'password123'),
      database: getEnvVar('MONGO_DATABASE', 'bizabode_crm'),
    },
    redis: {
      url: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
    },
  },

  // Application Configuration
  app: {
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    port: getEnvNumber('PORT', 3000),
    baseUrl: getEnvVar('NEXTAUTH_URL', 'http://localhost:3000'),
    apiBaseUrl: getEnvVar('NEXT_PUBLIC_API_BASE_URL', 'http://localhost:3000/api'),
  },

  // Authentication Configuration
  auth: {
    nextAuthSecret: getEnvVar('NEXTAUTH_SECRET', 'your-nextauth-secret'),
    jwtSecret: getEnvVar('JWT_SECRET', 'your-jwt-secret'),
    sessionSecret: getEnvVar('SESSION_SECRET', 'your-session-secret'),
    nextAuthUrl: getEnvVar('NEXTAUTH_URL', 'http://localhost:3000'),
  },

  // Security Configuration
  security: {
    corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
    rateLimitMax: getEnvNumber('RATE_LIMIT_MAX', 100),
    rateLimitWindow: getEnvNumber('RATE_LIMIT_WINDOW', 900000), // 15 minutes
  },

  // File Upload Configuration
  upload: {
    maxFileSize: getEnvNumber('MAX_FILE_SIZE', 10485760), // 10MB
    uploadDir: getEnvVar('UPLOAD_DIR', './uploads'),
    allowedTypes: getEnvArray('ALLOWED_FILE_TYPES', ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif']),
  },

  // Performance Configuration
  performance: {
    cacheTtl: getEnvNumber('CACHE_TTL', 3600), // 1 hour
    maxConnections: getEnvNumber('MAX_CONNECTIONS', 100),
    requestTimeout: getEnvNumber('REQUEST_TIMEOUT', 30000), // 30 seconds
  },

  // Feature Flags
  features: {
    analytics: getEnvBoolean('ENABLE_ANALYTICS', true),
    backup: getEnvBoolean('ENABLE_BACKUP', true),
    emailNotifications: getEnvBoolean('ENABLE_EMAIL_NOTIFICATIONS', false),
    smsNotifications: getEnvBoolean('ENABLE_SMS_NOTIFICATIONS', false),
    twoFactorAuth: getEnvBoolean('ENABLE_TWO_FACTOR_AUTH', true),
  },

  // Logging Configuration
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
    format: getEnvVar('LOG_FORMAT', 'json'),
    filePath: getEnvVar('LOG_FILE_PATH', './logs/app.log'),
  },

  // Email Configuration
  email: {
    smtpHost: getEnvVar('SMTP_HOST', 'smtp.gmail.com'),
    smtpPort: getEnvNumber('SMTP_PORT', 587),
    smtpUser: getEnvVar('SMTP_USER', ''),
    smtpPass: getEnvVar('SMTP_PASS', ''),
    fromName: getEnvVar('SMTP_FROM_NAME', 'Bizabode CRM'),
    fromEmail: getEnvVar('SMTP_FROM_EMAIL', 'noreply@localhost'),
  },

  // Monitoring Configuration
  monitoring: {
    sentryDsn: getEnvVar('SENTRY_DSN', ''),
    googleAnalyticsId: getEnvVar('GOOGLE_ANALYTICS_ID', ''),
  },

  // Backup Configuration
  backup: {
    schedule: getEnvVar('BACKUP_SCHEDULE', '0 2 * * *'), // Daily at 2 AM
    retentionDays: getEnvNumber('BACKUP_RETENTION_DAYS', 30),
    storagePath: getEnvVar('BACKUP_STORAGE_PATH', './backups'),
  },

  // SSL Configuration
  ssl: {
    certPath: getEnvVar('SSL_CERT_PATH', './ssl/cert.pem'),
    keyPath: getEnvVar('SSL_KEY_PATH', './ssl/key.pem'),
    redirect: getEnvBoolean('SSL_REDIRECT', true),
  },
};

/**
 * Validate critical environment variables
 */
export function validateEnvironment(): void {
  const criticalVars = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'JWT_SECRET',
  ];

  const missing = criticalVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing critical environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return env.app.nodeEnv === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return env.app.nodeEnv === 'development';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return env.app.nodeEnv === 'test';
}

/**
 * Get database connection string
 */
export function getDatabaseUrl(): string {
  return env.database.mongodb.uri;
}

/**
 * Get Redis connection string
 */
export function getRedisUrl(): string {
  return env.database.redis.url;
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return env.app.apiBaseUrl;
}

/**
 * Get application base URL
 */
export function getBaseUrl(): string {
  return env.app.baseUrl;
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof EnvironmentConfig['features']): boolean {
  return env.features[feature];
}

/**
 * Get upload configuration
 */
export function getUploadConfig() {
  return env.upload;
}

/**
 * Get security configuration
 */
export function getSecurityConfig() {
  return env.security;
}

/**
 * Get performance configuration
 */
export function getPerformanceConfig() {
  return env.performance;
}

/**
 * Get logging configuration
 */
export function getLoggingConfig() {
  return env.logging;
}

/**
 * Get email configuration
 */
export function getEmailConfig() {
  return env.email;
}

/**
 * Get monitoring configuration
 */
export function getMonitoringConfig() {
  return env.monitoring;
}

/**
 * Get backup configuration
 */
export function getBackupConfig() {
  return env.backup;
}

/**
 * Get SSL configuration
 */
export function getSSLConfig() {
  return env.ssl;
}

export default env;