import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import Invoice from '@/lib/models/Invoice'
import Company from '@/lib/models/Company'
import { emailSender } from '@/lib/utils/email-sender'
import { PDFGenerator } from '@/lib/utils/pdf-generator'
import getStream from 'get-stream'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const resolvedParams = await params
    const { recipientEmail } = await request.json()

    const invoice = await Invoice.findOne({
      _id: resolvedParams.id,
      companyId: authResult.user.companyId
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const company = await Company.findById(authResult.user.companyId)
    
    // Generate PDF
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber || `INV-${invoice._id.toString().slice(-8)}`,
      invoiceDate: invoice.createdAt.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerAddress: invoice.customerAddress,
      items: invoice.items,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate || 0,
      tax: invoice.tax || 0,
      discount: invoice.discount || 0,
      total: invoice.total,
      notes: invoice.notes,
      hasTax: invoice.tax > 0
    }

    const companyInfo = {
      name: company?.name || 'My Company',
      logo: company?.logo,
      address: company?.address,
      phone: company?.phone,
      email: company?.email,
      website: company?.website
    }

    // Generate PDF using streaming method and convert to buffer
    const pdfStream = PDFGenerator.generateInvoicePDFStream(invoiceData, companyInfo)
    const pdfBuffer = await getStream(pdfStream)

    // Send email
    const emailHTML = emailSender.generateInvoiceEmailHTML(
      invoiceData.invoiceNumber,
      invoice.customerName,
      invoice.total,
      companyInfo.name
    )

    const result = await emailSender.sendEmail({
      to: recipientEmail || invoice.customerEmail,
      subject: `Invoice #${invoiceData.invoiceNumber} from ${companyInfo.name}`,
      html: emailHTML,
      attachments: [{
        filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
        content: typeof pdfBuffer === 'string' 
          ? Buffer.from(pdfBuffer, 'base64') 
          : pdfBuffer,
      }]
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice emailed successfully'
    })

  } catch (error) {
    console.error('Email invoice error:', error)
    return NextResponse.json(
      { error: 'Failed to email invoice' },
      { status: 500 }
    )
  }
}
