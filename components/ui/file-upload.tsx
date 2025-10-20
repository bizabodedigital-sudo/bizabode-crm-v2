"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { X, Upload, File, Image, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface FileUploadProps {
  type: string
  entityId: string
  onUploadComplete?: (fileInfo: any) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  acceptedTypes?: string[]
  className?: string
}

interface UploadedFile {
  id: string
  name: string
  size: number
  url: string
  type: string
}

export function FileUpload({
  type,
  entityId,
  onUploadComplete,
  onUploadError,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'application/pdf', 'text/*'],
  className = ''
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    if (files.length + selectedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        
        // Validate file type
        const isValidType = acceptedTypes.some(acceptedType => {
          if (acceptedType.endsWith('/*')) {
            return file.type.startsWith(acceptedType.slice(0, -1))
          }
          return file.type === acceptedType
        })

        if (!isValidType) {
          toast.error(`File ${file.name} has an invalid type`)
          continue
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 10MB)`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        formData.append('entityId', entityId)

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()
        if (result.success) {
          const newFile: UploadedFile = {
            id: result.data.id,
            name: result.data.originalName,
            size: result.data.size,
            url: result.data.url,
            type: result.data.type
          }
          
          setFiles(prev => [...prev, newFile])
          onUploadComplete?.(result.data)
        }

        // Update progress
        setUploadProgress(((i + 1) / selectedFiles.length) * 100)
      }

      toast.success('Files uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error(errorMessage)
      onUploadError?.(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveFile = async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(
        `/api/files?type=${type}&entityId=${entityId}&fileName=${fileName}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.id !== fileId))
        toast.success('File removed successfully')
      } else {
        toast.error('Failed to remove file')
      }
    } catch (error) {
      console.error('Remove file error:', error)
      toast.error('Failed to remove file')
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    } else if (fileType === 'application/pdf') {
      return <FileText className="h-4 w-4" />
    } else {
      return <File className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || files.length >= maxFiles}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Files'}
        </Button>
        <span className="text-sm text-muted-foreground">
          {files.length}/{maxFiles} files
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading files...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(file.id, file.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
