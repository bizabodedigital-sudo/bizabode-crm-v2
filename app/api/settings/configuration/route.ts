import { NextRequest, NextResponse } from "next/server"
import { authenticateToken } from "@/lib/middleware/auth"
import { connectDB } from "@/lib/db"
import Company from "@/lib/models/Company"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }
    
    // Get company configuration
    const company = await Company.findById(authResult.user.companyId)

    return NextResponse.json({
      success: true,
      configuration: {
        businessType: company?.businessType || 'retail',
        region: company?.region || 'usa',
        modules: company?.modules || {},
        features: company?.features || {},
        customizations: company?.customizations || {}
      }
    })
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
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

    const body = await request.json()
    const { businessType, region, modules, features, customizations } = body
    
    // Update company configuration
    const company = await Company.findByIdAndUpdate(
      authResult.user.companyId,
      {
        businessType,
        region,
        modules,
        features,
        customizations,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Configuration updated successfully"
    })
  } catch (error) {
    console.error('Error updating configuration:', error)
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    )
  }
}
