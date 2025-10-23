import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Document from '@/lib/models/Document'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const category = searchParams.get('category')
    const relatedTo = searchParams.get('relatedTo')
    const relatedId = searchParams.get('relatedId')
    const accessLevel = searchParams.get('accessLevel')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Build query
    const query: any = { companyId }
    
    if (category) query.category = category
    if (relatedTo) query.relatedTo = relatedTo
    if (relatedId) query.relatedId = relatedId
    if (accessLevel) query.accessLevel = accessLevel
    if (isActive !== null) query.isActive = isActive === 'true'

    // Get documents with pagination
    const documents = await Document.find(query)
      .populate('uploadedBy', 'name email')
      .populate('relatedId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Document.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      companyId,
      fileName,
      originalName,
      filePath,
      fileSize,
      mimeType,
      category,
      relatedTo,
      relatedId,
      uploadedBy,
      description,
      tags,
      isPublic,
      accessLevel,
      version,
      parentDocumentId,
      expiresAt
    } = body

    // Validate required fields
    if (!companyId || !fileName || !originalName || !filePath || !fileSize || !mimeType || !category || !relatedTo || !uploadedBy) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyId, fileName, originalName, filePath, fileSize, mimeType, category, relatedTo, uploadedBy' 
      }, { status: 400 })
    }

    // Create document
    const document = new Document({
      companyId,
      fileName,
      originalName,
      filePath,
      fileSize,
      mimeType,
      category,
      relatedTo,
      relatedId,
      uploadedBy,
      description,
      tags,
      isPublic: isPublic || false,
      accessLevel: accessLevel || 'Internal',
      version: version || 1,
      parentDocumentId,
      isActive: true,
      downloadCount: 0,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    })

    await document.save()

    // Populate the response
    await document.populate([
      { path: 'uploadedBy', select: 'name email' },
      { path: 'relatedId' }
    ])

    return NextResponse.json({
      success: true,
      data: document,
      message: 'Document created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create document error:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}
