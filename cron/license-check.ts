import cron from 'node-cron'
import { connectDB } from '../lib/db'
import Company from '../lib/models/Company'
import User from '../lib/models/User'

/**
 * Daily license check - runs at 10 AM every day
 * Checks for expiring licenses and sends warnings
 */
export function startLicenseCheck() {
  cron.schedule('0 10 * * *', async () => {
    console.log('Running license check...')
    
    try {
      await connectDB()
      
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      
      // Find companies with licenses expiring in the next 30 days
      const expiringCompanies = await Company.find({
        licenseExpiry: { 
          $gte: today,
          $lte: thirtyDaysFromNow 
        }
      })
      
      if (expiringCompanies.length === 0) {
        console.log('No expiring licenses found')
        return
      }
      
      // Process each company
      for (const company of expiringCompanies) {
        // Get admin users for this company
        const adminUsers = await User.find({
          companyId: company._id,
          role: { $in: ['admin', 'manager'] }
        })
        
        if (adminUsers.length === 0) continue
        
        // Calculate days until expiry
        const daysUntilExpiry = Math.ceil((company.licenseExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        // Determine urgency level
        let urgencyLevel = 'low'
        let urgencyColor = '#3b82f6'
        let urgencyIcon = 'ℹ️'
        
        if (daysUntilExpiry <= 7) {
          urgencyLevel = 'critical'
          urgencyColor = '#dc2626'
          urgencyIcon = '🚨'
        } else if (daysUntilExpiry <= 14) {
          urgencyLevel = 'high'
          urgencyColor = '#f59e0b'
          urgencyIcon = '⚠️'
        } else if (daysUntilExpiry <= 21) {
          urgencyLevel = 'medium'
          urgencyColor = '#d97706'
          urgencyIcon = '⚠️'
        }
        
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${urgencyIcon} License Expiry Alert - ${company.name}</h2>
            <p>This is an automated alert from your Bizabode CRM system.</p>
            
            <div style="background-color: ${urgencyColor}15; border: 1px solid ${urgencyColor}; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: ${urgencyColor}; margin: 0 0 10px 0;">License Expiry Warning</h3>
              <p style="margin: 0 0 5px 0;"><strong>Current Plan:</strong> ${company.licensePlan}</p>
              <p style="margin: 0 0 5px 0;"><strong>License Key:</strong> ${company.licenseKey}</p>
              <p style="margin: 0 0 5px 0;"><strong>Expiry Date:</strong> ${company.licenseExpiry.toLocaleDateString()}</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${urgencyColor};">
                ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} remaining
              </p>
            </div>
            
            ${daysUntilExpiry <= 7 ? `
              <div style="background-color: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin: 0 0 10px 0;">🚨 URGENT ACTION REQUIRED</h3>
                <p style="margin: 0;">Your license expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}. Please renew immediately to avoid service interruption.</p>
              </div>
            ` : ''}
            
            <p>To renew your license, please contact Bizabode support or visit your license management page.</p>
            <p>Login to your CRM: <a href="${process.env.FRONTEND_URL}/license">Manage License</a></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated message from Bizabode CRM.<br>
              For license support, contact: support@bizabode.com
            </p>
          </div>
        `
        
        // Send email to all admin users
        for (const user of adminUsers) {
          try {
            await EmailService.sendMail({
              to: user.email,
              subject: `${urgencyIcon} License Expires in ${daysUntilExpiry} Days - ${company.name}`,
              html: emailContent
            })
            console.log(`License expiry alert sent to ${user.email} (${daysUntilExpiry} days remaining)`)
          } catch (error) {
            console.error(`Failed to send license expiry alert to ${user.email}:`, error)
          }
        }
      }
      
      console.log(`License check completed. Alerts sent for ${expiringCompanies.length} companies.`)
      
    } catch (error) {
      console.error('Error in license check:', error)
    }
  }, {
    timezone: process.env.CRON_TIMEZONE || 'UTC'
  })
  
  console.log('License check cron job scheduled (daily at 10 AM)')
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
