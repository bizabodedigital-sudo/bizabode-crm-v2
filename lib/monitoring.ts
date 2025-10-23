/**
 * Production Monitoring and Logging System
 * Comprehensive monitoring for production deployment
 */

import { NextRequest } from 'next/server';

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Performance metrics
interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  requestId: string;
  timestamp: string;
  memoryUsage?: NodeJS.MemoryUsage;
}

// Monitoring class
export class MonitoringService {
  private static instance: MonitoringService;
  private logs: LogEntry[] = [];
  private metrics: PerformanceMetrics[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory
  private maxMetrics = 5000; // Keep last 5k metrics in memory

  private constructor() {}

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Logging methods
  public log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    request?: NextRequest
  ): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'inventory-system',
      metadata,
      requestId: request?.headers.get('x-request-id') || undefined,
      ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      userAgent: request?.headers.get('user-agent') || undefined
    };

    this.logs.push(logEntry);
    
    // Trim logs if exceeding limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    const consoleMethod = this.getConsoleMethod(level);
    consoleMethod(`[${level.toUpperCase()}] ${message}`, metadata || '');
  }

  public debug(message: string, metadata?: Record<string, any>, request?: NextRequest): void {
    this.log(LogLevel.DEBUG, message, metadata, request);
  }

  public info(message: string, metadata?: Record<string, any>, request?: NextRequest): void {
    this.log(LogLevel.INFO, message, metadata, request);
  }

  public warn(message: string, metadata?: Record<string, any>, request?: NextRequest): void {
    this.log(LogLevel.WARN, message, metadata, request);
  }

  public error(message: string, error?: Error, metadata?: Record<string, any>, request?: NextRequest): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      service: 'inventory-system',
      metadata,
      requestId: request?.headers.get('x-request-id') || undefined,
      ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    this.logs.push(logEntry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    console.error(`[ERROR] ${message}`, error, metadata || '');
  }

  public fatal(message: string, error?: Error, metadata?: Record<string, any>, request?: NextRequest): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.FATAL,
      message,
      service: 'inventory-system',
      metadata,
      requestId: request?.headers.get('x-request-id') || undefined,
      ip: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    this.logs.push(logEntry);
    
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    console.error(`[FATAL] ${message}`, error, metadata || '');
    
    // In production, send to alerting system
    this.sendAlert('FATAL_ERROR', { message, error, metadata });
  }

  // Performance tracking
  public trackPerformance(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    requestId: string,
    memoryUsage?: NodeJS.MemoryUsage
  ): void {
    const metric: PerformanceMetrics = {
      endpoint,
      method,
      duration,
      statusCode,
      requestId,
      timestamp: new Date().toISOString(),
      memoryUsage
    };

    this.metrics.push(metric);
    
    // Trim metrics if exceeding limit
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (duration > 5000) { // 5 seconds
      this.warn('Slow request detected', {
        endpoint,
        method,
        duration,
        statusCode,
        requestId
      });
    }
  }

  // Health check
  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    recentErrors: number;
    averageResponseTime: number;
  } {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    // Count recent errors (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentErrors = this.logs.filter(log => 
      log.level === LogLevel.ERROR && 
      new Date(log.timestamp) > fiveMinutesAgo
    ).length;

    // Calculate average response time (last 100 requests)
    const recentMetrics = this.metrics.slice(-100);
    const averageResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, metric) => sum + metric.duration, 0) / recentMetrics.length
      : 0;

    // Determine health status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (recentErrors > 10) {
      status = 'unhealthy';
    } else if (recentErrors > 5 || averageResponseTime > 2000) {
      status = 'degraded';
    }

    return {
      status,
      uptime,
      memoryUsage,
      recentErrors,
      averageResponseTime
    };
  }

  // Get recent logs
  public getRecentLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit);
  }

  // Get performance metrics
  public getPerformanceMetrics(limit: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  // Get system statistics
  public getSystemStats(): {
    totalLogs: number;
    totalMetrics: number;
    errorRate: number;
    averageResponseTime: number;
    memoryUsage: NodeJS.MemoryUsage;
  } {
    const totalLogs = this.logs.length;
    const totalMetrics = this.metrics.length;
    
    const errorLogs = this.logs.filter(log => log.level === LogLevel.ERROR).length;
    const errorRate = totalLogs > 0 ? (errorLogs / totalLogs) * 100 : 0;
    
    const averageResponseTime = this.metrics.length > 0
      ? this.metrics.reduce((sum, metric) => sum + metric.duration, 0) / this.metrics.length
      : 0;

    return {
      totalLogs,
      totalMetrics,
      errorRate,
      averageResponseTime,
      memoryUsage: process.memoryUsage()
    };
  }

  // Private helper methods
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return console.error;
      default:
        return console.log;
    }
  }

  private sendAlert(type: string, data: Record<string, any>): void {
    // In production, integrate with alerting services like:
    // - PagerDuty
    // - Slack
    // - Email
    // - SMS
    
    console.error(`[ALERT-${type}]`, data);
    
    // Example: Send to external monitoring service
    // await fetch('https://monitoring-service.com/alerts', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type, data, timestamp: new Date().toISOString() })
    // });
  }
}

// Performance tracking decorator
export function trackPerformance(
  endpoint: string,
  method: string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const requestId = args[0]?.headers?.get('x-request-id') || 'unknown';
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        
        MonitoringService.getInstance().trackPerformance(
          endpoint,
          method,
          duration,
          200,
          requestId,
          process.memoryUsage()
        );
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        MonitoringService.getInstance().trackPerformance(
          endpoint,
          method,
          duration,
          500,
          requestId,
          process.memoryUsage()
        );
        
        throw error;
      }
    };

    return descriptor;
  };
}

// Export singleton instance
export const monitoring = MonitoringService.getInstance();
