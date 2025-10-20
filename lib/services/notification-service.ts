import { EmailService } from './email-service'
import { Item } from '@/lib/models/Item'
import { Invoice } from '@/lib/models/Invoice'
import { User } from '@/lib/models/User'
import { connectDB } from '@/lib/db'

export class NotificationService {
  /**
   * Check for low stock items and send notifications
   */
  static async checkLowStockNotifications(): Promise<void> {
    try {
      await connectDB()
      
      // Find items with low stock
      const lowStockItems = await Item.find({
        $expr: {
          $lte: ['$quantity', '$reorderLevel']
        }
      }).populate('companyId', 'name')

      if (lowStockItems.length === 0) return

      // Get admin users for each company
      const companies = [...new Set(lowStockItems.map(item => item.companyId))]
      
      for (const company of companies) {
        const companyItems = lowStockItems.filter(item => 
          item.companyId.toString() === company._id.toString()
        )
        
        const admins = await User.find({
          companyId: company._id,
          role: { $in: ['admin', 'manager'] }
        })

        for (const admin of admins) {
          await this.sendLowStockEmail(admin.email, companyItems, company.name)
        }
      }
    } catch (error) {
      console.error('Error checking low stock notifications:', error)
    }
  }

  /**
   * Check for overdue invoices and send reminders
   */
  static async checkOverdueInvoices(): Promise<void> {
    try {
      await connectDB()
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Find overdue invoices
      const overdueInvoices = await Invoice.find({
        status: { $in: ['sent', 'partial'] },
        dueDate: { $lt: today }
      }).populate('companyId', 'name')

      if (overdueInvoices.length === 0) return

      // Group by company
      const companies = [...new Set(overdueInvoices.map(invoice => invoice.companyId))]
      
      for (const company of companies) {
        const companyInvoices = overdueInvoices.filter(invoice => 
          invoice.companyId.toString() === company._id.toString()
        )
        
        const admins = await User.find({
          companyId: company._id,
          role: { $in: ['admin', 'manager'] }
        })

        for (const admin of admins) {
          await this.sendOverdueInvoicesEmail(admin.email, companyInvoices, company.name)
        }
      }
    } catch (error) {
      console.error('Error checking overdue invoices:', error)
    }
  }

  /**
   * Send low stock notification email
   */
  private static async sendLowStockEmail(
    to: string,
    items: any[],
    companyName: string
  ): Promise<void> {
    try {
      const itemList = items.map(item => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.sku}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.reorderLevel}</td>
        </tr>
      `).join('')

      await EmailService['transporter'].sendMail({
        from: process.env.SMTP_FROM || "noreply@bizabode.com",
        to,
        subject: `Low Stock Alert - ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Low Stock Alert</h2>
            <p>The following items are running low on stock and may need to be reordered:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 8px; border: 1px solid #ddd;">Item Name</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">SKU</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Current Stock</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Reorder Level</th>
                </tr>
              </thead>
              <tbody>
                ${itemList}
              </tbody>
            </table>
            <p>Please review your inventory and consider placing purchase orders for these items.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>Bizabode CRM System</strong></p>
          </div>
        `,
      })
    } catch (error) {
      console.error('Error sending low stock email:', error)
    }
  }

  /**
   * Send overdue invoices notification email
   */
  private static async sendOverdueInvoicesEmail(
    to: string,
    invoices: any[],
    companyName: string
  ): Promise<void> {
    try {
      const invoiceList = invoices.map(invoice => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${invoice.invoiceNumber}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${invoice.customerName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">$${invoice.total.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${invoice.dueDate.toLocaleDateString()}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${Math.ceil((new Date().getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))} days</td>
        </tr>
      `).join('')

      await EmailService['transporter'].sendMail({
        from: process.env.SMTP_FROM || "noreply@bizabode.com",
        to,
        subject: `Overdue Invoices Alert - ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Overdue Invoices Alert</h2>
            <p>The following invoices are overdue and may require follow-up:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 8px; border: 1px solid #ddd;">Invoice #</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Customer</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Amount</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Due Date</th>
                  <th style="padding: 8px; border: 1px solid #ddd;">Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceList}
              </tbody>
            </table>
            <p>Please follow up with these customers to ensure timely payment.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>Bizabode CRM System</strong></p>
          </div>
        `,
      })
    } catch (error) {
      console.error('Error sending overdue invoices email:', error)
    }
  }

  /**
   * Send daily summary email to admins
   */
  static async sendDailySummary(to: string, companyName: string, summary: any): Promise<void> {
    try {
      await EmailService['transporter'].sendMail({
        from: process.env.SMTP_FROM || "noreply@bizabode.com",
        to,
        subject: `Daily Summary - ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Daily Business Summary</h2>
            <p>Here's your daily business summary for ${new Date().toLocaleDateString()}:</p>
            <ul>
              <li><strong>New Leads:</strong> ${summary.newLeads}</li>
              <li><strong>New Opportunities:</strong> ${summary.newOpportunities}</li>
              <li><strong>Quotes Sent:</strong> ${summary.quotesSent}</li>
              <li><strong>Invoices Created:</strong> ${summary.invoicesCreated}</li>
              <li><strong>Payments Received:</strong> $${summary.paymentsReceived.toFixed(2)}</li>
              <li><strong>Low Stock Items:</strong> ${summary.lowStockItems}</li>
            </ul>
            <p>Keep up the great work!</p>
            <br>
            <p>Best regards,</p>
            <p><strong>Bizabode CRM System</strong></p>
          </div>
        `,
      })
    } catch (error) {
      console.error('Error sending daily summary:', error)
    }
  }
}
