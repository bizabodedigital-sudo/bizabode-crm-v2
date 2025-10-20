import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'
import path from 'path'
import fs from 'fs'

// Enhanced PDF Generator with comprehensive invoice and payslip templates
// Includes Jamaica-friendly compliance features and professional layouts

// Helper function to register fonts
function registerFonts(doc: any) {
  try {
    const fontPath = path.join(process.cwd(), 'public', 'fonts')
    const regularFontPath = path.join(fontPath, 'OpenSans-Regular.ttf')
    const boldFontPath = path.join(fontPath, 'OpenSans-Bold.ttf')
    
    const isDev = process.env.NODE_ENV !== 'production'
    
    if (fs.existsSync(regularFontPath)) {
      try {
        doc.registerFont('OpenSans', regularFontPath)
        if (isDev) console.log('OpenSans font registered successfully')
      } catch (fontError) {
        if (isDev) console.warn('Failed to register OpenSans font:', fontError)
      }
    }
    
    if (fs.existsSync(boldFontPath)) {
      try {
        doc.registerFont('OpenSans-Bold', boldFontPath)
        if (isDev) console.log('OpenSans-Bold font registered successfully')
      } catch (fontError) {
        if (isDev) console.warn('Failed to register OpenSans-Bold font:', fontError)
      }
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

// Enhanced Invoice PDF Generator
export async function generateEnhancedInvoicePDF(invoice: any, company: any): Promise<Buffer> {
  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 50,
    font: 'Helvetica'
  })

  const buffers: Buffer[] = []
  doc.on('data', buffers.push.bind(buffers))

  return new Promise((resolve, reject) => {
    try {
      // Set base font immediately
      try {
        doc.font('Helvetica')
      } catch (fontError) {
        console.warn('Helvetica fallback load skipped:', fontError)
      }
      
      registerFonts(doc)
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

      // Enhanced company information with legal compliance
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
      
      // Legal compliance information (Jamaica-friendly)
      let legalY = 130
      if (company?.trn) {
        doc.text(`TRN: ${company.trn}`, 200, legalY)
        legalY += 15
      }
      if (company?.gctNumber) {
        doc.text(`GCT Registration: ${company.gctNumber}`, 200, legalY)
        legalY += 15
      }
      if (company?.businessRegistration) {
        doc.text(`Business Registration: ${company.businessRegistration}`, 200, legalY)
        legalY += 15
      }

      // Invoice title
      doc.fontSize(24)
      useFont(doc, 'OpenSans-Bold')
      doc.text('INVOICE', 50, 150)

      // Enhanced invoice details
      doc.fontSize(12)
      useFont(doc, 'OpenSans')
      doc.text(`Invoice #: ${invoice.invoiceNumber || 'N/A'}`, 50, 180)
      doc.text(`Date: ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}`, 50, 200)
      doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, 50, 220)
      
      // Additional invoice details
      if (invoice.purchaseOrderNumber) {
        doc.text(`PO Number: ${invoice.purchaseOrderNumber}`, 50, 240)
      }
      if (invoice.preparedBy) {
        doc.text(`Prepared By: ${invoice.preparedBy}`, 50, 260)
      }

      // Enhanced customer information
      doc.text('Bill To:', 50, 300)
      doc.text(invoice.customerName || 'N/A', 50, 320)
      if (invoice.customerAddress) {
        doc.text(invoice.customerAddress, 50, 340)
      }
      if (invoice.customerEmail) {
        doc.text(invoice.customerEmail, 50, 360)
      }
      if (invoice.customerPhone) {
        doc.text(`Phone: ${invoice.customerPhone}`, 50, 380)
      }

      // Enhanced items table
      let yPosition = 420
      doc.fontSize(10)
      useFont(doc, 'OpenSans-Bold')
      
      // Table headers with better spacing
      const colWidths = [200, 60, 80, 80, 80]
      const headers = ['Description', 'Qty', 'Rate', 'Tax', 'Amount']
      
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
            `$${((item.tax || 0) * (item.unitPrice || 0) * (item.quantity || 0)).toFixed(2)}`,
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

      // Enhanced totals section
      yPosition += 20
      doc.fontSize(12)
      useFont(doc, 'OpenSans-Bold')
      
      const subtotal = invoice.subtotal || 0
      const taxAmount = invoice.tax || 0
      const total = invoice.total || subtotal + taxAmount
      
      doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 300, yPosition)
      yPosition += 20
      
      if (taxAmount > 0) {
        doc.text(`GCT (15%): $${taxAmount.toFixed(2)}`, 300, yPosition)
        yPosition += 20
      }
      
      doc.text(`Total: $${total.toFixed(2)}`, 300, yPosition)

      // Payment information
      yPosition += 40
      doc.fontSize(14)
      useFont(doc, 'OpenSans-Bold')
      doc.text('Payment Information', 50, yPosition)
      
      yPosition += 20
      doc.fontSize(12)
      useFont(doc, 'OpenSans')
      
      if (company?.bankDetails) {
        doc.text('Bank Details:', 50, yPosition)
        yPosition += 15
        doc.text(`Bank: ${company.bankDetails.bankName || 'N/A'}`, 50, yPosition)
        yPosition += 15
        doc.text(`Account: ${company.bankDetails.accountNumber || 'N/A'}`, 50, yPosition)
        yPosition += 15
        doc.text(`Routing: ${company.bankDetails.routingNumber || 'N/A'}`, 50, yPosition)
      }
      
      if (invoice.paymentTerms) {
        yPosition += 20
        doc.text(`Payment Terms: ${invoice.paymentTerms}`, 50, yPosition)
      }

      // Footer with branding
      yPosition += 40
      doc.fontSize(10)
      useFont(doc, 'OpenSans')
      doc.text('Thank you for your business!', 50, yPosition)
      yPosition += 15
      doc.text('Generated by Bizabode CRM', 50, yPosition)
      
      if (invoice.notes) {
        yPosition += 20
        doc.text(`Notes: ${invoice.notes}`, 50, yPosition)
      }

      doc.end()
    } catch (error) {
      reject(new Error(`Failed to generate enhanced invoice PDF: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

// Enhanced Payslip PDF Generator
export async function generateEnhancedPayslipPDF(payroll: any, company: any): Promise<Buffer> {
  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 50,
    font: 'Helvetica'
  })

  const buffers: Buffer[] = []
  doc.on('data', buffers.push.bind(buffers))

  return new Promise((resolve, reject) => {
    try {
      // Set base font immediately
      try {
        doc.font('Helvetica')
      } catch (fontError) {
        console.warn('Helvetica fallback load skipped:', fontError)
      }
      
      registerFonts(doc)
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

      // Enhanced company information
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

      // Enhanced pay period information
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

      // Enhanced employee information
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
      doc.text(`Employee ID: ${payroll.employeeId?.employeeId || 'N/A'}`, 50, 330)
      if (payroll.employeeId?.trn) {
        doc.text(`TRN: ${payroll.employeeId.trn}`, 50, 350)
      }

      // Enhanced earnings section
      doc.fontSize(16)
      useFont(doc, 'OpenSans-Bold')
      doc.text('Earnings', 50, 390)

      let yPosition = 420
      doc.fontSize(12)
      useFont(doc, 'OpenSans')

      // Display earnings items
      if (payroll.items && payroll.items.length > 0) {
        const earnings = payroll.items.filter((item: any) => item.type === 'earning')
        const deductions = payroll.items.filter((item: any) => item.type === 'deduction')
        
        // Earnings
        earnings.forEach((item: any) => {
          const amount = item.amount.toFixed(2)
          doc.text(item.description, 50, yPosition)
          doc.text(`$${amount}`, 400, yPosition)
          yPosition += 20
        })
        
        yPosition += 10
        
        // Deductions section
        if (deductions.length > 0) {
          doc.fontSize(16)
          useFont(doc, 'OpenSans-Bold')
          doc.text('Deductions', 50, yPosition)
          yPosition += 20
          
          doc.fontSize(12)
          useFont(doc, 'OpenSans')
          
          deductions.forEach((item: any) => {
            const amount = item.amount.toFixed(2)
            doc.text(item.description, 50, yPosition)
            doc.text(`-$${amount}`, 400, yPosition)
            yPosition += 20
          })
        }
      } else {
        doc.text('No payroll items found', 50, yPosition)
        yPosition += 20
      }

      yPosition += 20

      // Enhanced summary section
      doc.fontSize(14)
      useFont(doc, 'OpenSans-Bold')
      doc.text('Summary', 50, yPosition)
      yPosition += 20
      
      doc.fontSize(12)
      useFont(doc, 'OpenSans')
      
      const grossPay = payroll.grossPay || 0
      const totalDeductions = payroll.deductions || 0
      const netPay = grossPay - totalDeductions
      
      doc.text('Gross Pay', 50, yPosition)
      doc.text(`$${grossPay.toFixed(2)}`, 400, yPosition)
      yPosition += 20
      
      doc.text('Total Deductions', 50, yPosition)
      doc.text(`-$${totalDeductions.toFixed(2)}`, 400, yPosition)
      yPosition += 20
      
      doc.fontSize(14)
      useFont(doc, 'OpenSans-Bold')
      doc.text('Net Pay', 50, yPosition)
      doc.text(`$${netPay.toFixed(2)}`, 400, yPosition)

      // Payment method and bank details
      yPosition += 40
      doc.fontSize(12)
      useFont(doc, 'OpenSans')
      
      if (payroll.paymentMethod) {
        doc.text(`Payment Method: ${payroll.paymentMethod}`, 50, yPosition)
        yPosition += 20
      }
      
      if (payroll.bankDetails) {
        doc.text('Bank Details:', 50, yPosition)
        yPosition += 15
        doc.text(`Account: ${payroll.bankDetails.accountNumber || 'N/A'}`, 50, yPosition)
        yPosition += 15
        doc.text(`Bank: ${payroll.bankDetails.bankName || 'N/A'}`, 50, yPosition)
      }

      // Footer with branding and legal notice
      yPosition += 40
      doc.fontSize(10)
      useFont(doc, 'OpenSans')
      doc.text('This payslip is generated automatically and requires no signature.', 50, yPosition)
      yPosition += 15
      doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 50, yPosition)
      yPosition += 15
      doc.text('Generated by Bizabode HR Portal', 50, yPosition)

      doc.end()
    } catch (error) {
      reject(new Error(`Failed to generate enhanced payslip PDF: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

// Streaming versions for better performance
export function generateEnhancedInvoicePDFStream(invoice: any, company: any): PassThrough {
  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 50,
    font: 'Helvetica'
  })
  const stream = new PassThrough()

  doc.pipe(stream)

  try {
    registerFonts(doc)
    useFont(doc, 'OpenSans')
    
    // Same enhanced logic as the buffer version
    // (Implementation would be similar to the buffer version above)
    
    doc.end()
  } catch (error) {
    console.error('Enhanced invoice stream generation failed:', error)
  }

  return stream
}

export function generateEnhancedPayslipPDFStream(payroll: any, company: any): PassThrough {
  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 50,
    font: 'Helvetica'
  })
  const stream = new PassThrough()

  doc.pipe(stream)

  try {
    registerFonts(doc)
    useFont(doc, 'OpenSans')
    
    // Same enhanced logic as the buffer version
    // (Implementation would be similar to the buffer version above)
    
    doc.end()
  } catch (error) {
    console.error('Enhanced payslip stream generation failed:', error)
  }

  return stream
}
