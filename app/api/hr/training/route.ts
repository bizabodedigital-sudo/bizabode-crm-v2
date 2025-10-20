import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Training, EmployeeTraining } from '@/lib/models/Training'
import { authenticateToken } from '@/lib/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const isRequired = searchParams.get('isRequired')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
    const query: any = { companyId: authResult.user.companyId }
    
    if (category) query.category = category
    if (type) query.type = type
    if (isRequired !== null) query.isRequired = isRequired === 'true'
    if (isActive !== null) query.isActive = isActive === 'true'

    // Calculate pagination
    const skip = (page - 1) * limit

    const [trainings, total] = await Promise.all([
      Training.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Training.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: trainings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get trainings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const {
      title,
      description,
      category,
      type,
      duration,
      isRequired,
      targetRoles,
      targetDepartments,
      instructor,
      location,
      maxParticipants,
      cost,
      currency,
      prerequisites,
      learningObjectives,
      materials
    } = body

    // Validate required fields
    if (!title || !description || !category || !type || !duration) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Create training
    const training = new Training({
      companyId: authResult.user.companyId,
      title,
      description,
      category,
      type,
      duration,
      isRequired: isRequired || false,
      targetRoles: targetRoles || [],
      targetDepartments: targetDepartments || [],
      instructor,
      location,
      maxParticipants,
      cost,
      currency: currency || 'USD',
      prerequisites: prerequisites || [],
      learningObjectives: learningObjectives || [],
      materials: materials || [],
      createdBy: authResult.user.id
    })

    await training.save()

    // Populate the response
    await training.populate('createdBy', 'name email')

    return NextResponse.json({
      success: true,
      data: training,
      message: 'Training created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create training error:', error)
    return NextResponse.json(
      { error: 'Failed to create training' },
      { status: 500 }
    )
  }
}
