import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lead from '@/lib/models/Lead'
import Activity from '@/lib/models/Activity'
import User from '@/lib/models/User'
import { NotificationService } from '@/lib/services/notification-service'
import crypto from 'crypto'

// WhatsApp message parsing utilities
function extractPhoneFromWhatsApp(phoneNumber: string): string {
  // Remove WhatsApp formatting and country codes
  return phoneNumber.replace(/[^\d]/g, '').replace(/^1/, '')
}

function extractNameFromWhatsApp(profileName: string, displayName: string): string {
  return profileName || displayName || 'Unknown'
}

function categorizeWhatsAppInquiry(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('hotel') || lowerText.includes('hospitality')) return 'Hotel'
  if (lowerText.includes('supermarket') || lowerText.includes('grocery')) return 'Supermarket'
  if (lowerText.includes('restaurant') || lowerText.includes('food service')) return 'Restaurant'
  if (lowerText.includes('contractor') || lowerText.includes('construction')) return 'Contractor'
  
  return 'Other'
}

function extractProductInterestFromWhatsApp(text: string): string[] {
  const products = []
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('container') || lowerText.includes('box')) products.push('Containers')
  if (lowerText.includes('cup') || lowerText.includes('mug')) products.push('Cups')
  if (lowerText.includes('paper') || lowerText.includes('tissue')) products.push('Paper Products')
  if (lowerText.includes('bag') || lowerText.includes('shopping')) products.push('Bags')
  if (lowerText.includes('plate') || lowerText.includes('dish')) products.push('Plates')
  if (lowerText.includes('utensil') || lowerText.includes('fork') || lowerText.includes('spoon')) products.push('Utensils')
  
  return products
}

// Verify WhatsApp webhook signature
function verifyWhatsAppSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error('WhatsApp webhook signature verification failed:', error)
    return false
  }
}

// Send WhatsApp message via Business API
async function sendWhatsAppMessage(
  to: string,
  message: string,
  accessToken: string,
  phoneNumberId: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        })
      }
    )
    
    return response.ok
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.text()
    const signature = request.headers.get('x-hub-signature-256')
    
    // Verify webhook signature
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      if (!verifyWhatsAppSignature(body, signature, webhookSecret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
    
    const webhookData = JSON.parse(body)
    
    // Handle WhatsApp webhook verification
    if (webhookData.object === 'whatsapp_business_account') {
      const mode = request.nextUrl.searchParams.get('hub.mode')
      const token = request.nextUrl.searchParams.get('hub.verify_token')
      const challenge = request.nextUrl.searchParams.get('hub.challenge')
      
      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return new NextResponse(challenge)
      }
    }
    
    // Process incoming messages
    if (webhookData.entry && webhookData.entry.length > 0) {
      for (const entry of webhookData.entry) {
        if (entry.changes && entry.changes.length > 0) {
          for (const change of entry.changes) {
            if (change.field === 'messages' && change.value.messages) {
              for (const message of change.value.messages) {
                await processWhatsAppMessage(message, change.value.metadata)
              }
            }
          }
        }
      }
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process WhatsApp webhook' 
    }, { status: 500 })
  }
}

async function processWhatsAppMessage(message: any, metadata: any) {
  try {
    const from = message.from
    const messageText = message.text?.body || ''
    const messageType = message.type
    const timestamp = message.timestamp
    
    // Skip if not a text message or if it's a system message
    if (messageType !== 'text' || !messageText.trim()) {
      return
    }
    
    // Get company ID
    const companyId = process.env.DEFAULT_PUBLIC_COMPANY_ID
    if (!companyId) {
      console.error('Company ID not configured for WhatsApp webhook')
      return
    }
    
    // Check if this is from an existing lead
    const existingLead = await Lead.findOne({
      phone: from,
      companyId
    })
    
    if (existingLead) {
      // Create activity for existing lead
      await Activity.create({
        companyId,
        type: 'WhatsApp',
        subject: 'WhatsApp Message',
        description: messageText,
        assignedTo: existingLead.assignedTo,
        status: 'Completed',
        completedDate: new Date(parseInt(timestamp) * 1000),
        leadId: existingLead._id,
        outcome: 'Positive'
      })
      
      // Send notification to assigned sales rep
      if (existingLead.assignedTo) {
        await NotificationService.sendNotification({
          userId: existingLead.assignedTo,
          title: 'WhatsApp Message from Lead',
          message: `${existingLead.name} sent a WhatsApp message`,
          type: 'customer_contact',
          priority: 'Medium',
          data: {
            leadId: existingLead._id,
            leadName: existingLead.name,
            message: messageText.substring(0, 100)
          },
          relatedLeadId: existingLead._id
        })
      }
      
      console.log(`WhatsApp activity logged for existing lead: ${existingLead.name}`)
    } else {
      // Create new lead from WhatsApp message
      const phone = extractPhoneFromWhatsApp(from)
      const category = categorizeWhatsAppInquiry(messageText)
      const productInterest = extractProductInterestFromWhatsApp(messageText)
      
      // Auto-assign lead to a sales rep
      const salesReps = await User.find({ 
        companyId, 
        role: { $in: ['sales', 'admin'] } 
      }).select('_id').lean()
      
      const assignedTo = salesReps.length > 0 
        ? salesReps[Math.floor(Math.random() * salesReps.length)]._id 
        : undefined
      
      // Create lead
      const lead = await Lead.create({
        name: `WhatsApp User ${phone.slice(-4)}`,
        email: `${phone}@whatsapp.local`, // Placeholder email
        phone: phone,
        company: 'Unknown Company',
        source: 'WhatsApp',
        category: category,
        productInterest: productInterest,
        status: 'new',
        notes: `WhatsApp message: ${messageText}`,
        companyId,
        assignedTo
      })
      
      // Create activity
      await Activity.create({
        companyId,
        type: 'WhatsApp',
        subject: 'Initial WhatsApp Contact',
        description: messageText,
        assignedTo: assignedTo,
        status: 'Completed',
        completedDate: new Date(parseInt(timestamp) * 1000),
        leadId: lead._id,
        outcome: 'Positive'
      })
      
      // Send notification to assigned sales rep
      if (assignedTo) {
        await NotificationService.sendNotification({
          userId: assignedTo,
          title: 'New Lead from WhatsApp',
          message: `New lead from WhatsApp: ${phone}`,
          type: 'new_lead',
          priority: 'Medium',
          data: {
            leadId: lead._id,
            phone: phone,
            message: messageText.substring(0, 100)
          },
          relatedLeadId: lead._id,
          sendEmail: true
        })
      }
      
      // Send auto-reply
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
      
      if (accessToken && phoneNumberId) {
        const autoReply = `Thank you for contacting us! We've received your message and will get back to you soon. Our team will review your inquiry and respond within 24 hours.`
        
        await sendWhatsAppMessage(from, autoReply, accessToken, phoneNumberId)
      }
      
      console.log(`New lead created from WhatsApp: ${phone}`)
    }
    
  } catch (error) {
    console.error('Error processing WhatsApp message:', error)
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge)
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'WhatsApp webhook endpoint is active' 
  })
}
