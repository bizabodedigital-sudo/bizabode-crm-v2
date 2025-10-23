import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'
import path from 'path'
import fs from 'fs'

// Import diagnostic utilities (commented out to avoid webpack issues)
// import { quickPDFCheck } from './pdf-diagnostic'

// Helper function to register fonts
function registerFonts(doc: any) {
  try {
  const fontPath = path.join(process.cwd(), 'public', 'fonts')
    const regularFontPath = path.join(fontPath, 'OpenSans-Regular.ttf')
    const boldFontPath = path.join(fontPath, 'OpenSans-Bold.ttf')
    
    // Check if font files exist before registering
    const isDev = process.env.NODE_ENV !== 'production'
    
    if (fs.existsSync(regularFontPath)) {
      try {
        doc.registerFont('OpenSans', regularFontPath)
        if (isDev) console.log('OpenSans font registered successfully')
      } catch (fontError) {
        if (isDev) console.warn('Failed to register OpenSans font:', fontError)
      }
    } else {
      if (isDev) console.warn('OpenSans-Regular.ttf not found, will use built-in fonts')
    }
    
    if (fs.existsSync(boldFontPath)) {
      try {
        doc.registerFont('OpenSans-Bold', boldFontPath)
        if (isDev) console.log('OpenSans-Bold font registered successfully')
      } catch (fontError) {
        if (isDev) console.warn('Failed to register OpenSans-Bold font:', fontError)
      }
    } else {
      if (isDev) console.warn('OpenSans-Bold.ttf not found, will use built-in fonts')
    }
  } catch (error) {
    console.warn('Font registration failed, will use built-in fonts:', error)
  }
}

// Helper function to safely set fonts with fallbacks
function useFont(doc: any, fontName: string) {
  try {
    doc.font(fontName)
  } catch (error) {
    const fallback = fontName.includes('Bold') ? 'Helvetica-Bold' : 'Helvetica'
    const isDev = process.env.NODE_ENV !== 'production'
    if (isDev) {
      console.warn(`Font ${fontName} not available, falling back to ${fallback}`)
    }
    doc.font(fallback)
  }
}

// Legacy function for backward compatibility
function setFont(doc: any, fontName: string) {
  useFont(doc, fontName)
}

// PDF Generator class for server-side use
export class PDFGenerator {
  static async generateInvoicePDF(invoice: any, company: any): Promise<Buffer> {
    return generateInvoicePDF(invoice, company)
  }

  static async generateQuotePDF(quote: any, company: any): Promise<Buffer> {
    return generateQuotePDF(quote, company)
  }

  static async generatePayslipPDF(payroll: any, company: any): Promise<Buffer> {
    return generatePayslipPDF(payroll, company)
  }

  // Streaming versions for better performance
  static generateInvoicePDFStream(invoice: any, company: any): PassThrough {
    return generateInvoicePDFStream(invoice, company)
  }

  static generateQuotePDFStream(quote: any, company: any): PassThrough {
    return generateQuotePDFStream(quote, company)
  }

  static generatePayslipPDFStream(payroll: any, company: any): PassThrough {
    return generatePayslipPDFStream(payroll, company)
  }
}

// Client-side PDF utilities (browser-compatible)
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// Server-side PDF generation functions
export async function generateInvoicePDF(invoice: any, company: any): Promise<Buffer> {
  // Run quick diagnostic check (commented out to avoid webpack issues)
  console.log('🔍 Running PDFKit diagnostic check...')
  // quickPDFCheck()
  
  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 50,
    font: 'Helvetica' // Use built-in font by default
  })

  const buffers: Buffer[] = []
  doc.on('data', buffers.push.bind(buffers))

  return new Promise((resolve, reject) => {
    try {
      // CRITICAL: Set base font immediately after document creation
      console.log('Setting base Helvetica font to prevent .afm lookups')
      try {
        doc.font('Helvetica')
        console.log('Base Helvetica font set successfully')
      } catch (fontError) {
        console.warn('Helvetica fallback load skipped:', fontError)
      }
      
      // Register local fonts
      registerFonts(doc)
      
      // Set default font
      useFont(doc, 'OpenSans')
      
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })

      doc.on('error', reject)

    // Company header with logo
    if (company?.logo) {
      try {
        doc.image(company.logo, 50, 50, { width: 100, height: 50 })
      } catch (error) {
        console.log('Logo not found, continuing without logo')
      }
    }

    // Company information
    doc.fontSize(20)
    useFont(doc, 'OpenSans-Bold')
    doc.text(company?.name || 'Company Name', 200, 60)
    
    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    if (company?.address) {
      doc.text(company.address, 200, 85)
    }
    if (company?.phone) {
      doc.text(`Phone: ${company.phone}`, 200, 100)
    }
    if (company?.email) {
      doc.text(`Email: ${company.email}`, 200, 115)
    }

    // Invoice title
    doc.fontSize(24)
    useFont(doc, 'OpenSans-Bold')
    doc.text('INVOICE', 50, 150)

    // Invoice details
    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    doc.text(`Invoice #: ${invoice.invoiceNumber || 'N/A'}`, 50, 180)
    doc.text(`Date: ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}`, 50, 200)
    doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, 50, 220)

    // Customer information
    doc.text('Bill To:', 50, 260)
    doc.text(invoice.customerName || 'N/A', 50, 280)
    if (invoice.customerAddress) {
      doc.text(invoice.customerAddress, 50, 300)
    }
    if (invoice.customerEmail) {
      doc.text(invoice.customerEmail, 50, 320)
    }

    // Items table
    let yPosition = 360
    doc.fontSize(10)
    useFont(doc, 'OpenSans-Bold')
    
    // Table headers
    const colWidths = [200, 80, 80, 80]
    const headers = ['Description', 'Quantity', 'Rate', 'Amount']
    
    headers.forEach((header, index) => {
      const x = 50 + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0)
      doc.text(header, x, yPosition)
    })

    // Table rows
    yPosition += 20
    doc.fontSize(9)
    useFont(doc, 'OpenSans')
    
    if (invoice.items && Array.isArray(invoice.items)) {
      invoice.items.forEach((item: any) => {
        const rowData = [
          item.description || 'N/A',
          (item.quantity || 0).toString(),
          `$${(item.unitPrice || 0).toFixed(2)}`,
          `$${(item.total || 0).toFixed(2)}`
        ]

        rowData.forEach((data, colIndex) => {
          const x = 50 + colWidths.slice(0, colIndex).reduce((sum, width) => sum + width, 0)
          doc.text(data, x, yPosition)
        })

        yPosition += 15
      })
    } else {
      doc.text('No items found', 50, yPosition)
    }

    // Totals
    yPosition += 20
    doc.fontSize(12)
    useFont(doc, 'OpenSans-Bold')
    doc.text(`Subtotal: $${(invoice.subtotal || 0).toFixed(2)}`, 300, yPosition)
    if ((invoice.tax || 0) > 0) {
      yPosition += 20
      doc.text(`Tax: $${(invoice.tax || 0).toFixed(2)}`, 300, yPosition)
    }
    yPosition += 20
    doc.text(`Total: $${(invoice.total || 0).toFixed(2)}`, 300, yPosition)

    // Footer
    doc.fontSize(8)
    useFont(doc, 'OpenSans')
    doc.text('Generated by Bizabode CRM', 50, 750)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 300, 750)

    doc.end()
    } catch (error) {
      console.error('Invoice PDF generation error:', error)
      reject(new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

export async function generateQuotePDF(quote: any, company: any): Promise<Buffer> {
  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 50,
    font: 'Helvetica' // Use built-in font by default
  })

  const buffers: Buffer[] = []
  doc.on('data', buffers.push.bind(buffers))

  return new Promise((resolve, reject) => {
    try {
      // CRITICAL: Set base font immediately after document creation
      console.log('Setting base Helvetica font to prevent .afm lookups')
      try {
        doc.font('Helvetica')
        console.log('Base Helvetica font set successfully')
      } catch (fontError) {
        console.warn('Helvetica fallback load skipped:', fontError)
      }
      
      // Register local fonts
      registerFonts(doc)
      
      // Set default font
      useFont(doc, 'OpenSans')
      
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })

      doc.on('error', reject)

    // Company header with logo
    if (company?.logo) {
      try {
        doc.image(company.logo, 50, 50, { width: 100, height: 50 })
      } catch (error) {
        console.log('Logo not found, continuing without logo')
      }
    }

    // Company information
    doc.fontSize(20)
    useFont(doc, 'OpenSans-Bold')
    doc.text(company?.name || 'Company Name', 200, 60)
    
    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    if (company?.address) {
      doc.text(company.address, 200, 85)
    }
    if (company?.phone) {
      doc.text(`Phone: ${company.phone}`, 200, 100)
    }
    if (company?.email) {
      doc.text(`Email: ${company.email}`, 200, 115)
    }

    // Quote title
    doc.fontSize(24)
    useFont(doc, 'OpenSans-Bold')
    doc.text('QUOTATION', 50, 150)

    // Quote details
    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    doc.text(`Quote #: ${quote.quoteNumber}`, 50, 180)
    doc.text(`Date: ${new Date(quote.quoteDate).toLocaleDateString()}`, 50, 200)
    doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, 50, 220)

    // Customer information
    doc.text('Quote For:', 50, 260)
    doc.text(quote.customerName, 50, 280)
    if (quote.customerAddress) {
      doc.text(quote.customerAddress, 50, 300)
    }
    if (quote.customerEmail) {
      doc.text(quote.customerEmail, 50, 320)
    }

    // Items table
    let yPosition = 360
    doc.fontSize(10)
    useFont(doc, 'OpenSans-Bold')
    
    // Table headers
    const colWidths = [200, 80, 80, 80]
    const headers = ['Description', 'Quantity', 'Rate', 'Amount']
    
    headers.forEach((header, index) => {
      const x = 50 + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0)
      doc.text(header, x, yPosition)
    })

    // Table rows
    yPosition += 20
    doc.fontSize(9)
    useFont(doc, 'OpenSans')
    
    quote.items.forEach((item: any) => {
      const rowData = [
        item.description,
        item.quantity.toString(),
        `$${item.unitPrice.toFixed(2)}`,
        `$${item.total.toFixed(2)}`
      ]

      rowData.forEach((data, colIndex) => {
        const x = 50 + colWidths.slice(0, colIndex).reduce((sum, width) => sum + width, 0)
        doc.text(data, x, yPosition)
      })

      yPosition += 15
    })

    // Totals
    yPosition += 20
    doc.fontSize(12)
    useFont(doc, 'OpenSans-Bold')
    doc.text(`Subtotal: $${quote.subtotal.toFixed(2)}`, 300, yPosition)
    if (quote.tax > 0) {
      yPosition += 20
      doc.text(`Tax: $${quote.tax.toFixed(2)}`, 300, yPosition)
    }
    yPosition += 20
    doc.text(`Total: $${quote.total.toFixed(2)}`, 300, yPosition)

    // Footer
    doc.fontSize(8)
    useFont(doc, 'OpenSans')
    doc.text('Generated by Bizabode CRM', 50, 750)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 300, 750)

    doc.end()
    } catch (error) {
      console.error('Quote PDF generation error:', error)
      reject(new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

export async function generatePayslipPDF(payroll: any, company: any): Promise<Buffer> {
  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 50
    // Remove font specification to use default font
  })

  const buffers: Buffer[] = []
  doc.on('data', buffers.push.bind(buffers))

  return new Promise((resolve, reject) => {
    try {
      // CRITICAL: Set base font immediately after document creation
      console.log('Setting base Helvetica font to prevent .afm lookups')
      try {
        doc.font('Helvetica')
        console.log('Base Helvetica font set successfully')
      } catch (fontError) {
        console.warn('Helvetica fallback load skipped:', fontError)
      }
      
      // Register local fonts
      registerFonts(doc)
      
      // Set default font
      useFont(doc, 'OpenSans')
      
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })

      doc.on('error', reject)

    // Company header with logo
    if (company?.logo) {
      try {
        doc.image(company.logo, 50, 50, { width: 100, height: 50 })
      } catch (error) {
        console.log('Logo not found, continuing without logo')
      }
    }

    // Company information
    doc.fontSize(20)
    useFont(doc, 'OpenSans-Bold')
    doc.text(company?.name || 'Company Name', 200, 60)
    
    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    if (company?.address) {
      doc.text(company.address, 200, 85)
    }
    if (company?.phone) {
      doc.text(`Phone: ${company.phone}`, 200, 100)
    }
    if (company?.email) {
      doc.text(`Email: ${company.email}`, 200, 115)
    }

    // Payslip title
    doc.fontSize(24)
    useFont(doc, 'OpenSans-Bold')
    doc.text('PAYSLIP', 50, 150)

    // Pay period
    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    const payPeriodText = payroll.payPeriod ? 
      `${new Date(payroll.payPeriod.startDate).toLocaleDateString()} - ${new Date(payroll.payPeriod.endDate).toLocaleDateString()}` : 
      'Pay Period Not Available'
    doc.text(`Pay Period: ${payPeriodText}`, 50, 180)
    const payDateText = payroll.paymentDate ? 
      new Date(payroll.paymentDate).toLocaleDateString() : 
      'Not Paid'
    doc.text(`Pay Date: ${payDateText}`, 50, 200)

    // Employee information
    doc.fontSize(16)
    useFont(doc, 'OpenSans-Bold')
    doc.text('Employee Information', 50, 240)

    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    const employeeName = payroll.employeeId ? 
      `${payroll.employeeId.firstName || 'Unknown'} ${payroll.employeeId.lastName || 'Employee'}` : 
      'Unknown Employee'
    doc.text(`Name: ${employeeName}`, 50, 270)
    doc.text(`Position: ${payroll.employeeId?.position || 'N/A'}`, 50, 290)
    doc.text(`Department: ${payroll.employeeId?.department || 'N/A'}`, 50, 310)
    doc.text(`Employee ID: ${payroll.employeeId?._id || 'N/A'}`, 50, 330)

    // Payroll Items section
    doc.fontSize(16)
    useFont(doc, 'OpenSans-Bold')
    doc.text('Payroll Items', 50, 370)

    let yPosition = 400
    doc.fontSize(12)
    useFont(doc, 'OpenSans')

    // Display payroll items
    if (payroll.items && payroll.items.length > 0) {
      payroll.items.forEach((item: any) => {
        const amount = item.amount.toFixed(2)
        const prefix = item.type === 'deduction' ? '-' : '+'
        doc.text(item.description, 50, yPosition)
        doc.text(`${prefix}$${amount}`, 400, yPosition)
    yPosition += 20
      })
    } else {
      doc.text('No payroll items found', 50, yPosition)
      yPosition += 20
    }

    yPosition += 10

    // Summary
    useFont(doc, 'OpenSans-Bold')
    doc.text('Gross Pay', 50, yPosition)
    doc.text(`$${payroll.grossPay.toFixed(2)}`, 400, yPosition)
      yPosition += 20

    doc.text('Deductions', 50, yPosition)
    doc.text(`-$${payroll.deductions.toFixed(2)}`, 400, yPosition)
      yPosition += 20

    doc.fontSize(14)
    doc.text('Net Pay', 50, yPosition)
    doc.text(`$${payroll.netPay.toFixed(2)}`, 400, yPosition)
    yPosition += 30

    // Footer
    yPosition += 50
    doc.fontSize(10)
    useFont(doc, 'OpenSans')
    doc.text('This is a computer-generated payslip. No signature required.', 50, yPosition)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, yPosition + 20)

    doc.end()
    } catch (error) {
      console.error('Payslip PDF generation error:', error)
      reject(new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

// Streaming versions for better performance
export function generateInvoicePDFStream(invoice: any, company: any): PassThrough {
  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 50,
    font: 'Helvetica' // Use built-in font by default
  })
  const stream = new PassThrough()

  doc.pipe(stream)

  try {
    // Register local fonts
    registerFonts(doc)
    
    // Set default font
    useFont(doc, 'OpenSans')
    // Company header with logo
    if (company?.logo) {
      try {
        doc.image(company.logo, 50, 50, { width: 100, height: 50 })
      } catch (error) {
        console.log('Logo not found, continuing without logo')
      }
    }

    // Company information
    doc.fontSize(20)
    useFont(doc, 'OpenSans-Bold')
    doc.text(company?.name || 'Company Name', 200, 60)
    
    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    if (company?.address) {
      doc.text(company.address, 200, 85)
    }
    if (company?.phone) {
      doc.text(`Phone: ${company.phone}`, 200, 100)
    }
    if (company?.email) {
      doc.text(`Email: ${company.email}`, 200, 115)
    }

    // Invoice title
    doc.fontSize(24)
    useFont(doc, 'OpenSans-Bold')
    doc.text('INVOICE', 50, 150)

    // Invoice details
    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    doc.text(`Invoice #: ${invoice.invoiceNumber || 'N/A'}`, 50, 180)
    doc.text(`Date: ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}`, 50, 200)
    doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, 50, 220)

    // Customer information
    doc.text('Bill To:', 50, 260)
    doc.text(invoice.customerName || 'N/A', 50, 280)
    if (invoice.customerAddress) {
      doc.text(invoice.customerAddress, 50, 300)
    }
    if (invoice.customerEmail) {
      doc.text(invoice.customerEmail, 50, 320)
    }

    // Items table
    let yPosition = 360
    doc.fontSize(10)
    useFont(doc, 'OpenSans-Bold')
    
    // Table headers
    const colWidths = [200, 80, 80, 80]
    const headers = ['Description', 'Quantity', 'Rate', 'Amount']
    
    headers.forEach((header, index) => {
      const x = 50 + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0)
      doc.text(header, x, yPosition)
    })

    // Table rows
    yPosition += 20
    doc.fontSize(9)
    useFont(doc, 'OpenSans')
    
    if (invoice.items && Array.isArray(invoice.items)) {
      invoice.items.forEach((item: any) => {
        const rowData = [
          item.description || 'N/A',
          (item.quantity || 0).toString(),
          `$${(item.unitPrice || 0).toFixed(2)}`,
          `$${(item.total || 0).toFixed(2)}`
        ]

        rowData.forEach((data, colIndex) => {
          const x = 50 + colWidths.slice(0, colIndex).reduce((sum, width) => sum + width, 0)
          doc.text(data, x, yPosition)
        })

        yPosition += 15
      })
    } else {
      doc.text('No items found', 50, yPosition)
    }

    // Totals
    yPosition += 20
    doc.fontSize(12)
    useFont(doc, 'OpenSans-Bold')
    doc.text(`Subtotal: $${(invoice.subtotal || 0).toFixed(2)}`, 300, yPosition)
    if ((invoice.tax || 0) > 0) {
      yPosition += 20
      doc.text(`Tax: $${(invoice.tax || 0).toFixed(2)}`, 300, yPosition)
    }
    yPosition += 20
    doc.text(`Total: $${(invoice.total || 0).toFixed(2)}`, 300, yPosition)

    // Footer
    doc.fontSize(8)
    useFont(doc, 'OpenSans')
    doc.text('Generated by Bizabode CRM', 50, 750)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 300, 750)

    doc.end()
  } catch (error) {
    console.error('Invoice PDF stream generation error:', error)
    doc.end()
  }

  return stream
}

export function generateQuotePDFStream(quote: any, company: any): PassThrough {
  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 50,
    font: 'Helvetica' // Use built-in font by default
  })
  const stream = new PassThrough()

  doc.pipe(stream)

  try {
    // Register local fonts
    registerFonts(doc)
    
    // Set default font
    useFont(doc, 'OpenSans')
    // Company header with logo
    if (company?.logo) {
      try {
        doc.image(company.logo, 50, 50, { width: 100, height: 50 })
      } catch (error) {
        console.log('Logo not found, continuing without logo')
      }
    }

    // Company information
    doc.fontSize(20)
    useFont(doc, 'OpenSans-Bold')
    doc.text(company?.name || 'Company Name', 200, 60)
    
    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    if (company?.address) {
      doc.text(company.address, 200, 85)
    }
    if (company?.phone) {
      doc.text(`Phone: ${company.phone}`, 200, 100)
    }
    if (company?.email) {
      doc.text(`Email: ${company.email}`, 200, 115)
    }

    // Quote title
    doc.fontSize(24)
    useFont(doc, 'OpenSans-Bold')
    doc.text('QUOTATION', 50, 150)

    // Quote details
    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    doc.text(`Quote #: ${quote.quoteNumber || 'N/A'}`, 50, 180)
    doc.text(`Date: ${quote.quoteDate ? new Date(quote.quoteDate).toLocaleDateString() : 'N/A'}`, 50, 200)
    doc.text(`Valid Until: ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}`, 50, 220)

    // Customer information
    doc.text('Quote For:', 50, 260)
    doc.text(quote.customerName || 'N/A', 50, 280)
    if (quote.customerAddress) {
      doc.text(quote.customerAddress, 50, 300)
    }
    if (quote.customerEmail) {
      doc.text(quote.customerEmail, 50, 320)
    }

    // Items table
    let yPosition = 360
    doc.fontSize(10)
    useFont(doc, 'OpenSans-Bold')
    
    // Table headers
    const colWidths = [200, 80, 80, 80]
    const headers = ['Description', 'Quantity', 'Rate', 'Amount']
    
    headers.forEach((header, index) => {
      const x = 50 + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0)
      doc.text(header, x, yPosition)
    })

    // Table rows
    yPosition += 20
    doc.fontSize(9)
    useFont(doc, 'OpenSans')
    
    if (quote.items && Array.isArray(quote.items)) {
      quote.items.forEach((item: any) => {
        const rowData = [
          item.description || 'N/A',
          (item.quantity || 0).toString(),
          `$${(item.unitPrice || 0).toFixed(2)}`,
          `$${(item.total || 0).toFixed(2)}`
        ]

        rowData.forEach((data, colIndex) => {
          const x = 50 + colWidths.slice(0, colIndex).reduce((sum, width) => sum + width, 0)
          doc.text(data, x, yPosition)
        })

        yPosition += 15
      })
    } else {
      doc.text('No items found', 50, yPosition)
    }

    // Totals
    yPosition += 20
    doc.fontSize(12)
    useFont(doc, 'OpenSans-Bold')
    doc.text(`Subtotal: $${(quote.subtotal || 0).toFixed(2)}`, 300, yPosition)
    if ((quote.tax || 0) > 0) {
      yPosition += 20
      doc.text(`Tax: $${(quote.tax || 0).toFixed(2)}`, 300, yPosition)
    }
    yPosition += 20
    doc.text(`Total: $${(quote.total || 0).toFixed(2)}`, 300, yPosition)

    // Footer
    doc.fontSize(8)
    useFont(doc, 'OpenSans')
    doc.text('Generated by Bizabode CRM', 50, 750)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 300, 750)

    doc.end()
  } catch (error) {
    console.error('Quote PDF stream generation error:', error)
    doc.end()
  }

  return stream
}

export function generatePayslipPDFStream(payroll: any, company: any): PassThrough {
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const stream = new PassThrough()

  doc.pipe(stream)

  try {
    // Register local fonts
    registerFonts(doc)
    
    // Set default font
    useFont(doc, 'OpenSans')
    // Company header with logo
    if (company?.logo) {
      try {
        doc.image(company.logo, 50, 50, { width: 100, height: 50 })
      } catch (error) {
        console.log('Logo not found, continuing without logo')
      }
    }

    // Company information
    doc.fontSize(20)
    useFont(doc, 'OpenSans-Bold')
    doc.text(company?.name || 'Company Name', 200, 60)
    
    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    if (company?.address) {
      doc.text(company.address, 200, 85)
    }
    if (company?.phone) {
      doc.text(`Phone: ${company.phone}`, 200, 100)
    }
    if (company?.email) {
      doc.text(`Email: ${company.email}`, 200, 115)
    }

    // Payslip title
    doc.fontSize(24)
    useFont(doc, 'OpenSans-Bold')
    doc.text('PAYSLIP', 50, 150)

    // Pay period
    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    doc.text(`Pay Period: ${payroll.payPeriod || 'N/A'}`, 50, 180)
    doc.text(`Pay Date: ${payroll.payDate ? new Date(payroll.payDate).toLocaleDateString() : 'N/A'}`, 50, 200)

    // Employee information
    doc.fontSize(16)
    useFont(doc, 'OpenSans-Bold')
    doc.text('Employee Information', 50, 240)

    doc.fontSize(12)
    useFont(doc, 'OpenSans')
    doc.text(`Name: ${payroll.employeeId?.firstName || 'N/A'} ${payroll.employeeId?.lastName || 'N/A'}`, 50, 270)
    doc.text(`Position: ${payroll.employeeId?.position || 'N/A'}`, 50, 290)
    doc.text(`Department: ${payroll.employeeId?.department || 'N/A'}`, 50, 310)
    doc.text(`Employee ID: ${payroll.employeeId?._id || 'N/A'}`, 50, 330)

    // Earnings section
    doc.fontSize(16)
    useFont(doc, 'OpenSans-Bold')
    doc.text('Earnings', 50, 370)

    let yPosition = 400
    doc.fontSize(12)
    useFont(doc, 'OpenSans')

    // Basic Salary
    doc.text('Basic Salary', 50, yPosition)
    doc.text(`$${(payroll.earnings?.basicSalary || 0).toFixed(2)}`, 400, yPosition)
    yPosition += 20

    // Overtime
    if ((payroll.earnings?.overtime || 0) > 0) {
      doc.text('Overtime', 50, yPosition)
      doc.text(`$${(payroll.earnings.overtime || 0).toFixed(2)}`, 400, yPosition)
      yPosition += 20
    }

    // Bonuses
    if ((payroll.earnings?.bonuses || 0) > 0) {
      doc.text('Bonuses', 50, yPosition)
      doc.text(`$${(payroll.earnings.bonuses || 0).toFixed(2)}`, 400, yPosition)
      yPosition += 20
    }

    // Other Earnings
    if ((payroll.earnings?.other || 0) > 0) {
      doc.text('Other Earnings', 50, yPosition)
      doc.text(`$${(payroll.earnings.other || 0).toFixed(2)}`, 400, yPosition)
      yPosition += 20
    }

    // Total Earnings
    useFont(doc, 'OpenSans-Bold')
    doc.text('Total Earnings', 50, yPosition + 10)
    doc.text(`$${(payroll.earnings?.total || 0).toFixed(2)}`, 400, yPosition + 10)

    // Deductions section
    yPosition += 50
    doc.fontSize(16)
    useFont(doc, 'OpenSans-Bold')
    doc.text('Deductions', 50, yPosition)

    yPosition += 30
    doc.fontSize(12)
    useFont(doc, 'OpenSans')

    // Tax
    if ((payroll.deductions?.tax || 0) > 0) {
      doc.text('Income Tax', 50, yPosition)
      doc.text(`$${(payroll.deductions.tax || 0).toFixed(2)}`, 400, yPosition)
      yPosition += 20
    }

    // Social Security
    if ((payroll.deductions?.socialSecurity || 0) > 0) {
      doc.text('Social Security', 50, yPosition)
      doc.text(`$${(payroll.deductions.socialSecurity || 0).toFixed(2)}`, 400, yPosition)
      yPosition += 20
    }

    // Health Insurance
    if ((payroll.deductions?.healthInsurance || 0) > 0) {
      doc.text('Health Insurance', 50, yPosition)
      doc.text(`$${(payroll.deductions.healthInsurance || 0).toFixed(2)}`, 400, yPosition)
      yPosition += 20
    }

    // Other Deductions
    if ((payroll.deductions?.other || 0) > 0) {
      doc.text('Other Deductions', 50, yPosition)
      doc.text(`$${(payroll.deductions.other || 0).toFixed(2)}`, 400, yPosition)
      yPosition += 20
    }

    // Total Deductions
    useFont(doc, 'OpenSans-Bold')
    doc.text('Total Deductions', 50, yPosition + 10)
    doc.text(`$${(payroll.deductions?.total || 0).toFixed(2)}`, 400, yPosition + 10)

    // Net pay
    yPosition += 50
    doc.fontSize(18)
    useFont(doc, 'OpenSans-Bold')
    doc.text('NET PAY', 50, yPosition)
    doc.text(`$${(payroll.netPay || 0).toFixed(2)}`, 400, yPosition)

    // Footer
    doc.fontSize(10)
    useFont(doc, 'OpenSans')
    doc.text('This is a computer-generated payslip. No signature required.', 50, 750)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 770)

    doc.end()
  } catch (error) {
    console.error('Payslip PDF stream generation error:', error)
    doc.end()
  }

  return stream
}