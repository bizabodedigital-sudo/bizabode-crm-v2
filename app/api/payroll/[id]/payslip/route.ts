import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import Payroll from '@/lib/models/Payroll'
import Employee from '@/lib/models/Employee'
import Company from '@/lib/models/Company'
import { generatePayslipPDF } from '@/lib/utils/pdf-generator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Await the params
    const { id } = await params

    // Get payroll record with employee and company data
    const payroll = await Payroll.findOne({
      _id: id,
      companyId: authResult.user.companyId
    })
      .populate('employeeId', 'firstName lastName email position department')
      .lean()

    if (!payroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }

    // Get company information
    const company = await Company.findById(authResult.user.companyId)

    console.log('Generating payslip PDF for payroll:', {
      id: payroll._id,
      employeeName: payroll.employeeId?.firstName + ' ' + payroll.employeeId?.lastName,
      companyName: company?.name,
      itemsCount: payroll.items?.length || 0
    })

    // Generate payslip PDF
    const pdfBuffer = await generatePayslipPDF(payroll, company)

    console.log('PDF generated successfully, size:', pdfBuffer.length)

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="payslip-${payroll.employeeId?.firstName || 'Unknown'}-${payroll.employeeId?.lastName || 'Employee'}-${payroll.payPeriod?.startDate || 'Unknown'}.pdf"`
      }
    })

  } catch (error) {
    console.error('Payslip generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate payslip' },
      { status: 500 }
    )
  }
}
