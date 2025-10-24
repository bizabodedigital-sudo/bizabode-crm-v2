"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Filter, FileText, Download, Eye, Trash2, Upload, Search } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { api, endpoints } from '@/lib/api-client-config'
import { formatFileSize, formatDate } from '@/lib/utils/formatters'
import { getCategoryColor, getAccessLevelColor } from '@/lib/utils/status-colors'
import SearchInput from '@/components/shared/SearchInput'
import Loading from '@/components/shared/Loading'

interface Document {
  id: string
  companyId: string
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  category: string
  relatedTo: string
  relatedId?: string
  uploadedBy: {
    id: string
    name: string
    email: string
  }
  description?: string
  tags?: string[]
  isPublic: boolean
  accessLevel: string
  version: number
  isActive: boolean
  downloadCount: number
  lastAccessed?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export function DocumentsTable() {
  const { company } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [relatedToFilter, setRelatedToFilter] = useState('')
  const [accessLevelFilter, setAccessLevelFilter] = useState('')

  useEffect(() => {
    if (company?.id) {
      fetchDocuments()
    }
  }, [company?.id])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params: Record<string, string | number | boolean> = {
        companyId: company?.id || '',
        limit: 100
      }

      if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter
      if (relatedToFilter && relatedToFilter !== 'all') params.relatedTo = relatedToFilter
      if (accessLevelFilter && accessLevelFilter !== 'all') params.accessLevel = accessLevelFilter

      const response = await api.crm.documents.list(params)
      
      if (response.success) {
        setDocuments(response.data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Quote': return 'bg-blue-100 text-blue-800'
      case 'Invoice': return 'bg-green-100 text-green-800'
      case 'Delivery': return 'bg-orange-100 text-orange-800'
      case 'Payment': return 'bg-purple-100 text-purple-800'
      case 'Contract': return 'bg-pink-100 text-pink-800'
      case 'Other': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAccessLevelColor = (accessLevel: string) => {
    switch (accessLevel) {
      case 'Public': return 'bg-green-100 text-green-800'
      case 'Customer': return 'bg-blue-100 text-blue-800'
      case 'Internal': return 'bg-yellow-100 text-yellow-800'
      case 'Private': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️'
    return '📁'
  }

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Manage document attachments and file storage
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Document
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Quote">Quote</SelectItem>
              <SelectItem value="Invoice">Invoice</SelectItem>
              <SelectItem value="Delivery">Delivery</SelectItem>
              <SelectItem value="Payment">Payment</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={relatedToFilter} onValueChange={setRelatedToFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Related To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Opportunity">Opportunity</SelectItem>
              <SelectItem value="Customer">Customer</SelectItem>
              <SelectItem value="Quote">Quote</SelectItem>
              <SelectItem value="Order">Order</SelectItem>
              <SelectItem value="Invoice">Invoice</SelectItem>
              <SelectItem value="Activity">Activity</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
          <Select value={accessLevelFilter} onValueChange={setAccessLevelFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Access Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="Public">Public</SelectItem>
              <SelectItem value="Customer">Customer</SelectItem>
              <SelectItem value="Internal">Internal</SelectItem>
              <SelectItem value="Private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Related To</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Last Accessed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getFileIcon(document.mimeType)}</div>
                        <div>
                          <div className="font-medium">{document.originalName}</div>
                          {document.description && (
                            <div className="text-sm text-gray-500">{document.description}</div>
                          )}
                          {document.tags && document.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {document.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {document.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{document.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(document.category)}>
                        {document.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{document.relatedTo}</div>
                        {document.relatedId && (
                          <div className="text-xs text-gray-500">ID: {document.relatedId}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatFileSize(document.fileSize)}</div>
                      <div className="text-xs text-gray-500">{document.mimeType}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAccessLevelColor(document.accessLevel)}>
                        {document.accessLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{document.downloadCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{document.uploadedBy.name}</div>
                        <div className="text-xs text-gray-500">{formatDate(document.createdAt)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {document.lastAccessed ? (
                        <div className="text-sm">{formatDate(document.lastAccessed)}</div>
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
