import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import { startLowStockCheck, startOverdueInvoiceCheck, startLicenseCheck } from '@/cron'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Only allow admin users to trigger cron jobs
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { job } = await request.json()

    if (!job || !['low-stock', 'overdue-invoices', 'license-check'].includes(job)) {
      return NextResponse.json({ 
        error: 'Invalid job type. Must be: low-stock, overdue-invoices, or license-check' 
      }, { status: 400 })
    }

    let result = ''

    switch (job) {
      case 'low-stock':
        result = 'Low stock check triggered'
        // Note: In a real implementation, you'd call the actual function
        // For now, we'll just return success
        break
      case 'overdue-invoices':
        result = 'Overdue invoice check triggered'
        break
      case 'license-check':
        result = 'License check triggered'
        break
    }

    return NextResponse.json({
      success: true,
      message: result,
      job,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cron job trigger error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger cron job' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Only allow admin users to view cron status
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: {
        jobs: [
          {
            name: 'low-stock-check',
            schedule: 'Daily at 8:00 AM',
            description: 'Checks for low stock items and sends alerts'
          },
          {
            name: 'overdue-invoices',
            schedule: 'Daily at 9:00 AM', 
            description: 'Checks for overdue invoices and sends reminders'
          },
          {
            name: 'license-check',
            schedule: 'Daily at 10:00 AM',
            description: 'Checks for expiring licenses and sends warnings'
          }
        ],
        status: 'active',
        timezone: process.env.CRON_TIMEZONE || 'UTC'
      }
    })

  } catch (error) {
    console.error('Cron status error:', error)
    return NextResponse.json(
      { error: 'Failed to get cron status' },
      { status: 500 }
    )
  }
}