import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { authenticateToken } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/api-response"
import { z } from "zod"

const supportTicketSchema = z.object({
  customer: z.string().min(2, 'Customer name must be at least 2 characters').max(100, 'Customer name too long'),
  email: z.string().email('Invalid email format'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().max(50, 'Category too long').optional()
})

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Authenticate user
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error || "Authentication required")
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    // Build query
    const query: any = { companyId: authResult.user.companyId }
    
    if (status) {
      query.status = status
    }
    
    if (priority) {
      query.priority = priority
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch support tickets
    const [tickets, total] = await Promise.all([
      // This would be a SupportTicket model in a real implementation
      // For now, return empty array as placeholder
      [],
      0
    ])

    return successResponse({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, "Support tickets retrieved successfully")

  } catch (error) {
    console.error('Support tickets error:', error)
    return errorResponse("Failed to retrieve support tickets", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Authenticate user
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error || "Authentication required")
    }

    // Validate request body
    const body = await request.json()
    const validationResult = supportTicketSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {}
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return NextResponse.json({
        success: false,
        errors
      }, { status: 400 })
    }

    const ticketData = {
      ...validationResult.data,
      companyId: authResult.user.companyId,
      createdBy: authResult.user._id,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // In a real implementation, save to SupportTicket model
    // const ticket = await SupportTicket.create(ticketData)

    return successResponse(ticketData, "Support ticket created successfully")

  } catch (error) {
    console.error('Create support ticket error:', error)
    return errorResponse("Failed to create support ticket", 500)
  }
}
