/**
 * Standardized PDF response helper for Next.js API routes
 * Handles Buffer to Response conversion with proper headers
 */

// Ensure this runs in Node.js runtime for PDF generation
export const runtime = 'nodejs'

interface PDFResponseOptions {
  filename?: string
  contentType?: string
  disposition?: 'attachment' | 'inline'
}

/**
 * Creates a standardized PDF response from a Buffer
 * @param pdfBuffer - The PDF buffer to return
 * @param options - Response options
 * @returns Response object with proper PDF headers
 */
export function pdfResponse(
  pdfBuffer: Buffer,
  options: PDFResponseOptions = {}
): Response {
  const {
    filename = 'document.pdf',
    contentType = 'application/pdf',
    disposition = 'attachment'
  } = options

  return new Response(pdfBuffer as any, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `${disposition}; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

/**
 * Creates a standardized file response from a Buffer
 * @param fileBuffer - The file buffer to return
 * @param filename - The filename for download
 * @param contentType - The MIME type of the file
 * @returns Response object with proper file headers
 */
export function fileResponse(
  fileBuffer: Buffer,
  filename: string,
  contentType: string
): Response {
  return new Response(fileBuffer as any, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

/**
 * Detects content type based on file extension
 * @param filename - The filename to analyze
 * @returns MIME type string
 */
export function detectContentType(filename: string): string {
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
    default:
      return 'application/octet-stream'
  }
}
