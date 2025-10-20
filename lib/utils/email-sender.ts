import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer | Blob
  }>
}

export class EmailSender {
  private transporter

  constructor() {
    // Configure email transporter
    // In production, use environment variables for email credentials
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'noreply@bizabode.com',
        pass: process.env.EMAIL_PASS || 'your-email-password'
      }
    })
  }

  async sendEmail(options: EmailOptions) {
    try {
      const mailOptions = {
        from: `"Bizabode CRM" <${process.env.EMAIL_USER || 'noreply@bizabode.com'}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments
      }

      const info = await this.transporter.sendMail(mailOptions)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('Email send error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
    }
  }

  generateInvoiceEmailHTML(invoiceNumber: string, customerName: string, total: number, companyName: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .amount { font-size: 24px; font-weight: bold; color: #4F46E5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${companyName}</h1>
          </div>
          <div class="content">
            <h2>Invoice #${invoiceNumber}</h2>
            <p>Dear ${customerName},</p>
            <p>Thank you for your business. Please find attached your invoice.</p>
            <p><strong>Amount Due:</strong> <span class="amount">$${total.toFixed(2)}</span></p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  generateQuoteEmailHTML(quoteNumber: string, customerName: string, total: number, companyName: string, validUntil: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .amount { font-size: 24px; font-weight: bold; color: #10B981; }
          .validity { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${companyName}</h1>
          </div>
          <div class="content">
            <h2>Quote #${quoteNumber}</h2>
            <p>Dear ${customerName},</p>
            <p>Thank you for your interest. Please find attached our quotation for your review.</p>
            <p><strong>Quote Amount:</strong> <span class="amount">$${total.toFixed(2)}</span></p>
            <div class="validity">
              <strong>⏰ Valid Until:</strong> ${new Date(validUntil).toLocaleDateString()}
            </div>
            <p>We look forward to working with you. Please let us know if you have any questions.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const emailSender = new EmailSender()
