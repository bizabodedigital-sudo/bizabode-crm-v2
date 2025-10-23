#!/usr/bin/env node

const { existsSync } = require('fs');
const { join } = require('path');

/**
 * Startup Script for Bizabode CRM
 * Ensures environment variables are properly initialized before app starts
 */

// Import environment initialization
require('../lib/env-runtime.js');

const main = () => {
  console.log('🚀 Starting Bizabode CRM...');
  
  // Check if .env exists
  const envPath = join(process.cwd(), '.env');
  const envExists = existsSync(envPath);
  
  if (envExists) {
    console.log('✅ Environment file found');
  } else {
    console.log('⚠️  No .env file found, using runtime fallbacks');
  }
  
  // Validate critical environment variables
  try {
    const { validateCriticalEnv } = require('../lib/env-runtime.js');
    validateCriticalEnv();
    console.log('✅ Critical environment variables validated');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
  
  // Log startup information (safe, no secrets)
  console.log('📊 Environment Status:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API Base URL: ${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}`);
  console.log(`   Database: ${process.env.MONGODB_URI ? 'Configured' : 'Using fallback'}`);
  console.log(`   Redis: ${process.env.REDIS_URL ? 'Configured' : 'Using fallback'}`);
  console.log(`   CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  
  console.log('🎉 Environment initialization complete!');
  console.log('🔧 Starting Next.js application...');
};

// Run startup if called directly
if (require.main === module) {
  main();
}

module.exports = main;
