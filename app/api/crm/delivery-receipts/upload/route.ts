import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SalesOrder from '@/lib/models/SalesOrder'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const orderId = formData.get('orderId') as string
    const orderNumber = formData.get('orderNumber') as string
    
    if (!file || !orderId) {
      return NextResponse.json({ 
        error: 'Missing required fields: file, orderId' 
      }, { status: 400 })
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.' 
      }, { status: 400 })
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }
    
    // Check if order exists
    const order = await SalesOrder.findById(orderId)
    if (!order) {
      return NextResponse.json({ 
        error: 'Order not found' 
      }, { status: 404 })
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'delivery-receipts')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    
    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${orderNumber}-${uuidv4()}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // Update order with delivery receipt
    const receiptData = {
      fileName: file.name,
      filePath: `/uploads/delivery-receipts/${fileName}`,
      uploadedAt: new Date(),
      uploadedBy: session.user.id,
      fileSize: file.size,
      fileType: file.type
    }
    
    // Add receipt to order's deliveryReceipts array
    order.deliveryReceipts = order.deliveryReceipts || []
    order.deliveryReceipts.push(receiptData)
    
    // Update order status to delivered
    order.status = 'Delivered'
    order.deliveredAt = new Date()
    
    await order.save()
    
    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const downloadUrl = `${baseUrl}/uploads/delivery-receipts/${fileName}`
    const previewUrl = file.type.startsWith('image/') 
      ? downloadUrl 
      : `${baseUrl}/api/crm/delivery-receipts/preview/${fileName}`
    
    return NextResponse.json({
      success: true,
      data: {
        id: uuidv4(),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        downloadUrl,
        previewUrl: file.type.startsWith('image/') ? previewUrl : undefined,
        uploadedAt: new Date().toISOString(),
        uploadedBy: session.user.name || 'Unknown'
      }
    })
    
  } catch (error) {
    console.error('Delivery receipt upload error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to upload delivery receipt' 
    }, { status: 500 })
  }
}
