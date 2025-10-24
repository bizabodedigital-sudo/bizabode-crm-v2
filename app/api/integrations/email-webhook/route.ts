import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Lead from '@/lib/models/Lead'
import User from '@/lib/models/User'
import { NotificationService } from '@/lib/services/notification-service'
import crypto from 'crypto'

// Email parsing utilities
function extractEmailAddress(emailString: string): string | null {
  const match = emailString.match(/<(.+?)>/)
  return match ? match[1] : emailString
}

function extractNameFromEmail(emailString: string): string {
  const match = emailString.match(/^(.+?)\s*<.+?>$/)
  return match ? match[1].trim() : ''
}

function extractPhoneFromText(text: string): string | null {
  // Common phone number patterns
  const phonePatterns = [
    /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, // US format
    /(\+?[0-9]{1,4}[-.\s]?)?\(?([0-9]{2,4})\)?[-.\s]?([0-9]{2,4})[-.\s]?([0-9]{2,4})/g, // International
    /(\+?[0-9]{10,15})/g // Simple 10+ digits
  ]
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[0].replace(/[-.\s()]/g, '') // Clean up formatting
    }
  }
  return null
}

function extractCompanyFromText(text: string): string | null {
  // Look for company indicators
  const companyIndicators = [
    /company[:\s]+(.+?)(?:\n|$)/i,
    /business[:\s]+(.+?)(?:\n|$)/i,
    /organization[:\s]+(.+?)(?:\n|$)/i,
    /firm[:\s]+(.+?)(?:\n|$)/i,
    /corp[:\s]+(.+?)(?:\n|$)/i,
    /inc[:\s]+(.+?)(?:\n|$)/i,
    /ltd[:\s]+(.+?)(?:\n|$)/i,
    /llc[:\s]+(.+?)(?:\n|$)/i
  ]
  
  for (const pattern of companyIndicators) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  return null
}

function categorizeInquiry(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('hotel') || lowerText.includes('hospitality')) return 'Hotel'
  if (lowerText.includes('supermarket') || lowerText.includes('grocery')) return 'Supermarket'
  if (lowerText.includes('restaurant') || lowerText.includes('food service')) return 'Restaurant'
  if (lowerText.includes('contractor') || lowerText.includes('construction')) return 'Contractor'
  
  return 'Other'
}

function extractProductInterest(text: string): string[] {
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

// Verify webhook signature (for SendGrid, Mailgun, etc.)
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  provider: 'sendgrid' | 'mailgun' | 'postmark' = 'sendgrid'
): boolean {
  try {
    switch (provider) {
      case 'sendgrid':
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(payload)
          .digest('base64')
        return crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(expectedSignature)
        )
      
      case 'mailgun':
        const [timestamp, token] = signature.split(',')
        const expectedToken = crypto
          .createHmac('sha256', secret)
          .update(timestamp + payload)
          .digest('hex')
        return crypto.timingSafeEqual(
          Buffer.from(token),
          Buffer.from(expectedToken)
        )
      
      case 'postmark':
        const expectedPostmarkSignature = crypto
          .createHmac('sha256', secret)
          .update(payload)
          .digest('hex')
        return crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(expectedPostmarkSignature)
        )
      
      default:
        return false
    }
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.text()
    const signature = request.headers.get('x-signature') || request.headers.get('x-hub-signature-256')
    const provider = request.headers.get('x-provider') as 'sendgrid' | 'mailgun' | 'postmark' || 'sendgrid'
    
    // Verify webhook signature if secret is provided
    const webhookSecret = process.env.EMAIL_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      if (!verifyWebhookSignature(body, signature, webhookSecret, provider)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
    
    let emailData: any
    
    try {
      emailData = JSON.parse(body)
    } catch (error) {
      // Try parsing as form data for some providers
      const formData = new URLSearchParams(body)
      emailData = {
        from: formData.get('from'),
        to: formData.get('to'),
        subject: formData.get('subject'),
        text: formData.get('text') || formData.get('body-plain'),
        html: formData.get('html') || formData.get('body-html')
      }
    }
    
    // Extract email information based on provider
    let fromEmail: string, fromName: string, subject: string, textContent: string, htmlContent: string
    
    switch (provider) {
      case 'sendgrid':
        const sendgridData = emailData[0] || emailData
        fromEmail = extractEmailAddress(sendgridData.from?.email || sendgridData.from)
        fromName = sendgridData.from?.name || extractNameFromEmail(sendgridData.from)
        subject = sendgridData.subject
        textContent = sendgridData.text || ''
        htmlContent = sendgridData.html || ''
        break
        
      case 'mailgun':
        fromEmail = extractEmailAddress(emailData.sender || emailData.from)
        fromName = extractNameFromEmail(emailData.sender || emailData.from)
        subject = emailData.subject
        textContent = emailData['body-plain'] || emailData.text || ''
        htmlContent = emailData['body-html'] || emailData.html || ''
        break
        
      case 'postmark':
        fromEmail = extractEmailAddress(emailData.From || emailData.from)
        fromName = extractNameFromEmail(emailData.From || emailData.from)
        subject = emailData.Subject || emailData.subject
        textContent = emailData.TextBody || emailData.text || ''
        htmlContent = emailData.HtmlBody || emailData.html || ''
        break
        
      default:
        fromEmail = extractEmailAddress(emailData.from)
        fromName = extractNameFromEmail(emailData.from)
        subject = emailData.subject
        textContent = emailData.text || ''
        htmlContent = emailData.html || ''
    }
    
    if (!fromEmail || !subject) {
      return NextResponse.json({ error: 'Missing required email fields' }, { status: 400 })
    }
    
    // Parse email content
    const fullText = `${textContent} ${htmlContent}`.replace(/<[^>]*>/g, ' ') // Strip HTML
    const phone = extractPhoneFromText(fullText)
    const company = extractCompanyFromText(fullText) || 'Unknown Company'
    const category = categorizeInquiry(fullText)
    const productInterest = extractProductInterest(fullText)
    
    // Get company ID from environment or determine from email domain
    const companyId = process.env.DEFAULT_PUBLIC_COMPANY_ID
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID not configured' }, { status: 500 })
    }
    
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
      name: fromName || fromEmail.split('@')[0],
      email: fromEmail,
      phone: phone || '',
      company: company,
      source: 'Email Inquiry',
      category: category,
      productInterest: productInterest,
      status: 'new',
      notes: `Email Subject: ${subject}\n\nContent: ${fullText.substring(0, 500)}...`,
      companyId,
      assignedTo
    })
    
    // Send notification to assigned sales rep
    if (assignedTo) {
      await NotificationService.sendNotification({
        userId: assignedTo,
        title: 'New Lead from Email',
        message: `New lead "${lead.name}" from ${lead.company} via email inquiry`,
        type: 'new_lead',
        priority: 'Medium',
        data: {
          leadId: lead._id,
          leadName: lead.name,
          leadCompany: lead.company,
          source: 'Email'
        },
        relatedLeadId: lead._id,
        sendEmail: true
      })
    }
    
    console.log(`Lead created from email: ${lead.name} (${lead.email})`)
    
    return NextResponse.json({
      success: true,
      message: 'Lead created successfully',
      leadId: lead._id
    })
    
  } catch (error) {
    console.error('Email webhook error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process email webhook' 
    }, { status: 500 })
  }
}

// Handle GET requests for webhook verification (some providers require this)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')
  const verifyToken = searchParams.get('verify_token')
  
  // Simple verification for webhook setup
  if (challenge) {
    return new NextResponse(challenge)
  }
  
  return NextResponse.json({ 
    success: true, 
    message: 'Email webhook endpoint is active' 
  })
}
