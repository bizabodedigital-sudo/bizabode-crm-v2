import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Invoice from '@/lib/models/Invoice'
import SalesOrder from '@/lib/models/SalesOrder'
import Customer from '@/lib/models/Customer'
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
    const timeRange = searchParams.get('timeRange') || '30d'
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    
    // Get payment summary
    const paymentSummary = await getPaymentSummary(companyId, startDate)
    
    // Get overdue accounts
    const overdueAccounts = await getOverdueAccounts(companyId)
    
    // Get revenue by category
    const revenueByCategory = await getRevenueByCategory(companyId, startDate)
    
    // Get payment trends
    const paymentTrends = await getPaymentTrends(companyId, timeRange)
    
    return NextResponse.json({
      success: true,
      data: {
        paymentSummary,
        overdueAccounts,
        revenueByCategory,
        paymentTrends
      }
    })
    
  } catch (error) {
    console.error('Financial tracking report error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to generate financial tracking report' 
    }, { status: 500 })
  }
}

async function getPaymentSummary(companyId: string, startDate: Date) {
  // Get all invoices for the period
  const invoices = await Invoice.find({
    companyId,
    createdAt: { $gte: startDate }
  })
  
  const totalPending = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.total, 0)
  
  const totalOverdue = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0)
  
  const totalCollected = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)
  
  const totalAmount = totalPending + totalOverdue + totalCollected
  const collectionRate = totalAmount > 0 ? (totalCollected / totalAmount) * 100 : 0
  
  // Calculate average days to pay
  const paidInvoices = invoices.filter(inv => inv.status === 'paid' && inv.paidAt)
  const averageDaysToPay = paidInvoices.length > 0 
    ? paidInvoices.reduce((sum, inv) => {
        const daysToPay = Math.floor((new Date(inv.paidAt!).getTime() - new Date(inv.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        return sum + daysToPay
      }, 0) / paidInvoices.length
    : 0
  
  return {
    totalPending,
    totalOverdue,
    totalCollected,
    collectionRate,
    averageDaysToPay
  }
}

async function getOverdueAccounts(companyId: string) {
  const overdueInvoices = await Invoice.find({
    companyId,
    status: 'overdue'
  }).populate('customerId', 'companyName contactPerson')
  
  const overdueAccounts = overdueInvoices.map(invoice => {
    const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      customerId: invoice.customerId._id,
      customerName: (invoice.customerId as any).companyName || 'Unknown',
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.total,
      daysOverdue,
      lastContact: 'N/A', // TODO: Get from activity logs
      assignedTo: 'N/A' // TODO: Get from customer assignment
    }
  })
  
  return overdueAccounts.sort((a, b) => b.daysOverdue - a.daysOverdue)
}

async function getRevenueByCategory(companyId: string, startDate: Date) {
  // Get sales orders with customer category
  const salesOrders = await SalesOrder.find({
    companyId,
    createdAt: { $gte: startDate },
    status: { $in: ['Processing', 'Dispatched', 'Delivered'] }
  }).populate('customerId', 'category')
  
  // Group by category
  const categoryMap = new Map()
  
  salesOrders.forEach(order => {
    const category = (order.customerId as any)?.category || 'Other'
    const revenue = order.total
    
    if (categoryMap.has(category)) {
      categoryMap.set(category, categoryMap.get(category) + revenue)
    } else {
      categoryMap.set(category, revenue)
    }
  })
  
  const totalRevenue = Array.from(categoryMap.values()).reduce((sum, revenue) => sum + revenue, 0)
  
  const revenueByCategory = Array.from(categoryMap.entries()).map(([category, revenue]) => ({
    category,
    revenue,
    percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    growth: Math.random() * 20 - 10 // TODO: Calculate actual growth
  }))
  
  return revenueByCategory.sort((a, b) => b.revenue - a.revenue)
}

async function getPaymentTrends(companyId: string, timeRange: string) {
  const now = new Date()
  let months: number
  
  switch (timeRange) {
    case '7d':
      months = 1
      break
    case '30d':
      months = 3
      break
    case '90d':
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
    
    const invoices = await Invoice.find({
      companyId,
      createdAt: { $gte: monthStart, $lte: monthEnd }
    })
    
    const collected = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0)
    
    const pending = invoices
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.total, 0)
    
    const overdue = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0)
    
    trends.push({
      month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      collected,
      pending,
      overdue
    })
  }
  
  return trends
}
