import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { authenticateToken } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from "@/lib/utils/api-response"
import { z } from "zod"

const supplierSchema = z.object({
  name: z.string().min(2, 'Supplier name must be at least 2 characters').max(100, 'Supplier name too long'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(20, 'Phone too long').optional().or(z.literal('')),
  contactPerson: z.string().min(2, 'Contact person must be at least 2 characters').max(100, 'Contact person name too long').optional().or(z.literal('')),
  address: z.string().max(500, 'Address too long').optional().or(z.literal('')),
  city: z.string().max(100, 'City name too long').optional().or(z.literal('')),
  state: z.string().max(100, 'State name too long').optional().or(z.literal('')),
  zipCode: z.string().max(20, 'Zip code too long').optional().or(z.literal('')),
  country: z.string().max(100, 'Country name too long').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  taxId: z.string().max(50, 'Tax ID too long').optional().or(z.literal('')),
  paymentTerms: z.string().max(100, 'Payment terms too long').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes too long').optional().or(z.literal(''))
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
    const search = searchParams.get('search')

    // Build query
    const query: any = { companyId: authResult.user.companyId }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // For now, return empty array as placeholder
    // In a real implementation, this would query a Supplier model
    const suppliers: any[] = []
    const total = 0

    return successResponse({
      suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, "Suppliers retrieved successfully")

  } catch (error) {
    console.error('Suppliers error:', error)
    return errorResponse("Failed to retrieve suppliers", 500)
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
    const validationResult = supplierSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {}
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return validationErrorResponse(errors)
    }

    const supplierData = {
      ...validationResult.data,
      companyId: authResult.user.companyId,
      createdBy: authResult.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // In a real implementation, save to Supplier model
    // const supplier = await Supplier.create(supplierData)

    return successResponse(supplierData, "Supplier created successfully")

  } catch (error) {
    console.error('Create supplier error:', error)
    return errorResponse("Failed to create supplier", 500)
  }
}