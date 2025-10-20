import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Opportunity from "@/lib/models/Opportunity"
import { authenticateToken } from "@/lib/middleware/auth"
import { checkPermission } from "@/lib/middleware/rbac"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "opportunities", "read")) {
      return forbiddenResponse("You don't have permission to view opportunities")
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const stage = searchParams.get("stage") || ""

    const query: any = { companyId: authResult.user.companyId }

    if (stage) {
      query.stage = stage
    }

    const skip = (page - 1) * limit

    const [opportunities, total] = await Promise.all([
      Opportunity.find(query)
        .sort({ expectedCloseDate: 1 })
        .skip(skip)
        .limit(limit)
        .populate("assignedTo", "name email")
        .populate("leadId", "name email company")
        .lean(),
      Opportunity.countDocuments(query),
    ])

    return successResponse({
      opportunities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Get opportunities error:", error)
    return errorResponse(error.message || "Failed to get opportunities", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "opportunities", "create")) {
      return forbiddenResponse("You don't have permission to create opportunities")
    }

    await connectDB()

    const body = await request.json()

    const opportunity = await Opportunity.create({
      ...body,
      companyId: authResult.user.companyId,
    })

    return successResponse(opportunity, "Opportunity created successfully", 201)
  } catch (error: any) {
    console.error("Create opportunity error:", error)
    return errorResponse(error.message || "Failed to create opportunity", 500)
  }
}

