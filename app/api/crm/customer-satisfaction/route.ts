import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CustomerSatisfaction from '@/lib/models/CustomerSatisfaction'
import SalesOrder from '@/lib/models/SalesOrder'
import Task from '@/lib/models/Task'
import { NotificationService } from '@/lib/services/notification-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const {
      orderId,
      orderNumber,
      customerName,
      overallRating,
      deliveryRating,
      productQualityRating,
      customerServiceRating,
      wouldRecommend,
      feedback,
      improvements,
      contactPreference,
      submittedBy,
      submittedAt
    } = body
    
    // Validate required fields
    if (!orderId || !overallRating) {
      return NextResponse.json({ 
        error: 'Missing required fields: orderId, overallRating' 
      }, { status: 400 })
    }
    
    // Check if order exists
    const order = await SalesOrder.findById(orderId)
    if (!order) {
      return NextResponse.json({ 
        error: 'Order not found' 
      }, { status: 404 })
    }
    
    // Create satisfaction survey record
    const satisfaction = new CustomerSatisfaction({
      companyId: order.companyId,
      orderId,
      orderNumber,
      customerId: order.customerId,
      customerName,
      overallRating,
      deliveryRating: deliveryRating || 0,
      productQualityRating: productQualityRating || 0,
      customerServiceRating: customerServiceRating || 0,
      wouldRecommend,
      feedback: feedback || '',
      improvements: improvements || '',
      contactPreference,
      submittedBy,
      submittedAt: new Date(submittedAt)
    })
    
    await satisfaction.save()
    
    // Create follow-up task for low ratings
    if (overallRating <= 2) {
      const followUpTask = new Task({
        companyId: order.companyId,
        title: `Follow up on low satisfaction rating - Order ${orderNumber}`,
        description: `Customer ${customerName} rated their experience ${overallRating}/5. Review feedback and take appropriate action.`,
        type: 'Follow-up',
        relatedTo: 'Order',
        relatedId: orderId,
        assignedTo: order.assignedTo,
        createdBy: submittedBy,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24 hours
        priority: 'High',
        status: 'Pending',
        notes: `Low satisfaction rating: ${overallRating}/5. Feedback: ${feedback || 'No feedback provided'}`
      })
      
      await followUpTask.save()
      
      // Send notification to assigned sales rep
      if (order.assignedTo) {
        await NotificationService.sendNotification({
          userId: order.assignedTo,
          title: 'Low Customer Satisfaction Alert',
          message: `Customer ${customerName} rated order ${orderNumber} ${overallRating}/5. Follow-up task created.`,
          type: 'customer_high_risk',
          priority: 'High',
          data: {
            orderId,
            orderNumber,
            customerName,
            rating: overallRating,
            feedback
          },
          relatedOrderId: orderId,
          relatedTaskId: followUpTask._id,
          sendEmail: true
        })
      }
    }
    
    // Create follow-up task for improvement suggestions
    if (improvements && improvements.trim().length > 0) {
      const improvementTask = new Task({
        companyId: order.companyId,
        title: `Review improvement suggestion - Order ${orderNumber}`,
        description: `Customer ${customerName} provided improvement suggestions: ${improvements}`,
        type: 'Review',
        relatedTo: 'Order',
        relatedId: orderId,
        assignedTo: order.assignedTo,
        createdBy: submittedBy,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        priority: 'Medium',
        status: 'Pending',
        notes: `Improvement suggestion: ${improvements}`
      })
      
      await improvementTask.save()
    }
    
    // Update order with satisfaction rating
    order.customerSatisfactionRating = overallRating
    order.satisfactionSurveyCompleted = true
    await order.save()
    
    return NextResponse.json({
      success: true,
      data: satisfaction
    })
    
  } catch (error) {
    console.error('Customer satisfaction survey error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to submit satisfaction survey' 
    }, { status: 500 })
  }
}

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const orderId = searchParams.get('orderId')
    
    // Build query
    const query: any = { companyId }
    if (orderId) {
      query.orderId = orderId
    }
    
    // Get satisfaction surveys
    const surveys = await CustomerSatisfaction.find(query)
      .populate('orderId', 'orderNumber customerName')
      .populate('customerId', 'companyName contactPerson')
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    
    const total = await CustomerSatisfaction.countDocuments(query)
    
    return NextResponse.json({
      success: true,
      data: surveys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Get customer satisfaction surveys error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch satisfaction surveys' 
    }, { status: 500 })
  }
}