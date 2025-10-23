#!/usr/bin/env node

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

/**
 * Auto Environment Initialization Script
 * Creates .env file with secure defaults if it doesn't exist
 */

interface EnvConfig {
  [key: string]: string | number | boolean;
}

const generateSecret = (length: number = 32): string => {
  return randomBytes(length).toString('base64').replace(/[/+=]/g, '').substring(0, length);
};

const generatePassword = (length: number = 16): string => {
  return randomBytes(length).toString('base64').replace(/[/+=]/g, '').substring(0, length);
};

const getDefaultEnvConfig = (): EnvConfig => {
  const timestamp = new Date().toISOString().split('T')[0];
  
  return {
    // Database Configuration
    MONGODB_URI: 'mongodb://mongodb:27017/bizabode_crm',
    MONGO_ROOT_USERNAME: 'admin',
    MONGO_ROOT_PASSWORD: generatePassword(16),
    MONGO_DATABASE: 'bizabode_crm',
    
    // Application Configuration
    NODE_ENV: 'production',
    NEXTAUTH_SECRET: generateSecret(32),
    NEXTAUTH_URL: 'http://localhost:3000',
    JWT_SECRET: generateSecret(32),
    
    // API Configuration
    NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3000',
    
    // Redis Configuration
    REDIS_URL: 'redis://redis:6379',
    
    // Email Configuration (Optional)
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: '587',
    SMTP_USER: '',
    SMTP_PASS: '',
    SMTP_FROM_NAME: 'Bizabode CRM',
    SMTP_FROM_EMAIL: 'noreply@localhost',
    
    // File Upload Configuration
    MAX_FILE_SIZE: '10485760',
    UPLOAD_DIR: './uploads',
    ALLOWED_FILE_TYPES: 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png,gif',
    
    // Security Configuration
    CORS_ORIGIN: 'http://localhost:3000',
    RATE_LIMIT_MAX: '100',
    RATE_LIMIT_WINDOW: '900000',
    SESSION_SECRET: generateSecret(32),
    
    // Monitoring & Analytics (Optional)
    SENTRY_DSN: '',
    GOOGLE_ANALYTICS_ID: '',
    
    // Backup Configuration
    BACKUP_SCHEDULE: '0 2 * * *',
    BACKUP_RETENTION_DAYS: '30',
    BACKUP_STORAGE_PATH: './backups',
    
    // SSL/TLS Configuration
    SSL_CERT_PATH: './ssl/cert.pem',
    SSL_KEY_PATH: './ssl/key.pem',
    SSL_REDIRECT: 'true',
    
    // Performance Configuration
    CACHE_TTL: '3600',
    MAX_CONNECTIONS: '100',
    REQUEST_TIMEOUT: '30000',
    
    // Feature Flags
    ENABLE_ANALYTICS: 'true',
    ENABLE_BACKUP: 'true',
    ENABLE_EMAIL_NOTIFICATIONS: 'false',
    ENABLE_SMS_NOTIFICATIONS: 'false',
    ENABLE_TWO_FACTOR_AUTH: 'true',
    
    // Logging Configuration
    LOG_LEVEL: 'info',
    LOG_FORMAT: 'json',
    LOG_FILE_PATH: './logs/app.log',
    
    // Generated timestamp
    ENV_GENERATED_AT: timestamp,
  };
};

const formatEnvFile = (config: EnvConfig): string => {
  const sections = [
    {
      title: 'DATABASE CONFIGURATION',
      vars: ['MONGODB_URI', 'MONGO_ROOT_USERNAME', 'MONGO_ROOT_PASSWORD', 'MONGO_DATABASE']
    },
    {
      title: 'APPLICATION CONFIGURATION',
      vars: ['NODE_ENV', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'JWT_SECRET']
    },
    {
      title: 'API CONFIGURATION',
      vars: ['NEXT_PUBLIC_API_BASE_URL']
    },
    {
      title: 'REDIS CONFIGURATION',
      vars: ['REDIS_URL']
    },
    {
      title: 'EMAIL CONFIGURATION (Optional)',
      vars: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_NAME', 'SMTP_FROM_EMAIL']
    },
    {
      title: 'FILE UPLOAD CONFIGURATION',
      vars: ['MAX_FILE_SIZE', 'UPLOAD_DIR', 'ALLOWED_FILE_TYPES']
    },
    {
      title: 'SECURITY CONFIGURATION',
      vars: ['CORS_ORIGIN', 'RATE_LIMIT_MAX', 'RATE_LIMIT_WINDOW', 'SESSION_SECRET']
    },
    {
      title: 'MONITORING & ANALYTICS (Optional)',
      vars: ['SENTRY_DSN', 'GOOGLE_ANALYTICS_ID']
    },
    {
      title: 'BACKUP CONFIGURATION',
      vars: ['BACKUP_SCHEDULE', 'BACKUP_RETENTION_DAYS', 'BACKUP_STORAGE_PATH']
    },
    {
      title: 'SSL/TLS CONFIGURATION',
      vars: ['SSL_CERT_PATH', 'SSL_KEY_PATH', 'SSL_REDIRECT']
    },
    {
      title: 'PERFORMANCE CONFIGURATION',
      vars: ['CACHE_TTL', 'MAX_CONNECTIONS', 'REQUEST_TIMEOUT']
    },
    {
      title: 'FEATURE FLAGS',
      vars: ['ENABLE_ANALYTICS', 'ENABLE_BACKUP', 'ENABLE_EMAIL_NOTIFICATIONS', 'ENABLE_SMS_NOTIFICATIONS', 'ENABLE_TWO_FACTOR_AUTH']
    },
    {
      title: 'LOGGING CONFIGURATION',
      vars: ['LOG_LEVEL', 'LOG_FORMAT', 'LOG_FILE_PATH']
    },
    {
      title: 'SYSTEM INFORMATION',
      vars: ['ENV_GENERATED_AT']
    }
  ];

  let content = '# ===========================================\n';
  content += '# BIZABODE CRM - AUTO-GENERATED ENVIRONMENT\n';
  content += '# ===========================================\n';
  content += '# Generated automatically by init-env.ts\n';
  content += '# DO NOT commit this file to version control\n\n';

  sections.forEach(section => {
    content += `# ===========================================\n`;
    content += `# ${section.title}\n`;
    content += `# ===========================================\n`;
    
    section.vars.forEach(key => {
      if (config[key] !== undefined) {
        content += `${key}=${config[key]}\n`;
      }
    });
    content += '\n';
  });

  return content;
};

const main = (): void => {
  const envPath = join(process.cwd(), '.env');
  
  console.log('🔧 Initializing environment configuration...');
  
  // Check if .env already exists
  if (existsSync(envPath)) {
    console.log('✅ .env file already exists, skipping generation');
    
    // Log existing configuration status
    try {
      const existingContent = readFileSync(envPath, 'utf8');
      const hasSecrets = existingContent.includes('NEXTAUTH_SECRET') && 
                        existingContent.includes('JWT_SECRET');
      
      if (hasSecrets) {
        console.log('✅ Environment file contains required secrets');
      } else {
        console.log('⚠️  Environment file missing some secrets, consider regenerating');
      }
    } catch (error) {
      console.log('⚠️  Could not read existing .env file');
    }
    
    return;
  }
  
  // Generate new environment configuration
  console.log('🔄 Generating new environment configuration...');
  
  const config = getDefaultEnvConfig();
  const envContent = formatEnvFile(config);
  
  try {
    writeFileSync(envPath, envContent, 'utf8');
    
    console.log('✅ Created .env with generated defaults');
    console.log('✅ Added JWT_SECRET and NEXTAUTH_SECRET');
    console.log('✅ Added SESSION_SECRET and MONGO_ROOT_PASSWORD');
    console.log('✅ Using default localhost URLs');
    console.log('✅ Configured database and Redis connections');
    console.log('✅ Set up security and performance defaults');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Update NEXTAUTH_URL to your production domain');
    console.log('2. Update NEXT_PUBLIC_API_BASE_URL to your production domain');
    console.log('3. Configure email settings if needed');
    console.log('4. Set up SSL certificates in ./ssl/ directory');
    console.log('');
    console.log('⚠️  IMPORTANT: Keep these secrets secure and never commit .env to version control!');
    
  } catch (error) {
    console.error('❌ Failed to create .env file:', error);
    process.exit(1);
  }
};

// Run the initialization
if (require.main === module) {
  main();
}

export default main;
