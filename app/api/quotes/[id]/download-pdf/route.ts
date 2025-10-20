import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import Quote from '@/lib/models/Quote'
import Company from '@/lib/models/Company'
import { PDFGenerator } from '@/lib/utils/pdf-generator'
import { Readable } from 'stream'

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

    const resolvedParams = await params
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
      quoteNumber: quote.quoteNumber || `QUO-${quote._id.toString().slice(-8).toUpperCase()}`,
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

    const pdfStream = PDFGenerator.generateQuotePDFStream(quoteData, companyInfo)

    // Convert Node stream to a web-compatible ReadableStream
    const readable = Readable.toWeb(pdfStream) as unknown as ReadableStream

    // Return PDF file as stream
    return new NextResponse(readable, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quote-${quoteData.quoteNumber}.pdf"`
      }
    })

  } catch (error) {
    console.error('Download quote PDF error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quote PDF' },
      { status: 500 }
    )
  }
}
