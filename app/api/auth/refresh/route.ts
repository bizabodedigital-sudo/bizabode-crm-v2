import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Company from '@/lib/models/Company'

const JWT_SECRET = process.env.JWT_SECRET || 'temporary-build-secret'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const authHeader = request.headers.get('authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify the current token (even if expired, we can still decode it)
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      // If token is expired, try to decode it anyway to get user info
      if (error instanceof jwt.TokenExpiredError) {
        decoded = jwt.decode(token)
      } else {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        )
      }
    }

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 401 }
      )
    }

    // Get company information
    const company = await Company.findById(user.companyId)
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 401 }
      )
    }

    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user._id.toString(),
        companyId: company._id.toString(),
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: company._id.toString(),
        },
        company: {
          id: company._id.toString(),
          name: company.name,
          licensePlan: company.licensePlan,
          licenseExpiry: company.licenseExpiry,
        }
      }
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    )
  }
}
