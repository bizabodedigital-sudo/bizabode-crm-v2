import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Task from '@/lib/models/Task'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 })
    }

    const task = await Task.findOne({
      _id: params.id
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: task
    })

  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      assignedTo,
      dueDate,
      priority,
      status,
      notes,
      isRecurring,
      recurringPattern,
      recurringInterval,
      reminderDate,
      dependsOn,
      blocks
    } = body

    const updateData: any = {
      title,
      description,
      type,
      assignedTo,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      status,
      notes,
      isRecurring,
      recurringPattern,
      recurringInterval,
      reminderDate: reminderDate ? new Date(reminderDate) : undefined,
      dependsOn: dependsOn || [],
      blocks: blocks || []
    }

    // Update completion fields if status is completed
    if (status === 'Completed' && !updateData.completedDate) {
      updateData.completedDate = new Date()
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: params.id
      },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('completedBy', 'name email')

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    })

  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 })
    }

    const task = await Task.findOneAndDelete({
      _id: params.id
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })

  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}