import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'invoice', 'delivery', 'quote', etc.
    const entityId = formData.get('entityId') as string // ID of the related entity

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!type || !entityId) {
      return NextResponse.json({ error: 'Type and entityId are required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not allowed. Only images, PDFs, and text files are accepted.' 
      }, { status: 400 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    // Create directory structure: uploads/companies/{companyId}/{type}/{entityId}/
    const uploadDir = join(
      process.cwd(),
      'uploads',
      'companies',
      authResult.user.companyId,
      type,
      entityId
    )

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = join(uploadDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return file info
    const fileInfo = {
      id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      originalName: file.name,
      fileName: fileName,
      filePath: filePath,
      url: `/api/files/serve/${authResult.user.companyId}/${type}/${entityId}/${fileName}`,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: authResult.user.id
    }

    return NextResponse.json({
      success: true,
      data: fileInfo,
      message: 'File uploaded successfully'
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
