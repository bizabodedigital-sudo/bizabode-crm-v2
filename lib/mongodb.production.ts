/**
 * Production MongoDB Connection
 * Optimized for production with connection pooling, retries, and monitoring
 */

import mongoose from 'mongoose';
import { monitoring } from './monitoring';

// Connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27018/bizabode-crm?authSource=admin';

// Production connection options
const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0, // Disable mongoose buffering
  retryWrites: true, // Retry failed writes
  retryReads: true, // Retry failed reads
  readPreference: 'secondaryPreferred', // Prefer secondary for reads
  writeConcern: {
    w: 'majority', // Wait for majority of replicas
    j: true, // Wait for journal commit
    wtimeout: 10000 // 10 second timeout
  },
  // Connection pool settings
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  minPoolSize: 2, // Maintain at least 2 connections
  // SSL/TLS settings for production
  ssl: process.env.NODE_ENV === 'production',
  sslValidate: process.env.NODE_ENV === 'production',
  // Authentication
  authSource: 'admin',
  // Compression
  compressors: ['zlib'],
  zlibCompressionLevel: 6
};

// Connection state
let isConnected = false;
let connectionAttempts = 0;
const maxRetries = 5;
const retryDelay = 1000; // 1 second

// Connection event handlers
mongoose.connection.on('connected', () => {
  isConnected = true;
  connectionAttempts = 0;
  monitoring.info('MongoDB connected successfully', {
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  });
});

mongoose.connection.on('error', (error) => {
  isConnected = false;
  monitoring.error('MongoDB connection error', error, {
    connectionAttempts,
    host: mongoose.connection.host,
    port: mongoose.connection.port
  });
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  monitoring.warn('MongoDB disconnected', {
    host: mongoose.connection.host,
    port: mongoose.connection.port
  });
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  monitoring.info('MongoDB reconnected', {
    host: mongoose.connection.host,
    port: mongoose.connection.port
  });
});

// Graceful shutdown handler
process.on('SIGINT', async () => {
  monitoring.info('Received SIGINT, closing MongoDB connection...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  monitoring.info('Received SIGTERM, closing MongoDB connection...');
  await mongoose.connection.close();
  process.exit(0);
});

// Connection retry logic
async function connectWithRetry(): Promise<void> {
  try {
    connectionAttempts++;
    monitoring.info(`Attempting MongoDB connection (attempt ${connectionAttempts}/${maxRetries})`);
    
    await mongoose.connect(MONGODB_URI, connectionOptions);
    
    monitoring.info('MongoDB connection established', {
      connectionAttempts,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    });
    
  } catch (error) {
    monitoring.error('MongoDB connection failed', error as Error, {
      connectionAttempts,
      maxRetries,
      uri: MONGODB_URI.replace(/\/\/.*@/, '//***:***@') // Hide credentials in logs
    });
    
    if (connectionAttempts < maxRetries) {
      const delay = retryDelay * Math.pow(2, connectionAttempts - 1); // Exponential backoff
      monitoring.info(`Retrying connection in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectWithRetry();
    } else {
      monitoring.fatal('MongoDB connection failed after maximum retries', error as Error, {
        connectionAttempts,
        maxRetries
      });
      throw error;
    }
  }
}

// Main connection function
export async function connectDB(): Promise<void> {
  if (isConnected) {
    return;
  }

  try {
    await connectWithRetry();
  } catch (error) {
    monitoring.fatal('Failed to establish MongoDB connection', error as Error);
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  connectionState: string;
  pingTime?: number;
  error?: string;
}> {
  try {
    const startTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const pingTime = Date.now() - startTime;
    
    const connectionState = mongoose.connection.readyState;
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (connectionState !== 1) { // 1 = connected
      status = 'unhealthy';
    } else if (pingTime > 1000) { // > 1 second
      status = 'degraded';
    }
    
    return {
      status,
      connectionState: getConnectionStateName(connectionState),
      pingTime
    };
  } catch (error) {
    monitoring.error('Database health check failed', error as Error);
    return {
      status: 'unhealthy',
      connectionState: 'error',
      error: (error as Error).message
    };
  }
}

// Get connection state name
function getConnectionStateName(state: number): string {
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return 'unknown';
  }
}

// Connection statistics
export function getConnectionStats(): {
  isConnected: boolean;
  readyState: number;
  readyStateName: string;
  host: string;
  port: number;
  name: string;
  collections: number;
} {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    readyStateName: getConnectionStateName(mongoose.connection.readyState),
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    collections: Object.keys(mongoose.connection.collections).length
  };
}

// Optimize indexes for production
export async function optimizeIndexes(): Promise<void> {
  try {
    monitoring.info('Optimizing database indexes...');
    
    // Create indexes for common queries
    const collections = [
      { name: 'items', indexes: [
        { sku: 1, companyId: 1 },
        { companyId: 1, category: 1 },
        { companyId: 1, quantity: 1, reorderLevel: 1 },
        { companyId: 1, createdAt: -1 }
      ]},
      { name: 'inventorymovements', indexes: [
        { itemId: 1, createdAt: -1 },
        { companyId: 1, createdAt: -1 },
        { movementType: 1, createdAt: -1 }
      ]}
    ];
    
    for (const collection of collections) {
      for (const index of collection.indexes) {
        try {
          await mongoose.connection.db.collection(collection.name).createIndex(index);
          monitoring.info(`Created index for ${collection.name}`, { index });
        } catch (error) {
          // Index might already exist, which is fine
          if (!(error as any).code === 11000) {
            monitoring.warn(`Failed to create index for ${collection.name}`, { index, error: (error as Error).message });
          }
        }
      }
    }
    
    monitoring.info('Database indexes optimized');
  } catch (error) {
    monitoring.error('Failed to optimize database indexes', error as Error);
  }
}

// Export connection state
export { isConnected };
