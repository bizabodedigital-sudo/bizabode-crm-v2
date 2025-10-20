import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import PerformanceReview from '@/lib/models/PerformanceReview'
import { authenticateToken } from '@/lib/middleware/auth'
import { validateRequest } from '@/lib/middleware/hr-validation'
import { performanceValidation } from '@/lib/middleware/hr-validation'
import { asyncHandler, hrErrorHandler } from '@/lib/middleware/hr-error-handler'

export async function GET(request: NextRequest) {
  return asyncHandler(async (req: NextRequest) => {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const reviewType = searchParams.get('reviewType')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    // Build query
    const query: any = { companyId: authResult.user.companyId }
    
    if (employeeId) query.employeeId = employeeId
    if (reviewType) query.reviewType = reviewType
    if (status) query.status = status

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build sort object
    const sortObj: any = {}
    sortObj[sort] = order === 'asc' ? 1 : -1

    const [reviews, total] = await Promise.all([
      PerformanceReview.find(query)
        .populate('employeeId', 'firstName lastName employeeId position department')
        .populate('reviewedBy', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      PerformanceReview.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  })(request)
}

export async function POST(request: NextRequest) {
  return asyncHandler(async (req: NextRequest) => {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Check if user has HR permissions
    if (!['admin', 'manager'].includes(authResult.user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate request body
    const { error } = performanceValidation.create.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      }, { status: 400 })
    }

    // Check if review already exists for this period
    const existingReview = await PerformanceReview.findOne({
      companyId: authResult.user.companyId,
      employeeId: body.employeeId,
      'reviewPeriod.startDate': new Date(body.reviewPeriod.startDate),
      'reviewPeriod.endDate': new Date(body.reviewPeriod.endDate)
    })

    if (existingReview) {
      return NextResponse.json({
        success: false,
        error: 'Performance review already exists for this period'
      }, { status: 409 })
    }

    // Create performance review
    const review = new PerformanceReview({
      ...body,
      companyId: authResult.user.companyId,
      reviewedBy: authResult.user.id,
      reviewPeriod: {
        startDate: new Date(body.reviewPeriod.startDate),
        endDate: new Date(body.reviewPeriod.endDate)
      }
    })

    await review.save()

    // Populate the response
    await review.populate([
      { path: 'employeeId', select: 'firstName lastName employeeId position department' },
      { path: 'reviewedBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Performance review created successfully'
    }, { status: 201 })
  })(request)
}
