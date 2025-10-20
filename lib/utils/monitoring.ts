import { NextRequest, NextResponse } from 'next/server'
import { logSecurityEvent } from '@/lib/middleware/security'

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, {
    count: number
    totalTime: number
    avgTime: number
    minTime: number
    maxTime: number
  }> = new Map()
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  startTiming(operation: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      this.recordMetric(operation, duration)
    }
  }
  
  private recordMetric(operation: string, duration: number): void {
    const existing = this.metrics.get(operation)
    
    if (existing) {
      existing.count++
      existing.totalTime += duration
      existing.avgTime = existing.totalTime / existing.count
      existing.minTime = Math.min(existing.minTime, duration)
      existing.maxTime = Math.max(existing.maxTime, duration)
    } else {
      this.metrics.set(operation, {
        count: 1,
        totalTime: duration,
        avgTime: duration,
        minTime: duration,
        maxTime: duration
      })
    }
  }
  
  getMetrics(): Record<string, {
    count: number
    totalTime: number
    avgTime: number
    minTime: number
    maxTime: number
  }> {
    return Object.fromEntries(this.metrics)
  }
  
  getSlowOperations(threshold: number = 1000): Record<string, {
    count: number
    totalTime: number
    avgTime: number
    minTime: number
    maxTime: number
  }> {
    const slowOps: Record<string, any> = {}
    
    for (const [operation, metrics] of this.metrics) {
      if (metrics.avgTime > threshold) {
        slowOps[operation] = metrics
      }
    }
    
    return slowOps
  }
  
  reset(): void {
    this.metrics.clear()
  }
}

// Request monitoring
export class RequestMonitor {
  private static instance: RequestMonitor
  private requests: Map<string, {
    count: number
    totalTime: number
    avgTime: number
    errors: number
  }> = new Map()
  
  static getInstance(): RequestMonitor {
    if (!RequestMonitor.instance) {
      RequestMonitor.instance = new RequestMonitor()
    }
    return RequestMonitor.instance
  }
  
  recordRequest(endpoint: string, duration: number, success: boolean): void {
    const existing = this.requests.get(endpoint)
    
    if (existing) {
      existing.count++
      existing.totalTime += duration
      existing.avgTime = existing.totalTime / existing.count
      if (!success) {
        existing.errors++
      }
    } else {
      this.requests.set(endpoint, {
        count: 1,
        totalTime: duration,
        avgTime: duration,
        errors: success ? 0 : 1
      })
    }
  }
  
  getMetrics(): Record<string, {
    count: number
    totalTime: number
    avgTime: number
    errors: number
    errorRate: number
  }> {
    const result: Record<string, any> = {}
    
    for (const [endpoint, metrics] of this.requests) {
      result[endpoint] = {
        ...metrics,
        errorRate: (metrics.errors / metrics.count) * 100
      }
    }
    
    return result
  }
  
  getHighErrorEndpoints(threshold: number = 10): Record<string, any> {
    const highErrorEndpoints: Record<string, any> = {}
    
    for (const [endpoint, metrics] of this.requests) {
      const errorRate = (metrics.errors / metrics.count) * 100
      if (errorRate > threshold) {
        highErrorEndpoints[endpoint] = {
          ...metrics,
          errorRate
        }
      }
    }
    
    return highErrorEndpoints
  }
  
  reset(): void {
    this.requests.clear()
  }
}

// System monitoring
export class SystemMonitor {
  private static instance: SystemMonitor
  private startTime: number = Date.now()
  
  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor()
    }
    return SystemMonitor.instance
  }
  
  getSystemMetrics(): {
    uptime: number
    memory: {
      used: number
      total: number
      percentage: number
    }
    cpu: {
      usage: number
    }
    requests: {
      total: number
      errors: number
      errorRate: number
    }
  } {
    const uptime = Date.now() - this.startTime
    const memoryUsage = process.memoryUsage()
    const requestMonitor = RequestMonitor.getInstance()
    const requestMetrics = requestMonitor.getMetrics()
    
    const totalRequests = Object.values(requestMetrics).reduce((sum, metrics) => sum + metrics.count, 0)
    const totalErrors = Object.values(requestMetrics).reduce((sum, metrics) => sum + metrics.errors, 0)
    
    return {
      uptime,
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      },
      cpu: {
        usage: 0 // CPU usage monitoring would require additional setup
      },
      requests: {
        total: totalRequests,
        errors: totalErrors,
        errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0
      }
    }
  }
  
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy'
    details: {
      memory: boolean
      requests: boolean
      uptime: boolean
    }
  } {
    const metrics = this.getSystemMetrics()
    const details = {
      memory: metrics.memory.percentage < 80,
      requests: metrics.requests.errorRate < 10,
      uptime: metrics.uptime > 0
    }
    
    const healthyCount = Object.values(details).filter(Boolean).length
    let status: 'healthy' | 'degraded' | 'unhealthy'
    
    if (healthyCount === 3) {
      status = 'healthy'
    } else if (healthyCount >= 2) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }
    
    return { status, details }
  }
}

// Logging system
export class Logger {
  private static instance: Logger
  private logs: Array<{
    timestamp: Date
    level: 'info' | 'warn' | 'error' | 'debug'
    message: string
    context?: any
  }> = []
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }
  
  info(message: string, context?: any): void {
    this.log('info', message, context)
  }
  
  warn(message: string, context?: any): void {
    this.log('warn', message, context)
  }
  
  error(message: string, context?: any): void {
    this.log('error', message, context)
  }
  
  debug(message: string, context?: any): void {
    this.log('debug', message, context)
  }
  
  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: any): void {
    const logEntry = {
      timestamp: new Date(),
      level,
      message,
      context
    }
    
    this.logs.push(logEntry)
    
    // Console output
    const consoleMethod = level === 'debug' ? 'log' : level
    console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context || '')
    
    // Log security events for errors
    if (level === 'error') {
      logSecurityEvent('application_error', {
        message,
        context,
        level
      }, 'medium')
    }
  }
  
  getLogs(level?: string, limit: number = 100): Array<{
    timestamp: Date
    level: string
    message: string
    context?: any
  }> {
    let filteredLogs = this.logs
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level)
    }
    
    return filteredLogs.slice(-limit)
  }
  
  clearLogs(): void {
    this.logs = []
  }
}

// Middleware for monitoring
export function withMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  operationName: string
) {
  return async (...args: T): Promise<NextResponse> => {
    const monitor = PerformanceMonitor.getInstance()
    const requestMonitor = RequestMonitor.getInstance()
    const logger = Logger.getInstance()
    
    const endTiming = monitor.startTiming(operationName)
    const startTime = performance.now()
    
    try {
      const response = await handler(...args)
      const duration = performance.now() - startTime
      
      endTiming()
      requestMonitor.recordRequest(operationName, duration, true)
      
      logger.info(`Request completed: ${operationName}`, {
        duration,
        status: response.status
      })
      
      return response
    } catch (error) {
      const duration = performance.now() - startTime
      
      endTiming()
      requestMonitor.recordRequest(operationName, duration, false)
      
      logger.error(`Request failed: ${operationName}`, {
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      throw error
    }
  }
}

// Health check endpoint
export async function healthCheck(): Promise<NextResponse> {
  const systemMonitor = SystemMonitor.getInstance()
  const performanceMonitor = PerformanceMonitor.getInstance()
  const requestMonitor = RequestMonitor.getInstance()
  const logger = Logger.getInstance()
  
  const health = systemMonitor.getHealthStatus()
  const metrics = systemMonitor.getSystemMetrics()
  const performanceMetrics = performanceMonitor.getMetrics()
  const requestMetrics = requestMonitor.getMetrics()
  
  const healthData = {
    status: health.status,
    timestamp: new Date().toISOString(),
    uptime: metrics.uptime,
    memory: metrics.memory,
    requests: metrics.requests,
    performance: performanceMetrics,
    endpoints: requestMetrics
  }
  
  logger.info('Health check performed', healthData)
  
  return NextResponse.json(healthData, {
    status: health.status === 'healthy' ? 200 : 503
  })
}
