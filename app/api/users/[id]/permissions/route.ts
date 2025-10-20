import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

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

    // Only admins can update permissions
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const resolvedParams = await params
    const { permissions } = await request.json()

    const user = await User.findOneAndUpdate(
      { _id: resolvedParams.id, companyId: authResult.user.companyId },
      { permissions },
      { new: true }
    ).select('-password').populate({
      path: 'employeeId',
      select: 'employeeId firstName lastName position department',
      strictPopulate: false
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Permissions updated successfully'
    })

  } catch (error) {
    console.error('Update permissions error:', error)
    return NextResponse.json(
      { error: 'Failed to update permissions' },
      { status: 500 }
    )
  }
}
