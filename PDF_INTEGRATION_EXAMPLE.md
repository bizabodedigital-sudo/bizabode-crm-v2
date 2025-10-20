# PDF Generator Integration Example

This example shows how to properly integrate the bulletproof PDF generator with Next.js API routes.

## Example API Route: Invoice PDF Download

```typescript
// app/api/invoices/[id]/download-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import Invoice from '@/lib/models/Invoice'
import Company from '@/lib/models/Company'
import { generateInvoicePDFStream } from '@/lib/utils/pdf-generator'

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

    // Prepare invoice data
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
      notes: invoice.notes
    }

    const companyInfo = {
      name: company?.name || 'My Company',
      logo: company?.logo,
      address: company?.address,
      phone: company?.phone,
      email: company?.email,
      website: company?.website
    }

    // Generate PDF stream
    const pdfStream = generateInvoicePDFStream(invoiceData, companyInfo)

    // Return PDF with proper headers
    return new NextResponse(pdfStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoiceData.invoiceNumber}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Invoice PDF generation error:', error)
    return NextResponse.json(
      { error: `Failed to generate invoice PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
```

## Example API Route: Payslip PDF Download

```typescript
// app/api/payroll/[id]/payslip/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import Payroll from '@/lib/models/Payroll'
import Company from '@/lib/models/Company'
import { generatePayslipPDF } from '@/lib/utils/pdf-generator'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Get payroll record with employee and company data
    const payroll = await Payroll.findOne({
      _id: params.id,
      companyId: authResult.user.companyId
    })
      .populate('employeeId', 'firstName lastName email position department')
      .lean()

    if (!payroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }

    const company = await Company.findById(authResult.user.companyId)

    // Generate payslip PDF
    const pdfBuffer = await generatePayslipPDF(payroll, company)

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="payslip-${payroll.employeeId?.firstName || 'Unknown'}-${payroll.employeeId?.lastName || 'Employee'}-${payroll.payPeriod?.startDate || 'Unknown'}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
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
```

## Frontend Integration Example

```typescript
// components/invoices/invoices-table.tsx
const handleDownloadPDF = async (invoice: Invoice) => {
  try {
    const { apiClient } = await import("@/lib/api-client")
    
    const blob = await apiClient.getInvoicePDF((invoice as any)._id || invoice.id)
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoice.invoiceNumber}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: `Invoice PDF downloaded successfully`,
    })
  } catch (error) {
    console.error('Failed to download PDF:', error)
    toast({
      title: "Error",
      description: `Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive",
    })
  }
}
```

## Key Features of This Implementation

### ✅ Bulletproof Font Handling
- **Built-in fonts by default**: Uses Helvetica/Helvetica-Bold as fallbacks
- **Custom fonts when available**: Uses OpenSans TTF files when present
- **No .afm dependencies**: Completely eliminates Helvetica.afm errors
- **Graceful degradation**: Works in all deployment environments

### ✅ Production-Ready Error Handling
- **Comprehensive logging**: Detailed error messages for debugging
- **Environment-aware logging**: Reduces noise in production
- **Proper HTTP status codes**: 401, 404, 500 with appropriate messages
- **Stream error handling**: Catches and reports PDF generation failures

### ✅ Optimized for All Deployment Targets
- **Vercel**: Works with serverless functions
- **Docker**: Works in containerized environments
- **Node.js servers**: Works in traditional server deployments
- **Next.js**: Optimized for Next.js API routes

### ✅ Performance Optimizations
- **Streaming support**: Uses PassThrough streams for large PDFs
- **Memory efficient**: Doesn't load entire PDF into memory
- **Proper headers**: Sets correct Content-Type and disposition
- **Caching headers**: Prevents unwanted caching of generated PDFs

## Deployment Checklist

- ✅ No external font dependencies
- ✅ Works in development and production
- ✅ Compatible with Vercel, Docker, and traditional servers
- ✅ Proper error handling and logging
- ✅ Memory efficient streaming
- ✅ Correct HTTP headers
- ✅ Environment-aware logging
