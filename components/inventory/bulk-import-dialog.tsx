"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Upload, Download, CheckCircle, XCircle, Loader2, FileText, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface ImportItem {
  sku: string
  name: string
  description?: string
  category: string
  quantity: number
  reorderLevel: number
  unitPrice: number
  costPrice?: number
  critical?: boolean
}

interface ImportResult {
  success: ImportItem[]
  errors: Array<{
    index: number
    sku: string
    error: string
  }>
  total: number
}

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BulkImportDialog({ open, onOpenChange, onSuccess }: BulkImportDialogProps) {
  const [csvData, setCsvData] = useState<string>("")
  const [parsedItems, setParsedItems] = useState<ImportItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload')
  const { toast } = useToast()
  const { company } = useAuth()

  const parseCSV = useCallback((csvText: string) => {
    try {
      const lines = csvText.trim().split('\n')
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header and one data row')
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const requiredHeaders = ['sku', 'name', 'category', 'quantity', 'reorderlevel', 'unitprice']
      
      // More flexible header matching
      const missingHeaders = requiredHeaders.filter(requiredHeader => {
        return !headers.some(header => {
          // Check for exact match or partial match
          return header === requiredHeader || 
                 header.includes(requiredHeader) || 
                 requiredHeader.includes(header) ||
                 // Handle common variations
                 (requiredHeader === 'reorderlevel' && (header.includes('reorder') || header.includes('level'))) ||
                 (requiredHeader === 'unitprice' && (header.includes('unit') || header.includes('price')))
        })
      })
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}. Found headers: ${headers.join(', ')}`)
      }

      // Find column indices for each required field
      const getColumnIndex = (fieldName: string) => {
        return headers.findIndex(header => {
          const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, '')
          const normalizedField = fieldName.toLowerCase().replace(/[^a-z]/g, '')
          return normalizedHeader === normalizedField || 
                 normalizedHeader.includes(normalizedField) ||
                 normalizedField.includes(normalizedHeader) ||
                 (fieldName === 'reorderlevel' && (normalizedHeader.includes('reorder') || normalizedHeader.includes('level'))) ||
                 (fieldName === 'unitprice' && (normalizedHeader.includes('unit') || normalizedHeader.includes('price')))
        })
      }

      const skuIndex = getColumnIndex('sku')
      const nameIndex = getColumnIndex('name')
      const categoryIndex = getColumnIndex('category')
      const quantityIndex = getColumnIndex('quantity')
      const reorderLevelIndex = getColumnIndex('reorderlevel')
      const unitPriceIndex = getColumnIndex('unitprice')
      const descriptionIndex = headers.findIndex(h => h.includes('description') || h.includes('desc'))
      const criticalIndex = headers.findIndex(h => h.includes('critical'))

      const items: ImportItem[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        
        if (values.length < Math.max(skuIndex, nameIndex, categoryIndex, quantityIndex, reorderLevelIndex, unitPriceIndex) + 1) {
          console.warn(`Skipping row ${i + 1}: insufficient columns`)
          continue
        }
        
        const item: ImportItem = {
          sku: values[skuIndex] || '',
          name: values[nameIndex] || '',
          category: values[categoryIndex] || '',
          quantity: parseInt(values[quantityIndex]) || 0,
          reorderLevel: parseInt(values[reorderLevelIndex]) || 0,
          unitPrice: parseFloat(values[unitPriceIndex]) || 0,
          description: descriptionIndex >= 0 ? (values[descriptionIndex] || '') : '',
          critical: criticalIndex >= 0 ? (values[criticalIndex]?.toLowerCase() === 'true') : false
        }
        
        // Validate required fields
        if (!item.sku || !item.name || !item.category) {
          console.warn(`Skipping row ${i + 1}: missing required fields`)
          continue
        }
        
        items.push(item)
      }
      
      setParsedItems(items)
      setCsvData(csvText)
    } catch (error) {
      console.error('CSV parsing error:', error)
      toast({
        title: "CSV Parsing Error",
        description: error instanceof Error ? error.message : "Failed to parse CSV",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      parseCSV(content)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (parsedItems.length === 0) {
      toast({
        title: "No items to import",
        description: "Please upload a CSV file first",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setStep('result')

    try {
      const response = await fetch('/api/inventory/items/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: parsedItems,
          companyId: company?.id,
          createdBy: localStorage.getItem('userId') || 'system'
        })
      })

      const result = await response.json()

      if (response.ok) {
        setImportResult(result.data)
        toast({
          title: "Import completed",
          description: `${result.data.success.length} items imported successfully`,
        })
        onSuccess()
      } else {
        throw new Error(result.message || 'Import failed')
      }
    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import items",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `SKU,Name,Category,Quantity,Reorder Level,Unit Price,Description,Critical
ITEM-001,Widget A,Electronics,100,10,25.99,High quality widget,false
ITEM-002,Gadget B,Electronics,50,5,15.50,Essential gadget,true
ITEM-003,Tool C,Hardware,25,3,45.00,Professional tool,false`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const loadTestData = () => {
    const testCSV = `SKU,Name,Category,Quantity,Reorder Level,Unit Price,Description,Critical
TEST-001,Test Item 1,Electronics,100,10,25.99,Test item 1,false
TEST-002,Test Item 2,Electronics,50,5,15.50,Test item 2,true
TEST-003,Test Item 3,Hardware,25,3,45.00,Test item 3,false`

    parseCSV(testCSV)
    toast({
      title: "Test data loaded",
      description: "Sample CSV data has been loaded for testing",
    })
  }

  const resetDialog = () => {
    setCsvData("")
    setParsedItems([])
    setImportResult(null)
    setStep('upload')
  }

  const handleClose = () => {
    resetDialog()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bulk Import Items
          </DialogTitle>
          <DialogDescription>
            Import multiple inventory items from a CSV file
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload CSV File</h3>
                <p className="text-muted-foreground mb-6">
                  Choose a CSV file with your inventory data
                </p>
                
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto mb-6"
                />
                
                <div className="flex gap-3 justify-center">
                  <Button onClick={downloadTemplate} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <Button onClick={loadTestData} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Load Test Data
                  </Button>
                </div>
              </div>

              {/* Format Information */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-medium mb-3">Required CSV Format</h4>
                <div className="text-sm text-muted-foreground mb-3">
                  Your CSV must include these columns: <strong>SKU, Name, Category, Quantity, Reorder Level, Unit Price</strong>
                </div>
                <div className="text-xs font-mono text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded border">
                  <div>SKU,Name,Category,Quantity,Reorder Level,Unit Price,Description,Critical</div>
                  <div>ITEM-001,Widget A,Electronics,100,10,25.99,High quality widget,false</div>
                  <div>ITEM-002,Gadget B,Electronics,50,5,15.50,Essential gadget,true</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                <Button 
                  onClick={() => {
                    if (parsedItems.length > 0) {
                      setStep('preview')
                    } else {
                      toast({
                        title: "No CSV file selected",
                        description: "Please upload a CSV file first",
                        variant: "destructive",
                      })
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  {parsedItems.length > 0 ? `Import ${parsedItems.length} Items` : 'Import Items'}
                </Button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Preview Items ({parsedItems.length})</h3>
                  <p className="text-sm text-muted-foreground">
                    Review the items before importing
                  </p>
                </div>
                <Button 
                  onClick={() => setStep('upload')} 
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Upload
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Critical</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedItems.slice(0, 10).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.reorderLevel}</TableCell>
                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          {item.critical ? (
                            <Badge variant="destructive">Critical</Badge>
                          ) : (
                            <Badge variant="secondary">Normal</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parsedItems.length > 10 && (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    ... and {parsedItems.length - 10} more items
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <Button 
                  onClick={() => setStep('upload')} 
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleImport}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Import {parsedItems.length} Items
                </Button>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Import Results</h3>
                <Button 
                  onClick={() => setStep('upload')} 
                  variant="outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Import More
                </Button>
              </div>

              {isUploading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
                  <p className="text-muted-foreground">Importing items...</p>
                </div>
              ) : importResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <div className="text-2xl font-bold text-green-600">{importResult.success.length}</div>
                      <div className="text-sm text-muted-foreground">Successfully Imported</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <XCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
                      <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <FileText className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{importResult.total}</div>
                      <div className="text-sm text-muted-foreground">Total Items</div>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 border-b">
                        <h4 className="font-medium text-red-800 dark:text-red-200">Import Errors</h4>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="p-3 border-b last:border-b-0 text-sm">
                            <div className="font-medium">Row {error.index + 1}: {error.sku}</div>
                            <div className="text-red-600 dark:text-red-400">{error.error}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}