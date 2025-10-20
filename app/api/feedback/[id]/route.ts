import { NextRequest, NextResponse } from 'next/server'
import { Feedback } from '@/lib/models/Feedback'
import { connectDB } from '@/lib/db'
import { authenticateToken } from '@/lib/middleware/auth'
import { authorizeRole } from '@/lib/middleware/rbac'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id } = await params

    const feedback = await Feedback.findOne({
      _id: id,
      companyId: authResult.user.companyId
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('resolvedBy', 'name email')

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: feedback
    })
  } catch (error) {
    console.error('Get feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Check permissions
    const roleResult = await authorizeRole(authResult.user, ['admin', 'manager', 'sales'])
    if (!roleResult.success) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const feedback = await Feedback.findOne({
      _id: id,
      companyId: authResult.user.companyId
    })

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    // Update fields
    const {
      status,
      priority,
      assignedTo,
      resolution,
      rating
    } = body

    if (status) {
      feedback.status = status
      if (status === 'resolved' || status === 'closed') {
        feedback.resolvedBy = authResult.user.id
        feedback.resolvedAt = new Date()
      }
    }
    if (priority) feedback.priority = priority
    if (assignedTo !== undefined) feedback.assignedTo = assignedTo
    if (resolution !== undefined) feedback.resolution = resolution
    if (rating !== undefined) feedback.rating = rating

    await feedback.save()

    // Populate the response
    await feedback.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'resolvedBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: feedback,
      message: 'Feedback updated successfully'
    })
  } catch (error) {
    console.error('Update feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Only admin can delete feedback
    const roleResult = await authorizeRole(authResult.user, ['admin'])
    if (!roleResult.success) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params

    const feedback = await Feedback.findOneAndDelete({
      _id: id,
      companyId: authResult.user.companyId
    })

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully'
    })
  } catch (error) {
    console.error('Delete feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    )
  }
}
