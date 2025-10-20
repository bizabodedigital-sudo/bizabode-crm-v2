import nodemailer from "nodemailer"

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  /**
   * Send quote email to customer
   */
  static async sendQuoteEmail(
    to: string,
    quoteNumber: string,
    pdfBuffer: Buffer,
    customerName: string,
    companyName: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@bizabode.com",
        to,
        subject: `Quote ${quoteNumber} from ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${customerName},</h2>
            <p>Thank you for your interest in our products/services.</p>
            <p>Please find attached your quote <strong>${quoteNumber}</strong>.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>${companyName}</strong></p>
          </div>
        `,
        attachments: [
          {
            filename: `Quote-${quoteNumber}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      })
    } catch (error) {
      console.error("Error sending quote email:", error)
      throw new Error("Failed to send quote email")
    }
  }

  /**
   * Send invoice email to customer
   */
  static async sendInvoiceEmail(
    to: string,
    invoiceNumber: string,
    pdfBuffer: Buffer,
    customerName: string,
    companyName: string,
    amount: number,
    dueDate: Date
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@bizabode.com",
        to,
        subject: `Invoice ${invoiceNumber} from ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${customerName},</h2>
            <p>Thank you for your business!</p>
            <p>Please find attached invoice <strong>${invoiceNumber}</strong> for the amount of <strong>$${amount.toFixed(2)}</strong>.</p>
            <p>Payment is due by <strong>${dueDate.toLocaleDateString()}</strong>.</p>
            <p>If you have any questions regarding this invoice, please contact us.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>${companyName}</strong></p>
          </div>
        `,
        attachments: [
          {
            filename: `Invoice-${invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      })
    } catch (error) {
      console.error("Error sending invoice email:", error)
      throw new Error("Failed to send invoice email")
    }
  }

  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmationEmail(
    to: string,
    invoiceNumber: string,
    amount: number,
    customerName: string,
    companyName: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@bizabode.com",
        to,
        subject: `Payment Confirmation - Invoice ${invoiceNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${customerName},</h2>
            <p>This is to confirm that we have received your payment of <strong>$${amount.toFixed(2)}</strong> for invoice <strong>${invoiceNumber}</strong>.</p>
            <p>Thank you for your prompt payment!</p>
            <br>
            <p>Best regards,</p>
            <p><strong>${companyName}</strong></p>
          </div>
        `,
      })
    } catch (error) {
      console.error("Error sending payment confirmation email:", error)
      throw new Error("Failed to send payment confirmation email")
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(to: string, resetToken: string, userName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@bizabode.com",
        to,
        subject: "Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${userName},</h2>
            <p>You requested to reset your password.</p>
            <p>Please click the link below to reset your password:</p>
            <p><a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>Bizabode CRM Team</strong></p>
          </div>
        `,
      })
    } catch (error) {
      console.error("Error sending password reset email:", error)
      throw new Error("Failed to send password reset email")
    }
  }
}

