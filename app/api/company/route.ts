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
    
    // Get company data
    const company = await Company.findById(authResult.user.companyId)

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: company._id,
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email,
        website: company.website,
        logo: company.logo,
        businessType: company.businessType,
        region: company.region,
        licensePlan: company.licensePlan,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    })
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: "Failed to fetch company data" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const { name, address, phone, email, website } = body
    
    // Update company data
    const company = await Company.findByIdAndUpdate(
      authResult.user.companyId,
      {
        name,
        address,
        phone,
        email,
        website,
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
      message: "Company updated successfully"
    })
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    )
  }
}
