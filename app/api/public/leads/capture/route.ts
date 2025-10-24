import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lead from '@/lib/models/Lead'
import Company from '@/lib/models/Company'
import User from '@/lib/models/User'
import { z } from 'zod'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5 // 5 requests per window per IP

// Validation schema for lead capture
const leadCaptureSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone is required').max(20),
  company: z.string().min(1, 'Company is required').max(100),
  category: z.enum(['Hotel', 'Supermarket', 'Restaurant', 'Contractor', 'Other']).optional(),
  productInterest: z.string().optional(),
  message: z.string().max(500).optional(),
  source: z.string().default('Website Form'),
  // Optional fields for auto-assignment
  territory: z.string().optional(),
  companyId: z.string().optional(), // For specific company targeting
})

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const key = `rate_limit:${ip}`
  
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }
  
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }
  
  current.count++
  return true
}

// Auto-assignment logic
async function assignLeadToUser(leadData: any, companyId: string): Promise<string | null> {
  try {
    // If territory is specified, find user by territory
    if (leadData.territory) {
      const userByTerritory = await User.findOne({
        companyId,
        role: { $in: ['sales', 'manager'] },
        // Assuming users have a territory field
        $or: [
          { territory: leadData.territory },
          { 'profile.territory': leadData.territory }
        ]
      })
      
      if (userByTerritory) {
        return userByTerritory._id
      }
    }
    
    // If category is specified, find user by category preference
    if (leadData.category) {
      const userByCategory = await User.findOne({
        companyId,
        role: { $in: ['sales', 'manager'] },
        // Assuming users have a preferredCategory field
        $or: [
          { preferredCategory: leadData.category },
          { 'profile.preferredCategory': leadData.category }
        ]
      })
      
      if (userByCategory) {
        return userByCategory._id
      }
    }
    
    // Find any available sales user
    const availableUser = await User.findOne({
      companyId,
      role: { $in: ['sales', 'manager'] },
      status: 'active'
    })
    
    return availableUser?._id || null
  } catch (error) {
    console.error('Error in auto-assignment:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: RATE_LIMIT_WINDOW / 1000
      }, { status: 429 })
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validation = leadCaptureSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid data provided',
        details: validation.error.errors
      }, { status: 400 })
    }
    
    const leadData = validation.data
    
    await connectDB()
    
    // Determine company ID
    let companyId: string
    
    if (leadData.companyId) {
      // Specific company targeting
      const company = await Company.findById(leadData.companyId)
      if (!company) {
        return NextResponse.json({
          success: false,
          error: 'Invalid company ID'
        }, { status: 400 })
      }
      companyId = leadData.companyId
    } else {
      // Auto-assign to default company or first available company
      const defaultCompany = await Company.findOne({ 
        licensePlan: { $ne: 'trial' },
        licenseExpiry: { $gt: new Date() }
      })
      
      if (!defaultCompany) {
        return NextResponse.json({
          success: false,
          error: 'No available companies to process leads'
        }, { status: 503 })
      }
      
      companyId = defaultCompany._id
    }
    
    // Check for duplicate leads (same email and company)
    const existingLead = await Lead.findOne({
      email: leadData.email,
      companyId: companyId
    })
    
    if (existingLead) {
      return NextResponse.json({
        success: false,
        error: 'A lead with this email already exists',
        leadId: existingLead._id
      }, { status: 409 })
    }
    
    // Auto-assign lead to user
    const assignedUserId = await assignLeadToUser(leadData, companyId)
    
    // Create lead
    const lead = new Lead({
      companyId: companyId,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      source: leadData.source,
      status: 'new',
      notes: leadData.message || '',
      assignedTo: assignedUserId,
      category: leadData.category,
      productInterest: leadData.productInterest ? [leadData.productInterest] : [],
      territory: leadData.territory,
      leadScore: 25, // Default score for website leads
      customerType: 'Commercial' // Default for website leads
    })
    
    await lead.save()
    
    // Create activity log
    const Activity = (await import('@/lib/models/Activity')).default
    await Activity.create({
      companyId: companyId,
      type: 'Note',
      subject: 'New Lead Captured',
      description: `New lead captured from ${leadData.source}: ${leadData.name} (${leadData.email}) from ${leadData.company}`,
      assignedTo: assignedUserId || undefined,
      status: 'Completed',
      completedDate: new Date(),
      leadId: lead._id
    })
    
    // Send notification to assigned user if available
    if (assignedUserId) {
      try {
        const { NotificationService } = await import('@/lib/services/notification-service')
        await NotificationService.sendNotification({
          userId: assignedUserId,
          title: 'New Lead Assigned',
          message: `New lead: ${leadData.name} from ${leadData.company}`,
          type: 'new_lead',
          data: {
            leadId: lead._id,
            leadName: leadData.name,
            leadCompany: leadData.company,
            source: leadData.source
          }
        })
      } catch (error) {
        console.error('Failed to send lead notification:', error)
      }
    }
    
    // Log the capture for analytics
    console.log(`Lead captured: ${leadData.name} (${leadData.email}) from ${leadData.company} via ${leadData.source}`)
    
    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: lead._id,
      assignedTo: assignedUserId
    }, { status: 201 })
    
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Lead capture API is healthy',
    timestamp: new Date().toISOString()
  })
}
