import cron from 'node-cron'
import { connectDB } from '../lib/db'
import Invoice from '../lib/models/Invoice'
import User from '../lib/models/User'
import Task from '../lib/models/Task'
import Activity from '../lib/models/Activity'
import { NotificationService } from '../lib/services/notification-service'

/**
 * Daily overdue invoice check - runs at 9 AM every day
 * Checks for overdue invoices and sends reminders
 */
export function startOverdueInvoiceCheck() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running overdue invoice check...')
    
    try {
      await connectDB()
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Find all overdue invoices (status is 'sent' and due date is in the past)
      const overdueInvoices = await Invoice.find({
        status: { $in: ['sent', 'overdue'] },
        dueDate: { $lt: today }
      }).populate('companyId')
        .populate('customerId', 'companyName contactPerson email')
      
      if (overdueInvoices.length === 0) {
        console.log('No overdue invoices found')
        return
      }
      
      // Group by company
      const invoicesByCompany = overdueInvoices.reduce((acc, invoice) => {
        const companyId = invoice.companyId.toString()
        if (!acc[companyId]) {
          acc[companyId] = {
            company: invoice.companyId,
            invoices: []
          }
        }
        acc[companyId].invoices.push(invoice)
        return acc
      }, {} as Record<string, { company: any, invoices: any[] }>)
      
      // Process each company
      for (const [companyId, data] of Object.entries(invoicesByCompany)) {
        const company = (data as any).company
        const invoices = (data as any).invoices
        
        // Get admin users for this company
        const adminUsers = await User.find({
          companyId: companyId,
          role: { $in: ['admin', 'manager'] }
        })
        
        if (adminUsers.length === 0) continue
        
        // Calculate total overdue amount
        const totalOverdue = invoices.reduce((sum: number, invoice: any) => sum + invoice.total, 0)
        
        // Prepare email content with escalation levels
        const invoiceList = invoices.map((invoice: any) => {
          const daysOverdue = Math.floor((today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))
          let urgencyLevel = ''
          if (daysOverdue >= 30) urgencyLevel = '🔴 CRITICAL'
          else if (daysOverdue >= 14) urgencyLevel = '🟡 HIGH'
          else if (daysOverdue >= 7) urgencyLevel = '🟠 MEDIUM'
          else urgencyLevel = '🟢 LOW'
          
          return `• ${invoice.invoiceNumber} - $${invoice.total.toFixed(2)} (${daysOverdue} days overdue) ${urgencyLevel}`
        }).join('\n')
        
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Overdue Invoices Alert - ${company.name}</h2>
            <p>This is an automated alert from your Bizabode CRM system.</p>
            
            <div style="background-color: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin: 0 0 10px 0;">💰 Overdue Invoices (${invoices.length})</h3>
              <p style="margin: 0 0 10px 0;"><strong>Total Overdue Amount: $${totalOverdue.toFixed(2)}</strong></p>
              <pre style="margin: 0; white-space: pre-wrap;">${invoiceList}</pre>
            </div>
            
            <p>Please follow up with customers to collect payment.</p>
            <p>Login to your CRM: <a href="${process.env.FRONTEND_URL}/crm/invoices">View Invoices</a></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated message from Bizabode CRM.<br>
              To manage notification preferences, visit your account settings.
            </p>
          </div>
        `
        
        // Send email to all admin users
        for (const user of adminUsers) {
          try {
            await EmailService.sendMail({
              to: user.email,
              subject: `Overdue Invoices Alert - $${totalOverdue.toFixed(2)} outstanding`,
              html: emailContent
            })
            console.log(`Overdue invoice alert sent to ${user.email}`)
          } catch (error) {
            console.error(`Failed to send overdue invoice alert to ${user.email}:`, error)
          }
        }

          // Send in-app notifications
          for (const user of adminUsers) {
            try {
              await NotificationService.sendNotification({
                userId: user._id,
                title: 'Overdue Invoices Alert',
                message: `You have ${invoices.length} overdue invoices totaling $${totalOverdue.toFixed(2)}`,
                type: 'overdue_invoices',
                priority: 'High',
                data: {
                  invoiceCount: invoices.length,
                  totalAmount: totalOverdue,
                  companyId: companyId
                },
                sendEmail: true
              })
            } catch (error) {
              console.error(`Failed to send notification to user ${user._id}:`, error)
            }
          }

        // Create follow-up tasks for critical invoices (30+ days overdue)
        const criticalInvoices = invoices.filter((invoice: any) => {
          const daysOverdue = Math.floor((today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysOverdue >= 30
        })

        for (const invoice of criticalInvoices) {
          try {
            // Check if task already exists for this invoice
            const existingTask = await Task.findOne({
              companyId: companyId,
              relatedTo: 'Invoice',
              relatedId: invoice._id,
              type: 'Follow-up',
              status: { $in: ['Pending', 'In Progress'] }
            })

            if (!existingTask) {
              // Create urgent follow-up task
              const followUpTask = new Task({
                companyId: companyId,
                title: `URGENT: Collect payment for ${invoice.invoiceNumber}`,
                description: `Invoice ${invoice.invoiceNumber} is ${Math.floor((today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))} days overdue. Amount: $${invoice.total.toFixed(2)}. Customer: ${invoice.customerId?.companyName || 'Unknown'}`,
                type: 'Follow-up',
                relatedTo: 'Invoice',
                relatedId: invoice._id,
                assignedTo: adminUsers[0]._id, // Assign to first admin
                createdBy: adminUsers[0]._id,
                dueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Due in 1 day
                priority: 'Urgent',
                status: 'Pending',
                notes: `Auto-generated: Critical overdue invoice requiring immediate attention`
              })

              await followUpTask.save()

              // Create activity log
              await Activity.create({
                companyId: companyId,
                type: 'Note',
                subject: 'Critical Overdue Invoice',
                description: `Invoice ${invoice.invoiceNumber} is critically overdue and requires immediate follow-up`,
                assignedTo: adminUsers[0]._id,
                status: 'Completed',
                completedDate: new Date(),
                relatedInvoiceId: invoice._id
              })

              console.log(`Created urgent task for critical invoice: ${invoice.invoiceNumber}`)
            }
          } catch (error) {
            console.error(`Failed to create task for invoice ${invoice._id}:`, error)
          }
        }
        
        // Update invoice status to 'overdue' for invoices more than 7 days overdue
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        await Invoice.updateMany(
          {
            _id: { $in: invoices.filter((inv: any) => inv.dueDate < sevenDaysAgo).map((inv: any) => inv._id) },
            status: 'sent'
          },
          { status: 'overdue' }
        )
      }
      
      console.log(`Overdue invoice check completed. Alerts sent for ${Object.keys(invoicesByCompany).length} companies.`)
      
    } catch (error) {
      console.error('Error in overdue invoice check:', error)
    }
  }, {
    timezone: process.env.CRON_TIMEZONE || 'UTC'
  })
  
  console.log('Overdue invoice check cron job scheduled (daily at 9 AM)')
}

// Helper method to send custom emails
class EmailService {
  static async sendMail(options: { to: string, subject: string, html: string }) {
    const nodemailer = await import('nodemailer')
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@bizabode.com",
      ...options
    })
  }
}
