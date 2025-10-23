import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Task from '@/lib/models/Task'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const assignedTo = searchParams.get('assignedTo')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const type = searchParams.get('type')
    const relatedTo = searchParams.get('relatedTo')
    const relatedId = searchParams.get('relatedId')
    const overdue = searchParams.get('overdue')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Build query
    const query: any = { companyId }
    
    if (assignedTo) query.assignedTo = assignedTo
    if (status) query.status = status
    if (priority) query.priority = priority
    if (type) query.type = type
    if (relatedTo) query.relatedTo = relatedTo
    if (relatedId) query.relatedId = relatedId

    // Handle overdue filter
    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() }
      query.status = { $in: ['Pending', 'In Progress'] }
    }

    // Get tasks with pagination
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')
      .sort({ dueDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Task.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Get user session
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'system'
    
    const body = await request.json()
    const {
      companyId,
      title,
      description,
      type,
      relatedTo,
      relatedId,
      assignedTo,
      dueDate,
      priority,
      notes,
      isRecurring,
      recurringPattern,
      recurringInterval,
      reminderDate,
      dependsOn,
      blocks
    } = body

    // Validate required fields
    if (!companyId || !title || !description || !type || !assignedTo || !dueDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyId, title, description, type, assignedTo, dueDate' 
      }, { status: 400 })
    }

    // Create task
    const task = new Task({
      companyId,
      title,
      description,
      type,
      relatedTo,
      relatedId,
      assignedTo,
      createdBy: userId,
      dueDate: new Date(dueDate),
      priority: priority || 'Medium',
      status: 'Pending',
      notes,
      isRecurring: isRecurring || false,
      recurringPattern,
      recurringInterval,
      reminderDate: reminderDate ? new Date(reminderDate) : undefined,
      reminderSent: false,
      dependsOn: dependsOn || [],
      blocks: blocks || []
    })

    await task.save()

    // Populate the response
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}