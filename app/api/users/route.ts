import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'
import Employee from '@/lib/models/Employee'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Only admins can manage users
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const users = await User.find({ companyId: authResult.user.companyId })
      .select('-password')
      .populate({
        path: 'employeeId',
        select: 'employeeId firstName lastName position department',
        strictPopulate: false
      })
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: users
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
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

    // Only admins can create users
    if (authResult.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const {
      email,
      password,
      name,
      role,
      employeeId,
      permissions,
      isActive
    } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json({ 
        error: 'Email, password, name, and role are required' 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ 
        error: 'Email already exists' 
      }, { status: 400 })
    }

    // If employeeId is provided, verify it exists and isn't already linked
    if (employeeId) {
      const employee = await Employee.findById(employeeId)
      if (!employee) {
        return NextResponse.json({ 
          error: 'Employee not found' 
        }, { status: 404 })
      }

      const existingUserWithEmployee = await User.findOne({ employeeId })
      if (existingUserWithEmployee) {
        return NextResponse.json({ 
          error: 'This employee already has a user account' 
        }, { status: 400 })
      }
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      name,
      role,
      companyId: authResult.user.companyId,
      employeeId: employeeId || undefined,
      permissions: permissions || {},
      isActive: isActive !== undefined ? isActive : true,
    })

    await user.save()

    // Populate the response
    await user.populate({
      path: 'employeeId',
      select: 'employeeId firstName lastName position department',
      strictPopulate: false
    })

    // Return user without password
    const userResponse = user.toObject()
    delete userResponse.password

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
