import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CommunicationTemplate from '@/lib/models/CommunicationTemplate'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const isActive = searchParams.get('isActive')
    const language = searchParams.get('language')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Build query
    const query: any = { companyId }
    
    if (type) query.type = type
    if (category) query.category = category
    if (status) query.status = status
    if (isActive !== null) query.isActive = isActive === 'true'
    if (language) query.language = language
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }

    // Get templates with pagination
    const templates = await CommunicationTemplate.find(query)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await CommunicationTemplate.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get communication templates error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communication templates' },
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
      name,
      description,
      type,
      category,
      subject,
      content,
      variables,
      isActive,
      isDefault,
      createdBy,
      status,
      tags,
      attachments,
      language,
      parentTemplateId,
      isPublic
    } = body

    // Validate required fields
    if (!companyId || !name || !description || !type || !category || !content || !createdBy) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyId, name, description, type, category, content, createdBy' 
      }, { status: 400 })
    }

    // Create template
    const template = new CommunicationTemplate({
      companyId,
      name,
      description,
      type,
      category,
      subject,
      content,
      variables: variables || [],
      isActive: isActive !== false,
      isDefault: isDefault || false,
      usageCount: 0,
      createdBy,
      status: status || 'Draft',
      tags: tags || [],
      attachments: attachments || [],
      language: language || 'en',
      version: 1,
      parentTemplateId,
      isPublic: isPublic || false
    })

    await template.save()

    // Populate the response
    await template.populate([
      { path: 'createdBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Communication template created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create communication template error:', error)
    return NextResponse.json(
      { error: 'Failed to create communication template' },
      { status: 500 }
    )
  }
}
