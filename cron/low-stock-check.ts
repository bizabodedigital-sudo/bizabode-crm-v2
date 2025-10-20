import cron from 'node-cron'
import { connectDB } from '../lib/db'
import Item from '../lib/models/Item'
import nodemailer from 'nodemailer'

/**
 * Daily low stock check - runs at 8 AM every day
 * Checks for items below reorder level and sends alerts
 */
export function startLowStockCheck() {
  cron.schedule('0 8 * * *', async () => {
    console.log('Running low stock check...')
    
    try {
      await connectDB()
      
      // Find all items below reorder level
      const lowStockItems = await Item.find({
        quantity: { $lte: { $expr: '$reorderLevel' } },
        isActive: true
      }).populate('companyId')
      
      if (lowStockItems.length === 0) {
        console.log('No low stock items found')
        return
      }
      
      // Group by company
      const itemsByCompany = lowStockItems.reduce((acc, item) => {
        const companyId = item.companyId.toString()
        if (!acc[companyId]) {
          acc[companyId] = {
            company: item.companyId,
            items: []
          }
        }
        acc[companyId].items.push(item)
        return acc
      }, {} as Record<string, { company: any, items: any[] }>)
      
      // Send email alerts for each company
      for (const [companyId, data] of Object.entries(itemsByCompany)) {
        const company = (data as any).company
        const items = (data as any).items
        
        // Get admin users for this company
        const User = (await import('../lib/models/User')).default
        const adminUsers = await User.find({
          companyId: companyId,
          role: { $in: ['admin', 'manager'] }
        })
        
        if (adminUsers.length === 0) continue
        
        // Prepare email content
        const itemList = items.map((item: any) => 
          `• ${item.name} (SKU: ${item.sku}) - ${item.quantity} remaining (Reorder at: ${item.reorderLevel})`
        ).join('\n')
        
        const criticalItems = items.filter((item: any) => item.critical)
        const criticalList = criticalItems.map((item: any) => 
          `• ${item.name} (SKU: ${item.sku}) - CRITICAL ITEM OUT OF STOCK!`
        ).join('\n')
        
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Low Stock Alert - ${company.name}</h2>
            <p>This is an automated alert from your Bizabode CRM system.</p>
            
            ${criticalItems.length > 0 ? `
              <div style="background-color: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin: 0 0 10px 0;">🚨 CRITICAL ITEMS OUT OF STOCK</h3>
                <pre style="margin: 0; white-space: pre-wrap;">${criticalList}</pre>
              </div>
            ` : ''}
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #d97706; margin: 0 0 10px 0;">⚠️ Low Stock Items (${items.length})</h3>
              <pre style="margin: 0; white-space: pre-wrap;">${itemList}</pre>
            </div>
            
            <p>Please review your inventory and place orders as needed.</p>
            <p>Login to your CRM: <a href="${process.env.FRONTEND_URL}/inventory">View Inventory</a></p>
            
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
              to: user.email,
              subject: `Low Stock Alert - ${items.length} items need attention`,
              html: emailContent
            })
            console.log(`Low stock alert sent to ${user.email}`)
          } catch (error) {
            console.error(`Failed to send low stock alert to ${user.email}:`, error)
          }
        }
      }
      
      console.log(`Low stock check completed. Alerts sent for ${Object.keys(itemsByCompany).length} companies.`)
      
    } catch (error) {
      console.error('Error in low stock check:', error)
    }
  }, {
    timezone: process.env.CRON_TIMEZONE || 'UTC'
  })
  
  console.log('Low stock check cron job scheduled (daily at 8 AM)')
}

