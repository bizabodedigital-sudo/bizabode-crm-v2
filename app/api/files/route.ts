import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat, unlink } from 'fs/promises'
import { join } from 'path'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const entityId = searchParams.get('entityId')

    if (!type || !entityId) {
      return NextResponse.json({ 
        error: 'Type and entityId are required' 
      }, { status: 400 })
    }

    // Construct directory path
    const dirPath = join(
      process.cwd(),
      'uploads',
      'companies',
      authResult.user.companyId,
      type,
      entityId
    )

    try {
      const files = await readdir(dirPath)
      const fileList = []

      for (const file of files) {
        const filePath = join(dirPath, file)
        const stats = await stat(filePath)
        
        fileList.push({
          name: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          url: `/api/files/serve/${authResult.user.companyId}/${type}/${entityId}/${file}`
        })
      }

      return NextResponse.json({
        success: true,
        data: fileList
      })
    } catch (error) {
      // Directory doesn't exist, return empty list
      return NextResponse.json({
        success: true,
        data: []
      })
    }
  } catch (error) {
    console.error('List files error:', error)
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const entityId = searchParams.get('entityId')
    const fileName = searchParams.get('fileName')

    if (!type || !entityId || !fileName) {
      return NextResponse.json({ 
        error: 'Type, entityId, and fileName are required' 
      }, { status: 400 })
    }

    // Construct file path
    const filePath = join(
      process.cwd(),
      'uploads',
      'companies',
      authResult.user.companyId,
      type,
      entityId,
      fileName
    )

    try {
      await unlink(filePath)
      
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      })
    } catch (error) {
      console.error('Delete file error:', error)
      return NextResponse.json({ 
        error: 'File not found or could not be deleted' 
      }, { status: 404 })
    }
  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
