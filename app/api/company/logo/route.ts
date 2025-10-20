import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      return NextResponse.json({ 
        error: 'No file provided' 
      }, { status: 400 })
    }

    // Validate file type
    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'File must be an image' 
      }, { status: 400 })
    }

    // Read file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const filename = `logo-${authResult.user.companyId}-${Date.now()}${path.extname(file.name)}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)

    // Save file
    await writeFile(filepath, buffer)

    // Update company record using mongoose
    const Company = require('@/lib/models/Company').default
    await Company.findByIdAndUpdate(
      authResult.user.companyId,
      { 
        logo: `/uploads/${filename}`,
        updatedAt: new Date()
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        logo: `/uploads/${filename}`
      },
      message: 'Logo uploaded successfully'
    })

  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const Company = require('@/lib/models/Company').default
    await Company.findByIdAndUpdate(
      authResult.user.companyId,
      { 
        $unset: { logo: 1 },
        updatedAt: new Date()
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Logo removed successfully'
    })

  } catch (error) {
    console.error('Logo delete error:', error)
    return NextResponse.json(
      { error: 'Failed to remove logo' },
      { status: 500 }
    )
  }
}