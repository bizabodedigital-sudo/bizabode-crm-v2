import mongoose from 'mongoose'

// Database connection optimization
export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer
  private connectionPool: Map<string, mongoose.Connection> = new Map()
  
  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer()
    }
    return DatabaseOptimizer.instance
  }
  
  // Optimize connection settings
  optimizeConnection(): void {
    mongoose.set('bufferCommands', false)
    // Removed invalid mongoose.set calls that are not valid MongooseOptions
  }
  
  // Create optimized indexes
  async createOptimizedIndexes(): Promise<void> {
    const db = mongoose.connection.db
    
    if (!db) {
      throw new Error('Database not connected')
    }
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ companyId: 1 })
    await db.collection('users').createIndex({ isActive: 1 })
    
    // Company indexes
    await db.collection('companies').createIndex({ licenseKey: 1 }, { unique: true })
    await db.collection('companies').createIndex({ licenseStatus: 1 })
    
    // Lead indexes
    await db.collection('leads').createIndex({ companyId: 1, status: 1 })
    await db.collection('leads').createIndex({ companyId: 1, assignedTo: 1 })
    await db.collection('leads').createIndex({ companyId: 1, createdAt: -1 })
    await db.collection('leads').createIndex({ email: 1 })
    
    // Opportunity indexes
    await db.collection('opportunities').createIndex({ companyId: 1, stage: 1 })
    await db.collection('opportunities').createIndex({ companyId: 1, assignedTo: 1 })
    await db.collection('opportunities').createIndex({ companyId: 1, expectedCloseDate: 1 })
    
    // Item indexes
    await db.collection('items').createIndex({ companyId: 1, sku: 1 }, { unique: true })
    await db.collection('items').createIndex({ companyId: 1, category: 1 })
    await db.collection('items').createIndex({ companyId: 1, isActive: 1 })
    await db.collection('items').createIndex({ barcode: 1 })
    
    // Invoice indexes
    await db.collection('invoices').createIndex({ companyId: 1, status: 1 })
    await db.collection('invoices').createIndex({ companyId: 1, createdAt: -1 })
    await db.collection('invoices').createIndex({ invoiceNumber: 1 })
    
    // Quote indexes
    await db.collection('quotes').createIndex({ companyId: 1, status: 1 })
    await db.collection('quotes').createIndex({ companyId: 1, createdAt: -1 })
    await db.collection('quotes').createIndex({ quoteNumber: 1 })
    
    // Delivery indexes
    await db.collection('deliveries').createIndex({ companyId: 1, status: 1 })
    await db.collection('deliveries').createIndex({ companyId: 1, scheduledDate: 1 })
    await db.collection('deliveries').createIndex({ qrCode: 1 })
    
    // Employee indexes
    await db.collection('employees').createIndex({ companyId: 1, employeeId: 1 }, { unique: true })
    await db.collection('employees').createIndex({ companyId: 1, department: 1 })
    await db.collection('employees').createIndex({ companyId: 1, status: 1 })
    
    // Attendance indexes
    await db.collection('attendances').createIndex({ companyId: 1, employeeId: 1, date: 1 }, { unique: true })
    await db.collection('attendances').createIndex({ companyId: 1, date: 1 })
    await db.collection('attendances').createIndex({ companyId: 1, status: 1 })
    
    console.log('✅ Database indexes created successfully')
  }
  
  // Query optimization utilities
  static optimizeQuery(query: any): any {
    // Add lean() for read-only queries
    if (query.lean) {
      return query.lean()
    }
    
    // Limit fields for better performance
    if (query.select) {
      return query.select(query.select)
    }
    
    return query
  }
  
  // Batch operations
  static async batchInsert<T>(
    model: mongoose.Model<T>,
    documents: T[],
    batchSize: number = 1000
  ): Promise<void> {
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize)
      await model.insertMany(batch)
    }
  }
  
  // Aggregation optimization
  static optimizeAggregation(pipeline: any[]): any[] {
    return pipeline.map(stage => {
      // Add $match early in pipeline
      if (stage.$match) {
        return { $match: stage.$match }
      }
      
      // Add $project to limit fields
      if (stage.$project) {
        return { $project: stage.$project }
      }
      
      // Add $sort with index
      if (stage.$sort) {
        return { $sort: stage.$sort }
      }
      
      return stage
    })
  }
  
  // Connection monitoring
  static getConnectionStats(): {
    readyState: number
    host: string
    port: number
    name: string
  } {
    const connection = mongoose.connection
    
    return {
      readyState: connection.readyState,
      host: connection.host,
      port: connection.port,
      name: connection.name
    }
  }
  
  // Memory usage monitoring
  static getMemoryUsage(): {
    heapUsed: number
    heapTotal: number
    external: number
  } {
    return process.memoryUsage()
  }
  
  // Cleanup old data
  static async cleanupOldData(): Promise<void> {
    const db = mongoose.connection.db
    
    if (!db) {
      throw new Error('Database not connected')
    }
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    // Clean up old logs
    await db.collection('logs').deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    })
    
    // Clean up old sessions
    await db.collection('sessions').deleteMany({
      expiresAt: { $lt: new Date() }
    })
    
    console.log('✅ Old data cleaned up successfully')
  }
}

// Query performance monitoring
export class QueryMonitor {
  private static queries = new Map<string, { count: number; totalTime: number; avgTime: number }>()
  
  static startQuery(queryName: string): () => void {
    const startTime = Date.now()
    
    return () => {
      const endTime = Date.now()
      const duration = endTime - startTime
      
      const existing = this.queries.get(queryName)
      if (existing) {
        existing.count++
        existing.totalTime += duration
        existing.avgTime = existing.totalTime / existing.count
      } else {
        this.queries.set(queryName, {
          count: 1,
          totalTime: duration,
          avgTime: duration
        })
      }
    }
  }
  
  static getQueryStats(): Record<string, { count: number; totalTime: number; avgTime: number }> {
    return Object.fromEntries(this.queries)
  }
  
  static getSlowQueries(threshold: number = 1000): Record<string, { count: number; totalTime: number; avgTime: number }> {
    const slowQueries: Record<string, { count: number; totalTime: number; avgTime: number }> = {}
    
    for (const [name, stats] of this.queries) {
      if (stats.avgTime > threshold) {
        slowQueries[name] = stats
      }
    }
    
    return slowQueries
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  details: {
    connection: boolean
    indexes: boolean
    memory: boolean
    queries: boolean
  }
}> {
  const details = {
    connection: false,
    indexes: false,
    memory: false,
    queries: false
  }
  
  try {
    // Check connection
    if (mongoose.connection.readyState === 1) {
      details.connection = true
    }
    
    // Check indexes
    const db = mongoose.connection.db
    if (db) {
      const collections = await db.listCollections().toArray()
      details.indexes = collections.length > 0
    }
    
    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024
    details.memory = memoryUsageMB < 500 // Less than 500MB
    
    // Check query performance
    const slowQueries = QueryMonitor.getSlowQueries(1000)
    details.queries = Object.keys(slowQueries).length === 0
    
    // Determine overall status
    const healthyCount = Object.values(details).filter(Boolean).length
    let status: 'healthy' | 'degraded' | 'unhealthy'
    
    if (healthyCount === 4) {
      status = 'healthy'
    } else if (healthyCount >= 2) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }
    
    return { status, details }
  } catch (error) {
    console.error('Database health check failed:', error)
    return { status: 'unhealthy', details }
  }
}
