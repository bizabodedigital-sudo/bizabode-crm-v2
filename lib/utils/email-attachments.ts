/**
 * Standardized email attachment utilities for PDF and file attachments
 * Handles Buffer/string conversion and proper encoding for Nodemailer
 */

import { EmailService } from '@/lib/services/email-service'

interface EmailAttachmentOptions {
  filename: string
  contentType?: string
  encoding?: 'base64' | 'utf-8'
}

/**
 * Sends an email with a PDF attachment
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - Email HTML content
 * @param pdfBuffer - PDF buffer (Buffer or base64 string)
 * @param filename - PDF filename
 * @param fromEmail - Sender email (optional)
 * @returns Promise with success/error result
 */
export async function sendPdfEmail(
  to: string,
  subject: string,
  html: string,
  pdfBuffer: Buffer | string,
  filename: string,
  fromEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailSender = new EmailService()
    
    // Convert string to Buffer if needed
    const buffer = typeof pdfBuffer === 'string' 
      ? Buffer.from(pdfBuffer, 'base64')
      : pdfBuffer

    const result = await (emailSender as any).sendEmail({
      to,
      subject,
      html,
      from: fromEmail,
      attachments: [{
        filename,
        content: buffer,
        contentType: 'application/pdf'
      }]
    })

    return result
  } catch (error) {
    console.error('PDF email error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send PDF email'
    }
  }
}

/**
 * Sends an email with multiple file attachments
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - Email HTML content
 * @param attachments - Array of file attachments
 * @param fromEmail - Sender email (optional)
 * @returns Promise with success/error result
 */
export async function sendEmailWithAttachments(
  to: string,
  subject: string,
  html: string,
  attachments: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
    encoding?: 'base64' | 'utf-8'
  }>,
  fromEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const emailSender = new EmailService()
    
    // Process attachments to ensure proper Buffer format
    const processedAttachments = attachments.map(attachment => ({
      filename: attachment.filename,
      content: typeof attachment.content === 'string' 
        ? Buffer.from(attachment.content, attachment.encoding || 'base64')
        : attachment.content,
      contentType: attachment.contentType || 'application/octet-stream'
    }))

    const result = await (emailSender as any).sendEmail({
      to,
      subject,
      html,
      from: fromEmail,
      attachments: processedAttachments
    })

    return result
  } catch (error) {
    console.error('Email with attachments error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email with attachments'
    }
  }
}

/**
 * Creates a properly formatted attachment object for Nodemailer
 * @param filename - Attachment filename
 * @param content - File content (Buffer or string)
 * @param options - Additional attachment options
 * @returns Formatted attachment object
 */
export function createAttachment(
  filename: string,
  content: Buffer | string,
  options: Partial<EmailAttachmentOptions> = {}
): {
  filename: string
  content: Buffer
  contentType?: string
  encoding?: string
} {
  const {
    contentType = 'application/octet-stream',
    encoding = 'base64'
  } = options

  return {
    filename,
    content: typeof content === 'string' 
      ? Buffer.from(content, encoding)
      : content,
    contentType,
    encoding: typeof content === 'string' ? encoding : undefined
  }
}

/**
 * Detects content type based on file extension
 * @param filename - The filename to analyze
 * @returns MIME type string
 */
export function detectAttachmentContentType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'txt':
      return 'text/plain'
    case 'csv':
      return 'text/csv'
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'zip':
      return 'application/zip'
    default:
      return 'application/octet-stream'
  }
}
