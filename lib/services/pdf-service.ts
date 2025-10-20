import PDFDocument from "pdfkit"
import { IQuote } from "@/lib/models/Quote"
import { IInvoice } from "@/lib/models/Invoice"

export class PDFService {
  /**
   * Generate Quote PDF
   */
  static async generateQuotePDF(quote: IQuote, company: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 })
        const buffers: Buffer[] = []

        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers)
          resolve(pdfBuffer)
        })

        // Header
        doc.fontSize(20).text(company.name, 50, 50)
        doc.fontSize(10).text("Sales Quote", 50, 75)

        // Quote details
        doc.fontSize(12).text(`Quote #: ${quote.quoteNumber}`, 50, 120)
        doc.fontSize(10).text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 50, 140)
        doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`, 50, 155)

        // Customer details
        doc.fontSize(12).text("Bill To:", 50, 200)
        doc.fontSize(10).text(quote.customerName, 50, 220)
        doc.text(quote.customerEmail, 50, 235)
        if (quote.customerPhone) {
          doc.text(quote.customerPhone, 50, 250)
        }

        // Table header
        let y = 300
        doc.fontSize(10).fillColor("#000")
        doc.text("Item", 50, y)
        doc.text("Qty", 300, y)
        doc.text("Unit Price", 370, y)
        doc.text("Total", 470, y)

        // Line under header
        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke()

        // Items
        y += 25
        quote.items.forEach((item) => {
          doc.text(item.name, 50, y)
          doc.text(item.quantity.toString(), 300, y)
          doc.text(`$${item.unitPrice.toFixed(2)}`, 370, y)
          doc.text(`$${item.total.toFixed(2)}`, 470, y)
          y += 20
        })

        // Totals
        y += 20
        doc.moveTo(50, y).lineTo(550, y).stroke()
        y += 15

        doc.text("Subtotal:", 370, y)
        doc.text(`$${quote.subtotal.toFixed(2)}`, 470, y)
        y += 20

        doc.text("Tax:", 370, y)
        doc.text(`$${quote.tax.toFixed(2)}`, 470, y)
        y += 20

        if (quote.discount > 0) {
          doc.text("Discount:", 370, y)
          doc.text(`-$${quote.discount.toFixed(2)}`, 470, y)
          y += 20
        }

        doc.fontSize(12).text("Total:", 370, y)
        doc.text(`$${quote.total.toFixed(2)}`, 470, y)

        // Notes
        if (quote.notes) {
          y += 50
          doc.fontSize(10).text("Notes:", 50, y)
          doc.text(quote.notes, 50, y + 15, { width: 500 })
        }

        // Terms
        if (quote.terms) {
          y += 80
          doc.fontSize(10).text("Terms & Conditions:", 50, y)
          doc.fontSize(8).text(quote.terms, 50, y + 15, { width: 500 })
        }

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Generate Invoice PDF
   */
  static async generateInvoicePDF(invoice: IInvoice, company: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 })
        const buffers: Buffer[] = []

        doc.on("data", buffers.push.bind(buffers))
        doc.on("end", () => {
          const pdfBuffer = Buffer.concat(buffers)
          resolve(pdfBuffer)
        })

        // Header
        doc.fontSize(20).text(company.name, 50, 50)
        doc.fontSize(10).text("INVOICE", 50, 75).fillColor("#dc2626")

        // Invoice details
        doc.fillColor("#000").fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`, 50, 120)
        doc.fontSize(10).text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 140)
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 155)

        // Status badge
        const statusColors: Record<string, string> = {
          paid: "#10b981",
          sent: "#3b82f6",
          overdue: "#dc2626",
          draft: "#6b7280",
        }
        doc.fillColor(statusColors[invoice.status] || "#6b7280").text(`Status: ${invoice.status.toUpperCase()}`, 50, 170)

        // Customer details
        doc.fillColor("#000").fontSize(12).text("Bill To:", 50, 220)
        doc.fontSize(10).text(invoice.customerName, 50, 240)
        doc.text(invoice.customerEmail, 50, 255)
        if (invoice.customerPhone) {
          doc.text(invoice.customerPhone, 50, 270)
        }
        if (invoice.customerAddress) {
          doc.text(invoice.customerAddress, 50, 285)
        }

        // Table header
        let y = 330
        doc.fontSize(10).fillColor("#000")
        doc.text("Item", 50, y)
        doc.text("Qty", 300, y)
        doc.text("Unit Price", 370, y)
        doc.text("Total", 470, y)

        // Line under header
        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke()

        // Items
        y += 25
        invoice.items.forEach((item) => {
          doc.text(item.name, 50, y)
          if (item.description) {
            doc.fontSize(8).fillColor("#666").text(item.description, 50, y + 12)
            doc.fontSize(10).fillColor("#000")
            y += 12
          }
          doc.text(item.quantity.toString(), 300, y)
          doc.text(`$${item.unitPrice.toFixed(2)}`, 370, y)
          doc.text(`$${item.total.toFixed(2)}`, 470, y)
          y += 25
        })

        // Totals
        y += 20
        doc.moveTo(50, y).lineTo(550, y).stroke()
        y += 15

        doc.text("Subtotal:", 370, y)
        doc.text(`$${invoice.subtotal.toFixed(2)}`, 470, y)
        y += 20

        doc.text("Tax:", 370, y)
        doc.text(`$${invoice.tax.toFixed(2)}`, 470, y)
        y += 20

        if (invoice.discount > 0) {
          doc.text("Discount:", 370, y)
          doc.text(`-$${invoice.discount.toFixed(2)}`, 470, y)
          y += 20
        }

        doc.fontSize(12).text("Total:", 370, y)
        doc.text(`$${invoice.total.toFixed(2)}`, 470, y)
        y += 25

        if (invoice.paidAmount > 0) {
          doc.fontSize(10).text("Paid:", 370, y)
          doc.text(`-$${invoice.paidAmount.toFixed(2)}`, 470, y)
          y += 20

          const balance = invoice.total - invoice.paidAmount
          doc.fontSize(12).fillColor("#dc2626").text("Balance Due:", 370, y)
          doc.text(`$${balance.toFixed(2)}`, 470, y)
        }

        // Notes
        if (invoice.notes) {
          y += 50
          doc.fillColor("#000").fontSize(10).text("Notes:", 50, y)
          doc.text(invoice.notes, 50, y + 15, { width: 500 })
        }

        // Terms
        if (invoice.terms) {
          y += 80
          doc.fontSize(10).text("Terms & Conditions:", 50, y)
          doc.fontSize(8).text(invoice.terms, 50, y + 15, { width: 500 })
        }

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }
}

