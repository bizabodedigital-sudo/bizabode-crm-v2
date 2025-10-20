import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { path } = await params
    const [companyId, type, entityId, fileName] = path

    // Verify user has access to this company's files
    if (companyId !== authResult.user.companyId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Construct file path
    const filePath = join(
      process.cwd(),
      'uploads',
      'companies',
      companyId,
      type,
      entityId,
      fileName
    )

    try {
      // Read file
      const fileBuffer = await readFile(filePath)
      
      // Determine content type based on file extension
      const extension = fileName.split('.').pop()?.toLowerCase()
      let contentType = 'application/octet-stream'
      
      switch (extension) {
        case 'pdf':
          contentType = 'application/pdf'
          break
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg'
          break
        case 'png':
          contentType = 'image/png'
          break
        case 'gif':
          contentType = 'image/gif'
          break
        case 'txt':
          contentType = 'text/plain'
          break
      }

      // Return file with appropriate headers
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        },
      })
    } catch (fileError) {
      console.error('File read error:', fileError)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('File serve error:', error)
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    )
  }
}
