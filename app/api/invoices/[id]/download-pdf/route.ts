import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import Invoice from '@/lib/models/Invoice'
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
    const invoice = await Invoice.findOne({
      _id: resolvedParams.id,
      companyId: authResult.user.companyId
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const company = await Company.findById(authResult.user.companyId)

    console.log('Invoice found:', {
      id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      items: invoice.items?.length || 0,
      total: invoice.total
    })

    // Generate PDF
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber || `INV-${invoice._id.toString().slice(-8).toUpperCase()}`,
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

    console.log('Generating PDF with data:', {
      invoiceNumber: invoiceData.invoiceNumber,
      customerName: invoiceData.customerName,
      itemsCount: invoiceData.items?.length || 0,
      total: invoiceData.total
    })

    const pdfStream = PDFGenerator.generateInvoicePDFStream(invoiceData, companyInfo)

    console.log('PDF stream created successfully')

    // Convert Node stream to a web-compatible ReadableStream
    const readable = Readable.toWeb(pdfStream) as unknown as ReadableStream

    // Return PDF file as stream
    return new NextResponse(readable, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`
      }
    })

  } catch (error) {
    console.error('Download invoice PDF error:', error)
    return NextResponse.json(
      { error: `Failed to generate invoice PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
