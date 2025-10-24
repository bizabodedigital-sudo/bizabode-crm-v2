"use client"

import React, { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api-client-config'
import { formatDate } from '@/lib/utils/formatters'

interface DeliveryReceipt {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  uploadedAt: string
  uploadedBy: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  downloadUrl?: string
  previewUrl?: string
}

interface DeliveryReceiptUploadProps {
  orderId: string
  orderNumber: string
  onUploadComplete?: (receipt: DeliveryReceipt) => void
  onStatusUpdate?: (orderId: string, status: string) => void
  className?: string
}

export function DeliveryReceiptUpload({
  orderId,
  orderNumber,
  onUploadComplete,
  onStatusUpdate,
  className = ""
}: DeliveryReceiptUploadProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [receipts, setReceipts] = useState<DeliveryReceipt[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, GIF, or PDF file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('orderId', orderId)
      formData.append('orderNumber', orderNumber)

      const response = await api.post('/api/crm/delivery-receipts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      })

      if (response.success) {
        const newReceipt: DeliveryReceipt = {
          id: response.data.id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user?.name || 'Unknown',
          status: 'completed',
          downloadUrl: response.data.downloadUrl,
          previewUrl: response.data.previewUrl
        }

        setReceipts(prev => [...prev, newReceipt])
        
        toast({
          title: "Upload successful",
          description: "Delivery receipt uploaded successfully.",
        })

        onUploadComplete?.(newReceipt)
        onStatusUpdate?.(orderId, 'Delivered')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        title: "Upload failed",
        description: "Failed to upload delivery receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Receipt Upload</CardTitle>
          <CardDescription>
            Upload delivery receipt for order {orderNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploading...</p>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                  <p className="text-xs text-gray-500">{uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium">Drop your delivery receipt here</p>
                  <p className="text-sm text-gray-500">
                    or click to browse files
                  </p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={isUploading}
                >
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <p className="text-xs text-gray-500">
                  Supports JPEG, PNG, GIF, and PDF files up to 10MB
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Receipts */}
      {receipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Receipts</CardTitle>
            <CardDescription>
              Delivery receipts for this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(receipt.status)}
                    <div>
                      <p className="text-sm font-medium">{receipt.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(receipt.fileSize)} • {formatDate(receipt.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(receipt.status)}>
                      {receipt.status}
                    </Badge>
                    {receipt.previewUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(receipt.previewUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {receipt.downloadUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(receipt.downloadUrl, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setReceipts(prev => prev.filter(r => r.id !== receipt.id))
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Upload clear, readable photos or scanned copies of delivery receipts</p>
            <p>• Ensure the receipt shows the delivery date, customer signature, and order details</p>
            <p>• Supported formats: JPEG, PNG, GIF, PDF</p>
            <p>• Maximum file size: 10MB</p>
            <p>• Uploading a receipt will automatically update the order status to "Delivered"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
