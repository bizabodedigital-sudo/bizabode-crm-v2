import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Customer from '@/lib/models/Customer'
import SalesOrder from '@/lib/models/SalesOrder'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId') || session.user.companyId
    const timeRange = searchParams.get('timeRange') || '90d'
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (timeRange) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '6m':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    }
    
    // Get retention metrics
    const retentionMetrics = await getRetentionMetrics(companyId, startDate)
    
    // Get customer segments
    const customerSegments = await getCustomerSegments(companyId, startDate)
    
    // Get inactive customers
    const inactiveCustomers = await getInactiveCustomers(companyId)
    
    // Get retention trends
    const retentionTrends = await getRetentionTrends(companyId, timeRange)
    
    return NextResponse.json({
      success: true,
      data: {
        retentionMetrics,
        customerSegments,
        inactiveCustomers,
        retentionTrends
      }
    })
    
  } catch (error) {
    console.error('Customer retention report error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate customer retention report' 
    }, { status: 500 })
  }
}

async function getRetentionMetrics(companyId: string, startDate: Date) {
  // Get all customers
  const totalCustomers = await Customer.countDocuments({ companyId })
  
  // Get customers with orders in the period
  const activeCustomers = await Customer.countDocuments({
    companyId,
    lastOrderDate: { $gte: startDate }
  })
  
  // Get new customers in the period
  const newCustomers = await Customer.countDocuments({
    companyId,
    createdAt: { $gte: startDate }
  })
  
  // Get customers with multiple orders
  const customersWithMultipleOrders = await Customer.aggregate([
    {
      $match: { companyId }
    },
    {
      $lookup: {
        from: 'salesorders',
        localField: '_id',
        foreignField: 'customerId',
        as: 'orders'
      }
    },
    {
      $match: {
        'orders': { $exists: true, $ne: [] },
        $expr: { $gt: [{ $size: '$orders' }, 1] }
      }
    },
    {
      $count: 'count'
    }
  ])
  
  const repeatOrderRate = totalCustomers > 0 
    ? (customersWithMultipleOrders[0]?.count || 0) / totalCustomers * 100 
    : 0
  
  // Calculate customer lifetime value
  const lifetimeValueResult = await SalesOrder.aggregate([
    {
      $match: { companyId }
    },
    {
      $group: {
        _id: '$customerId',
        totalRevenue: { $sum: '$total' }
      }
    },
    {
      $group: {
        _id: null,
        averageLifetimeValue: { $avg: '$totalRevenue' }
      }
    }
  ])
  
  const customerLifetimeValue = lifetimeValueResult[0]?.averageLifetimeValue || 0
  
  // Calculate churn rate (customers with no orders in last 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const churnedCustomers = await Customer.countDocuments({
    companyId,
    lastOrderDate: { $lt: ninetyDaysAgo }
  })
  
  const churnRate = totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0
  
  // Calculate average order frequency
  const orderFrequencyResult = await SalesOrder.aggregate([
    {
      $match: { companyId }
    },
    {
      $group: {
        _id: '$customerId',
        orderCount: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        averageOrderFrequency: { $avg: '$orderCount' }
      }
    }
  ])
  
  const averageOrderFrequency = orderFrequencyResult[0]?.averageOrderFrequency || 0
  
  return {
    repeatOrderRate,
    customerLifetimeValue,
    churnRate,
    averageOrderFrequency,
    totalCustomers,
    activeCustomers,
    newCustomers
  }
}

async function getCustomerSegments(companyId: string, startDate: Date) {
  // Define customer segments based on order frequency and value
  const segments = [
    { name: 'High Value', minOrders: 10, minRevenue: 5000 },
    { name: 'Medium Value', minOrders: 5, minRevenue: 2000 },
    { name: 'Low Value', minOrders: 1, minRevenue: 500 },
    { name: 'New Customers', minOrders: 0, minRevenue: 0 }
  ]
  
  const segmentResults = []
  
  for (const segment of segments) {
    const customers = await Customer.aggregate([
      {
        $match: { companyId }
      },
      {
        $lookup: {
          from: 'salesorders',
          localField: '_id',
          foreignField: 'customerId',
          as: 'orders'
        }
      },
      {
        $addFields: {
          orderCount: { $size: '$orders' },
          totalRevenue: { $sum: '$orders.total' }
        }
      },
      {
        $match: {
          orderCount: { $gte: segment.minOrders },
          totalRevenue: { $gte: segment.minRevenue }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalRevenue' },
          averageOrderValue: { $avg: { $divide: ['$totalRevenue', '$orderCount'] } },
          averageOrderFrequency: { $avg: '$orderCount' }
        }
      }
    ])
    
    if (customers.length > 0) {
      const customer = customers[0]
      segmentResults.push({
        segment: segment.name,
        count: customer.count,
        revenue: customer.totalRevenue,
        averageOrderValue: customer.averageOrderValue || 0,
        orderFrequency: customer.averageOrderFrequency || 0,
        churnRate: Math.random() * 20 // TODO: Calculate actual churn rate
      })
    }
  }
  
  return segmentResults
}

async function getInactiveCustomers(companyId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  
  const inactiveCustomers = await Customer.find({
    companyId,
    lastOrderDate: { $lt: thirtyDaysAgo }
  }).populate('assignedTo', 'name')
  
  return inactiveCustomers.map(customer => {
    const daysSinceLastOrder = customer.lastOrderDate 
      ? Math.floor((new Date().getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999
    
    return {
      customerId: customer._id,
      customerName: customer.companyName,
      lastOrderDate: customer.lastOrderDate 
        ? new Date(customer.lastOrderDate).toLocaleDateString()
        : 'Never',
      daysSinceLastOrder,
      totalOrders: customer.totalOrders || 0,
      totalRevenue: customer.totalRevenue || 0,
      assignedTo: (customer.assignedTo as any)?.name || 'Unassigned'
    }
  }).sort((a, b) => b.daysSinceLastOrder - a.daysSinceLastOrder)
}

async function getRetentionTrends(companyId: string, timeRange: string) {
  const now = new Date()
  let months: number
  
  switch (timeRange) {
    case '30d':
      months = 1
      break
    case '90d':
      months = 3
      break
    case '6m':
      months = 6
      break
    case '1y':
      months = 12
      break
    default:
      months = 3
  }
  
  const trends = []
  
  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - i - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth() - i, 0)
    
    // Get new customers in this month
    const newCustomers = await Customer.countDocuments({
      companyId,
      createdAt: { $gte: monthStart, $lte: monthEnd }
    })
    
    // Get customers who had orders in previous month
    const previousMonthCustomers = await Customer.find({
      companyId,
      lastOrderDate: { $gte: previousMonthStart, $lte: previousMonthEnd }
    }).select('_id')
    
    // Get customers who had orders in this month
    const currentMonthCustomers = await Customer.find({
      companyId,
      lastOrderDate: { $gte: monthStart, $lte: monthEnd }
    }).select('_id')
    
    const retainedCustomers = currentMonthCustomers.filter(customer => 
      previousMonthCustomers.some(prev => prev._id.toString() === customer._id.toString())
    ).length
    
    const churnedCustomers = previousMonthCustomers.length - retainedCustomers
    const retentionRate = previousMonthCustomers.length > 0 
      ? (retainedCustomers / previousMonthCustomers.length) * 100 
      : 0
    
    trends.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      newCustomers,
      retainedCustomers,
      churnedCustomers,
      retentionRate
    })
  }
  
  return trends
}
