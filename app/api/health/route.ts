import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Check database connection
    await connectDB()
    
    // Check system resources
    const memoryUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    // Check environment variables
    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    
    if (missingEnvVars.length > 0) {
      return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: `Missing environment variables: ${missingEnvVars.join(', ')}`,
        uptime: uptime,
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        }
      }, { status: 500 })
    }
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      responseTime: responseTime,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
      },
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    }, { status: 500 })
  }
}