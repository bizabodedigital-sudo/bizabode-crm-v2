import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TimeEntry, TimeSheet } from '@/lib/models/TimeTracking'
import { authenticateToken } from '@/lib/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const isBillable = searchParams.get('isBillable')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build query
    const query: any = { companyId: authResult.user.companyId }
    
    if (employeeId) query.employeeId = employeeId
    if (projectId) query.projectId = projectId
    if (status) query.status = status
    if (isBillable !== null) query.isBillable = isBillable === 'true'
    
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    const [entries, total] = await Promise.all([
      TimeEntry.find(query)
        .populate('employeeId', 'firstName lastName employeeId position')
        .populate('projectId', 'name')
        .populate('approvedBy', 'name email')
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit),
      TimeEntry.countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get time entries error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
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

    const body = await request.json()
    const {
      employeeId,
      projectId,
      projectName,
      task,
      description,
      startTime,
      endTime,
      isBillable,
      hourlyRate,
      tags,
      location,
      notes
    } = body

    // Validate required fields
    if (!employeeId || !task || !startTime) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Calculate duration if endTime is provided
    let duration = 0
    if (endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)) // duration in minutes
    }

    // Calculate total amount if hourly rate is provided
    let totalAmount = 0
    if (hourlyRate && duration > 0) {
      totalAmount = (hourlyRate * duration) / 60 // convert minutes to hours
    }

    // Create time entry
    const timeEntry = new TimeEntry({
      companyId: authResult.user.companyId,
      employeeId,
      projectId,
      projectName,
      task,
      description,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      duration,
      isBillable: isBillable || false,
      hourlyRate,
      totalAmount,
      tags: tags || [],
      location,
      notes
    })

    await timeEntry.save()

    // Populate the response
    await timeEntry.populate([
      { path: 'employeeId', select: 'firstName lastName employeeId position' },
      { path: 'projectId', select: 'name' }
    ])

    return NextResponse.json({
      success: true,
      data: timeEntry,
      message: 'Time entry created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create time entry error:', error)
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    )
  }
}
