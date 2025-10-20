import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import Quote from '@/lib/models/Quote'
import Company from '@/lib/models/Company'
import { PDFGenerator } from '@/lib/utils/pdf-generator'
import { sendPdfEmail } from '@/lib/utils/email-attachments'
import { emailSender } from '@/lib/utils/email-sender'
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

    const quote = await Quote.findOne({
      _id: resolvedParams.id,
      companyId: authResult.user.companyId
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const company = await Company.findById(authResult.user.companyId)
    
    // Generate PDF
    const quoteData = {
      quoteNumber: quote.quoteNumber || `QUO-${quote._id.toString().slice(-8)}`,
      quoteDate: quote.createdAt.toISOString(),
      validUntil: quote.validUntil.toISOString(),
      customerName: quote.customerName,
      customerEmail: quote.customerEmail,
      customerAddress: quote.customerAddress,
      items: quote.items,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate || 0,
      tax: quote.tax || 0,
      discount: quote.discount || 0,
      total: quote.total,
      notes: quote.notes,
      hasTax: quote.tax > 0
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
    const pdfStream = PDFGenerator.generateQuotePDFStream(quoteData, companyInfo)
    const pdfBuffer = await getStream(pdfStream)

    // Send email
    const emailHTML = emailSender.generateQuoteEmailHTML(
      quoteData.quoteNumber,
      quote.customerName,
      quote.total,
      companyInfo.name,
      quoteData.validUntil
    )

    const result = await sendPdfEmail(
      recipientEmail || quote.customerEmail,
      `Quote #${quoteData.quoteNumber} from ${companyInfo.name}`,
      emailHTML,
      pdfBuffer,
      `quote-${quoteData.quoteNumber}.pdf`
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Quote emailed successfully'
    })

  } catch (error) {
    console.error('Email quote error:', error)
    return NextResponse.json(
      { error: 'Failed to email quote' },
      { status: 500 }
    )
  }
}
